"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import { cartTable } from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo

import {
  UpdateCartShippingAddressSchema,
  updateCartShippingAddressSchema,
} from "./schema";

export const updateCartShippingAddress = authenticatedAction<
  UpdateCartShippingAddressSchema,
  { success: boolean }
>(async (data, ctx) => {
  const { userId, storeId } = ctx;

  updateCartShippingAddressSchema.parse(data);

  const shippingAddress = await db.query.shippingAddressTable.findFirst({
    where: (shippingAddress, { eq, and }) =>
      and(
        eq(shippingAddress.id, data.shippingAddressId),
        eq(shippingAddress.userId, userId), // ✅ Usa o ID blindado do contexto
      ),
  });

  if (!shippingAddress) {
    throw new Error("Shipping address not found or unauthorized");
  }

  // 🛡️ O BUG MORAVA AQUI: Agora garantimos que estamos atualizando o carrinho da loja certa!
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq, and }) =>
      and(eq(cart.userId, userId), eq(cart.storeId, storeId)),
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  await db
    .update(cartTable)
    .set({
      shippingAddressId: data.shippingAddressId,
    })
    .where(eq(cartTable.id, cart.id));

  return { success: true };
});
