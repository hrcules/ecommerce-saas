"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  orderItemTable,
  orderTable,
  productVariantTable,
  shippingAddressTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { createDirectOrderSchema } from "./schema";

export const createDirectOrder = async (input: unknown) => {
  const parsedInput = createDirectOrderSchema.parse(input);
  const { variantId, quantity, addressId } = parsedInput;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    throw new Error("Unauthorized: Usuário não autenticado.");
  }

  const store = await db.query.storeTable.findFirst();
  if (!store) {
    throw new Error("Internal Server Error: Loja não encontrada.");
  }

  const variant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, variantId),
  });

  if (!variant) {
    throw new Error("Bad Request: Variante de produto não encontrada.");
  }

  const address = await db.query.shippingAddressTable.findFirst({
    where: eq(shippingAddressTable.id, addressId),
  });

  if (!address || address.userId !== session.user.id) {
    throw new Error(
      "Bad Request: Endereço inválido ou não pertence ao usuário.",
    );
  }

  const totalInCents = variant.priceInCents * quantity;

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

    // 6. Retorno esperado pelo componente do Stripe
    return { orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido direto:", error);
    throw new Error("Internal Server Error: Falha ao processar o pedido.");
  }
};
