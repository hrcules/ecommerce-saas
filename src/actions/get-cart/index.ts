"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const getCart = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const store = await db.query.storeTable.findFirst();

  if (!store) {
    throw new Error("Loja não encontrada no sistema.");
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq, and }) =>
      and(eq(cart.userId, session.user.id), eq(cart.storeId, store.id)),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: session.user.id,
        storeId: store.id,
      })
      .returning();

    return {
      ...newCart,
      items: [],
      totalPriceInCents: 0,
      shippingAddress: null,
    };
  }

  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    ),
  };
};
