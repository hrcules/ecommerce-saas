import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import MercadoPagoConfig, { Payment } from "mercadopago";

import { db } from "@/db";
import {
  orderTable,
  orderItemTable,
  productVariantTable,
  storeTable,
  user,
  notificationTable,
} from "@/db/schema";
import {
  sendCustomerReceiptEmail,
  sendStoreOwnerNotificationEmail,
} from "@/lib/email";
import { formatCentsToBRL } from "@/helpers/money";

export const POST = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return new NextResponse("storeId ausente na URL do Webhook", {
        status: 400,
      });
    }

    const store = await db.query.storeTable.findFirst({
      where: eq(storeTable.id, storeId),
    });

    if (!store || !store.mpAccessToken) {
      return new NextResponse(
        "Loja não encontrada ou Mercado Pago não configurado",
        { status: 400 },
      );
    }

    // 1. Lemos o corpo da requisição que o MP enviou
    const body = await request.json();

    // O MP pode enviar o ID em locais diferentes dependendo do tipo de notificação (IPN ou Webhook)
    const paymentId = body?.data?.id || body?.id;

    if (!paymentId) {
      return new NextResponse("ID de pagamento não encontrado no payload", {
        status: 400,
      });
    }

    // 2. Inicializamos o SDK do MP para buscar os dados reais e seguros
    const client = new MercadoPagoConfig({ accessToken: store.mpAccessToken });
    const payment = new Payment(client);

    const mpPayment = await payment.get({ id: paymentId });
    const orderId = mpPayment.external_reference;

    if (!orderId) {
      console.log(
        "⚠️ Pagamento recebido, mas sem external_reference (orderId). Ignorando...",
      );
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    // ==========================================
    // CENÁRIO 1: PIX PAGO COM SUCESSO! 🟢
    // ==========================================
    if (mpPayment.status === "approved") {
      console.log(
        `🟢 [WEBHOOK MP] Pagamento Aprovado para a loja: ${store.name}`,
      );

      // Atualiza o banco
      await db
        .update(orderTable)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(orderTable.id, orderId));

      try {
        const order = await db.query.orderTable.findFirst({
          where: eq(orderTable.id, orderId),
          with: { shippingAddress: true },
        });

        // Se já estiver pago antes (pelo short-polling do frontend), evitamos mandar e-mail duplicado
        if (order?.status === "paid") {
          return NextResponse.json({ received: true });
        }

        const emailOrderItems = await db.query.orderItemTable.findMany({
          where: eq(orderItemTable.orderId, orderId),
          with: { productVariant: { with: { product: true } } },
        });

        if (order && order.shippingAddress) {
          const owner = await db.query.user.findFirst({
            where: eq(user.id, store.ownerId),
          });

          const subtotalInCents = emailOrderItems.reduce(
            (acc, item) => acc + item.priceInCents * item.quantity,
            0,
          );
          const freteInCents = order.totalPriceInCents - subtotalInCents;

          const formattedItems = emailOrderItems.map((item) => ({
            name: `${item.productVariant.product.name} (${item.productVariant.name})`,
            quantity: item.quantity,
            priceFormatted: formatCentsToBRL(item.priceInCents * item.quantity),
          }));

          const formattedSubtotal = formatCentsToBRL(subtotalInCents);
          const formattedShipping = formatCentsToBRL(freteInCents);
          const formattedTotal = formatCentsToBRL(order.totalPriceInCents);

          await sendCustomerReceiptEmail(
            order.shippingAddress.email,
            order.shippingAddress.fullName,
            order.orderNumber,
            store.name,
            formattedItems,
            formattedSubtotal,
            formattedShipping,
            formattedTotal,
          );

          if (owner && owner.email) {
            await sendStoreOwnerNotificationEmail(
              owner.email,
              order.orderNumber,
              store.name,
              formattedItems,
              formattedSubtotal,
              formattedShipping,
              formattedTotal,
            );

            await db.insert(notificationTable).values({
              userId: owner.id,
              title: "💰 Nova Venda Realizada!",
              message: `O pedido #${order.orderNumber} no valor de ${formattedTotal} acabou de ser pago via PIX.`,
              type: "sale",
            });
          }
        }
      } catch (error) {
        console.error("❌ Erro no envio de e-mails do MP:", error);
      }
    }

    // ==========================================
    // CENÁRIO 2: PIX EXPIRADO OU CANCELADO! 🔴
    // ==========================================
    else if (
      mpPayment.status === "cancelled" ||
      mpPayment.status === "rejected"
    ) {
      console.log(
        `🔴 [WEBHOOK MP] PIX Expirado/Cancelado. Estornando estoque...`,
      );

      const order = await db.query.orderTable.findFirst({
        where: eq(orderTable.id, orderId),
      });

      // Só estorna se o pedido ainda estiver pendente (evita estorno de algo já processado errado)
      if (order && order.status === "pending") {
        await db
          .update(orderTable)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(orderTable.id, orderId));

        const orderItems = await db.query.orderItemTable.findMany({
          where: eq(orderItemTable.orderId, orderId),
        });

        // O Estorno: Devolvemos as quantidades para a prateleira
        for (const item of orderItems) {
          try {
            await db
              .update(productVariantTable)
              .set({
                stock: sql`${productVariantTable.stock} + ${item.quantity}`,
              })
              .where(eq(productVariantTable.id, item.productVariantId));
          } catch (error) {
            console.error("❌ Erro ao repor estoque (MP):", error);
          }
        }
        console.log("✅ Estoque do PIX estornado com sucesso!");
      }
    }

    // Sempre retornamos 200 OK para o Mercado Pago parar de enviar a notificação
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro geral no webhook do MP:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};
