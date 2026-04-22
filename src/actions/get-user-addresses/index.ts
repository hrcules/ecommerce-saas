"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo

// Tipagem do retorno (opcional, mas recomendado): Retorna um array de endereços
export const getUserAddresses = authenticatedAction<
  void,
  (typeof shippingAddressTable.$inferSelect)[]
>(async (_, ctx) => {
  const { userId } = ctx;

  try {
    const addresses = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.userId, userId)); // ✅ Busca apenas endereços deste usuário!

    return addresses;
  } catch (error) {
    console.error("Erro ao buscar endereços:", error);
    throw new Error("Erro ao buscar endereços");
  }
});
