"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  orderItemTable,
  orderTable,
  productVariantTable,
  shippingAddressTable,
  storeTable,
} from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo
import { createDirectOrderSchema } from "./schema";
import { calculateShipping } from "@/helpers/shipping";

export const createDirectOrder = authenticatedAction<
  unknown,
  { orderId: string }
>(async (input, ctx) => {
  const { userId, storeId } = ctx;

  const parsedInput = createDirectOrderSchema.parse(input);
  const { variantId, quantity, addressId } = parsedInput;

  const variant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, variantId),
    with: { product: true },
  });

  // 🛡️ Impedimos que alguém crie pedido direto de uma variante de outra loja
  if (!variant || variant.product.storeId !== storeId) {
    throw new Error(
      "Bad Request: Variante de produto não encontrada nesta loja.",
    );
  }

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.id, storeId),
  });

  if (!store) {
    throw new Error("Internal Server Error: Loja não encontrada.");
  }

  const address = await db.query.shippingAddressTable.findFirst({
    where: eq(shippingAddressTable.id, addressId),
  });

  // 🛡️ Garantimos que o comprador só pode usar um endereço que seja DELE
  if (!address || address.userId !== userId) {
    throw new Error(
      "Bad Request: Endereço inválido ou não pertence ao usuário.",
    );
  }

  const subtotalInCents = variant.priceInCents * quantity;

  const shippingInCents = calculateShipping(
    subtotalInCents,
    store.fixedShippingFeeInCents || 0,
    store.freeShippingThresholdInCents || null,
  );

  const totalInCents = subtotalInCents + shippingInCents;

  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const orderNumber = Number(`${timestamp}${randomSuffix}`.slice(-9));

  try {
    const [order] = await db
      .insert(orderTable)
      .values({
        orderNumber,
        storeId: storeId, // ✅ Usamos o ID blindado do contexto
        userId: userId, // ✅ Usamos o ID blindado do comprador
        shippingAddressId: addressId,
        totalPriceInCents: totalInCents,
        status: "pending",
        stripeCheckoutSessionId: "",
      })
      .returning();

    await db.insert(orderItemTable).values({
      orderId: order.id,
      productVariantId: variant.id,
      quantity,
      priceInCents: variant.priceInCents,
    });

    return { orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido direto:", error);
    throw new Error("Internal Server Error: Falha ao processar o pedido.");
  }
});
