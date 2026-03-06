"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export const finishOrder = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const store = await db.query.storeTable.findFirst();
  if (!store) {
    throw new Error("Loja não encontrada");
  }

  const cart = await db.query.cartTable.findFirst({
    where: and(
      eq(cartTable.userId, session.user.id),
      eq(cartTable.storeId, store.id),
    ),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.shippingAddress) {
    throw new Error("Shipping address not found");
  }

  const totalPriceInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );

  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const orderNumber = Number(`${timestamp}${randomSuffix}`.slice(-9));

  let orderId: string | undefined;

  await db.transaction(async (tx) => {
    if (!cart.shippingAddress) {
      throw new Error("Shipping address not found");
    }

    const [order] = await tx
      .insert(orderTable)
      .values({
        orderNumber,
        storeId: store.id,
        userId: session.user.id,
        totalPriceInCents,
        shippingAddressId: cart.shippingAddress.id,
        status: "pending",
        stripeCheckoutSessionId: "",
      })
      .returning();

    if (!order) {
      throw new Error("Failed to create order");
    }

    orderId = order.id;

    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> =
      cart.items.map((item) => ({
        orderId: order.id,
        productVariantId: item.productVariant.id,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      }));

    await tx.insert(orderItemTable).values(orderItemsPayload);

    await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
    await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
  });

  if (!orderId) {
    throw new Error("Failed to create order");
  }

  return { orderId };
};
