"use server";

import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo

import { decreaseCartProductQuantitySchema } from "./schema";

export const decreaseCartProductQuantity = authenticatedAction<
  z.infer<typeof decreaseCartProductQuantitySchema>,
  void
>(async (data, ctx) => {
  const { userId, storeId } = ctx;

  decreaseCartProductQuantitySchema.parse(data);

  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true,
    },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // 🛡️ Segurança: O carrinho é do usuário E pertence à loja onde ele está navegando?
  if (cartItem.cart.userId !== userId || cartItem.cart.storeId !== storeId) {
    throw new Error("Unauthorized");
  }

  if (cartItem.quantity === 1) {
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  await db
    .update(cartItemTable)
    .set({ quantity: cartItem.quantity - 1 })
    .where(eq(cartItemTable.id, cartItem.id));
});
