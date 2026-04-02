"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  orderItemTable,
  orderTable,
  productVariantTable,
  shippingAddressTable,
  storeTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { createDirectOrderSchema } from "./schema";

// NOVO: Importando a regra de frete
import { calculateShipping } from "@/helpers/shipping";

export const createDirectOrder = async (input: unknown) => {
  const parsedInput = createDirectOrderSchema.parse(input);
  const { variantId, quantity, addressId } = parsedInput;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    throw new Error("Unauthorized: Usuário não autenticado.");
  }

  // NOVO: Buscamos a variante e incluímos o produto para descobrir de qual loja ele é!
  const variant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, variantId),
    with: { product: true },
  });

  if (!variant) {
    throw new Error("Bad Request: Variante de produto não encontrada.");
  }

  // NOVO: Agora buscamos a loja exata dona desse produto (Segurança SaaS)
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.id, variant.product.storeId),
  });

  if (!store) {
    throw new Error("Internal Server Error: Loja não encontrada.");
  }

  const address = await db.query.shippingAddressTable.findFirst({
    where: eq(shippingAddressTable.id, addressId),
  });

  if (!address || address.userId !== session.user.id) {
    throw new Error(
      "Bad Request: Endereço inválido ou não pertence ao usuário.",
    );
  }

  // ==========================================
  // NOVO: O cálculo correto do Total + Frete
  // ==========================================
  const subtotalInCents = variant.priceInCents * quantity;

  const shippingInCents = calculateShipping(
    subtotalInCents,
    store.fixedShippingFeeInCents || 0,
    store.freeShippingThresholdInCents || null,
  );

  const totalInCents = subtotalInCents + shippingInCents;
  // ==========================================

  const timestamp = Date.now();
  const randomSuffix = Math.floor(Math.random() * 1000);
  const orderNumber = Number(`${timestamp}${randomSuffix}`.slice(-9));

  try {
    const [order] = await db
      .insert(orderTable)
      .values({
        orderNumber,
        storeId: store.id,
        userId: session.user.id,
        shippingAddressId: addressId,
        totalPriceInCents: totalInCents, // Agora salva o valor com frete!
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
};
