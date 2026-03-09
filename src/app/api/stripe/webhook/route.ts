import { eq, sql } from "drizzle-orm"; // <-- NOVO: importamos o 'sql'
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { orderTable, orderItemTable, productVariantTable } from "@/db/schema";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.error();
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  if (event.type === "checkout.session.completed") {
    console.log("🟢 [WEBHOOK RECEBIDO] Checkout session completed!");

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return NextResponse.error();
    }

    await db
      .update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId));

    // 2. Busca os itens
    const orderItems = await db.query.orderItemTable.findMany({
      where: eq(orderItemTable.orderId, orderId),
    });

    console.log();

    // 3. O MOMENTO EM QUE DIMINUI:
    for (const item of orderItems) {
      console.log();

      try {
        await db
          .update(productVariantTable)
          .set({
            stock: sql`${productVariantTable.stock} - ${item.quantity}`,
          })
          .where(eq(productVariantTable.id, item.productVariantId));

        console.log();
      } catch (error) {
        console.log(error);
      }
    }
  }

  return NextResponse.json({ received: true });
};
