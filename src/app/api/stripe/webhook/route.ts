import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

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

  if (!store || !store.stripeSecretKey || !store.stripeWebhookSecret) {
    return new NextResponse(
      "Loja não encontrada ou chaves do Stripe não configuradas",
      { status: 400 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Assinatura ausente", { status: 400 });
  }

  const text = await request.text();

  const stripe = new Stripe(store.stripeSecretKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      store.stripeWebhookSecret,
    );
  } catch (error) {
    console.error("❌ Erro na assinatura do webhook:", error);
    return new NextResponse("Erro na assinatura do webhook", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.log(
      `🟢 [WEBHOOK RECEBIDO] Checkout session completed para a loja: ${store.name}`,
    );

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      console.log("⚠️ Pagamento recebido, mas sem orderId. Ignorando...");
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    await db
      .update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId));

    const orderItems = await db.query.orderItemTable.findMany({
      where: eq(orderItemTable.orderId, orderId),
    });

    console.log("📦 Descontando estoque...");

    for (const item of orderItems) {
      try {
        await db
          .update(productVariantTable)
          .set({
            stock: sql`${productVariantTable.stock} - ${item.quantity}`,
          })
          .where(eq(productVariantTable.id, item.productVariantId));
      } catch (error) {
        console.error("❌ Erro ao descontar estoque:", error);
      }
    }

    try {
      console.log("📧 Preparando envio de e-mails...");

      const order = await db.query.orderTable.findFirst({
        where: eq(orderTable.id, orderId),
        with: { shippingAddress: true },
      });

      // NOVO: Buscamos os itens DE NOVO, mas agora com o nome do produto!
      const emailOrderItems = await db.query.orderItemTable.findMany({
        where: eq(orderItemTable.orderId, orderId),
        with: {
          productVariant: {
            with: { product: true },
          },
        },
      });

      if (order && order.shippingAddress) {
        const owner = await db.query.user.findFirst({
          where: eq(user.id, store.ownerId),
        });

        // =====================================
        // MATEMÁTICA DO RECIBO
        // =====================================
        // 1. Calcula o Subtotal (Soma dos itens)
        const subtotalInCents = emailOrderItems.reduce(
          (acc, item) => acc + item.priceInCents * item.quantity,
          0,
        );

        // 2. Calcula o Frete (Total - Subtotal)
        const freteInCents = order.totalPriceInCents - subtotalInCents;

        // 3. Monta o Array de Produtos para a Tabela
        const formattedItems = emailOrderItems.map((item) => ({
          name: `${item.productVariant.product.name} (${item.productVariant.name})`,
          quantity: item.quantity,
          priceFormatted: formatCentsToBRL(item.priceInCents * item.quantity),
        }));

        // 4. Formata os totais
        const formattedSubtotal = formatCentsToBRL(subtotalInCents);
        const formattedShipping = formatCentsToBRL(freteInCents);
        const formattedTotal = formatCentsToBRL(order.totalPriceInCents);

        // Chama a função do cliente passando as informações da tabela
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
          // Chama a função do lojista passando as informações da tabela
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
            message: `O pedido #${order.orderNumber} no valor de ${formattedTotal} acabou de ser pago.`,
            type: "sale",
          });

          console.log("✅ E-mails enviados e notificação criada com sucesso!");
        }
      }
    } catch (emailError) {
      console.error("❌ Erro fatal no bloco de envio de e-mails:", emailError);
    }
  }

  return NextResponse.json({ received: true });
};
