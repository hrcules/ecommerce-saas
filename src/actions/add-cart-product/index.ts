"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { cartItemTable, cartTable, productVariantTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { type AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  addProductToCartSchema.parse(data);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("User not authenticated");
  }

  const store = await db.query.storeTable.findFirst();
  if (!store) {
    throw new Error("Loja não encontrada");
  }

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, data.productVariantId),
  });

  if (!productVariant) {
    throw new Error("Variante do produto não encontrada");
  }

  const cart = await db.query.cartTable.findFirst({
    where: and(
      eq(cartTable.userId, session.user.id),
      eq(cartTable.storeId, store.id),
    ),
  });

  let cartId = cart?.id;

  if (!cartId) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId: session.user.id,
        storeId: store.id,
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
    await db
      .update(cartItemTable)
      .set({
        quantity: cartItem.quantity + data.quantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  await db.insert(cartItemTable).values({
    cartId,
    productVariantId: data.productVariantId,
    quantity: data.quantity,
  });
};
