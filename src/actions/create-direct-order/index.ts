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
  // 1. Validação de dados (Zod)
  const parsedInput = createDirectOrderSchema.parse(input);
  const { variantId, quantity, addressId } = parsedInput;

  // 2. Verificação de Sessão (Padrão BetterAuth)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    throw new Error("Unauthorized: Usuário não autenticado.");
  }

  // 3. Validação de Segurança (Backend as Source of Truth)
  const variant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.id, variantId),
  });

  if (!variant) {
    throw new Error("Bad Request: Variante de produto não encontrada.");
  }

  // Buscar os detalhes completos do endereço
  const address = await db.query.shippingAddressTable.findFirst({
    where: eq(shippingAddressTable.id, addressId),
  });

  if (!address || address.userId !== session.user.id) {
    throw new Error(
      "Bad Request: Endereço inválido ou não pertence ao usuário.",
    );
  }

  const totalInCents = variant.priceInCents * quantity;

  // 4. Transação no Banco de Dados (Drizzle)
  try {
    const [order] = await db
      .insert(orderTable)
      .values({
        userId: session.user.id,
        shippingAddressId: addressId,
        // Copiando os dados do endereço para o pedido (histórico imutável)
        recipientName: address.recipientName,
        street: address.street,
        number: address.number,
        complement: address.complement,
        city: address.city,
        state: address.state,
        neighborhood: address.neighborhood,
        zipCode: address.zipCode,
        country: address.country,
        phone: address.phone,
        email: address.email,
        cpfOrCnpj: address.cpfOrCnpj,
        // Valores do pedido
        totalPriceInCents: totalInCents,
        status: "pending", // Atualizado para o status correto do seu schema
      })
      .returning();

    await db.insert(orderItemTable).values({
      orderId: order.id,
      productVariantId: variant.id,
      quantity,
      priceInCents: variant.priceInCents,
    });

    // 5. Retorno esperado pelo componente do Stripe
    return { orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido direto:", error);
    throw new Error("Internal Server Error: Falha ao processar o pedido.");
  }
};
