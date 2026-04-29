"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getTenantStore } from "@/lib/tentat";

export const getCart = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const store = await getTenantStore();

  if (!store) {
    return null;
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
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  // Se não existe carrinho no banco, criamos um novo para o usuário
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

  // Retornamos o carrinho com o cálculo do total
  return {
    ...cart,
    totalPriceInCents: cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    ),
  };
};
