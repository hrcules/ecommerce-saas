"use server";

import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo

import { removeProductFromCartSchema } from "./schema";

export const removeProductFromCart = authenticatedAction<
  z.infer<typeof removeProductFromCartSchema>,
  void
>(async (data, ctx) => {
  const { userId, storeId } = ctx;

  removeProductFromCartSchema.parse(data);

  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // 🛡️ Segurança: O carrinho é do usuário E da loja atual?
  if (cartItem.cart.userId !== userId || cartItem.cart.storeId !== storeId) {
    throw new Error("Unauthorized");
  }

  await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
});
