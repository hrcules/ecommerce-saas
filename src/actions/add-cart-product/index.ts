"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItemTable, cartTable, productVariantTable } from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo do Comprador
import { type AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = authenticatedAction<
  AddProductToCartSchema,
  void
>(async (data, ctx) => {
  // 🛡️ Pegamos quem está comprando e ONDE está comprando
  const { userId, storeId } = ctx;

  addProductToCartSchema.parse(data);

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, data.productVariantId),
    with: { product: true },
  });

  // 🛡️ Segurança Dupla: A variante existe e pertence à loja atual?
  if (!productVariant || productVariant.product.storeId !== storeId) {
    throw new Error("Variante do produto não encontrada nesta loja.");
  }

  if (productVariant.stock < data.quantity) {
    throw new Error(
      `Estoque insuficiente. Temos apenas ${productVariant.stock} unidades disponíveis.`,
    );
  }

  const cart = await db.query.cartTable.findFirst({
    where: and(eq(cartTable.userId, userId), eq(cartTable.storeId, storeId)),
  });

  let cartId = cart?.id;

  if (!cartId) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: userId,
        storeId: storeId,
      })
      .returning();
    cartId = newCart.id;
  }

  const cartItem = await db.query.cartItemTable.findFirst({
    where: and(
      eq(cartItemTable.cartId, cartId),
      eq(cartItemTable.productVariantId, data.productVariantId),
    ),
  });

  if (cartItem) {
    const newQuantity = cartItem.quantity + data.quantity;

    if (productVariant.stock < newQuantity) {
      throw new Error(
        `Você já tem ${cartItem.quantity} no carrinho. Estoque máximo é ${productVariant.stock}.`,
      );
    }

    await db
      .update(cartItemTable)
      .set({
        quantity: newQuantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  await db.insert(cartItemTable).values({
    cartId,
    productVariantId: data.productVariantId,
    quantity: data.quantity,
  });
});
