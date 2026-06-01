import { eq, sql } from "drizzle-orm"; // ✅ 'sql' de volta para fazermos a soma!
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import {
  orderTable,
  orderItemTable,
  productVariantTable, // ✅ Tabela de variantes de volta!
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

  // ==========================================
  // CENÁRIO 1: PAGAMENTO APROVADO! 💰
  // ==========================================
  if (event.type === "checkout.session.completed") {
    console.log(`🟢 [WEBHOOK] Pagamento Aprovado para a loja: ${store.name}`);

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    await db
      .update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId));

    try {
      const order = await db.query.orderTable.findFirst({
        where: eq(orderTable.id, orderId),
        with: { shippingAddress: true },
      });

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
            message: `O pedido #${order.orderNumber} no valor de ${formattedTotal} acabou de ser pago via Cartão.`,
            type: "sale",
          });
        }
      }
    } catch (emailError) {
      console.error("❌ Erro fatal no bloco de envio de e-mails:", emailError);
    }
  }

  // ==========================================
  // CENÁRIO 2: SESSÃO EXPIRADA OU FALHOU! 🛑
  // ==========================================
  else if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    console.log(`🔴 [WEBHOOK] Sessão expirada/falhou. Estornando estoque...`);

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    // 1. Marca o pedido como cancelado
    await db
      .update(orderTable)
      .set({ status: "cancelled" })
      .where(eq(orderTable.id, orderId));

    // 2. Busca os itens para saber o que devolver
    const orderItems = await db.query.orderItemTable.findMany({
      where: eq(orderItemTable.orderId, orderId),
    });

    // 3. O Estorno: Devolvemos as quantidades para a prateleira
    for (const item of orderItems) {
      try {
        await db
          .update(productVariantTable)
          .set({
            stock: sql`${productVariantTable.stock} + ${item.quantity}`, // ➕ Soma em vez de subtrair!
          })
          .where(eq(productVariantTable.id, item.productVariantId));
      } catch (error) {
        console.error("❌ Erro ao repor estoque:", error);
      }
    }

    console.log("✅ Estoque estornado com sucesso!");
  }

  return NextResponse.json({ received: true });
};
