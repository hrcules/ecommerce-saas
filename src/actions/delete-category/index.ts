"use server";

import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { tenantOwnerAction } from "@/lib/safe-action"; // ✅ Nosso Escudo

// Passamos <string, void> porque essa action recebe uma string (id) e não retorna nada
export const deleteCategory = tenantOwnerAction<string, void>(
  async (categoryId, ctx) => {
    // 🛡️ Pegamos o ID da loja blindado
    const { storeId } = ctx;

    // ✅ Usamos o storeId do contexto para contar
    const categoriesCount = await db
      .select({ value: count() })
      .from(categoryTable)
      .where(eq(categoryTable.storeId, storeId));

    if (categoriesCount[0].value <= 1) {
      throw new Error("Sua loja precisa ter pelo menos uma categoria ativa.");
    }

    // ✅ Usamos o storeId do contexto para deletar com segurança extrema
    await db
      .delete(categoryTable)
      .where(
        and(
          eq(categoryTable.id, categoryId),
          eq(categoryTable.storeId, storeId),
        ),
      );

    revalidatePath("/admin/categories");
  },
);
