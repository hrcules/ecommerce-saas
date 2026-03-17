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
} from "@/db/schema";
import {
  sendCustomerReceiptEmail,
  sendStoreOwnerNotificationEmail,
} from "@/lib/email";
import { formatCentsToBRL } from "@/helpers/money";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse("Chaves ausentes", { status: 400 }); // Ajustado!
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new NextResponse("Assinatura ausente", { status: 400 }); // Ajustado!
  }

  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return new NextResponse("Erro na assinatura do webhook", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    console.log("🟢 [WEBHOOK RECEBIDO] Checkout session completed!");

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

      if (order && order.shippingAddress) {
        const store = await db.query.storeTable.findFirst({
          where: eq(storeTable.id, order.storeId),
        });

        if (store) {
          const owner = await db.query.user.findFirst({
            where: eq(user.id, store.ownerId),
          });

          const formattedPrice = formatCentsToBRL(order.totalPriceInCents);

          await sendCustomerReceiptEmail(
            order.shippingAddress.email,
            order.shippingAddress.fullName,
            order.orderNumber,
            store.name,
            formattedPrice,
          );

          if (owner && owner.email) {
            await sendStoreOwnerNotificationEmail(
              owner.email,
              order.orderNumber,
              store.name,
              formattedPrice,
            );
          }
        }
      }
    } catch (emailError) {
      console.error("❌ Erro fatal no bloco de envio de e-mails:", emailError);
    }
  }

  return NextResponse.json({ received: true });
};
