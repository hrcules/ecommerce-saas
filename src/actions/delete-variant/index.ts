"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { tenantOwnerAction } from "@/lib/safe-action"; // ✅ O Escudo

export const deleteVariantAction = tenantOwnerAction<
  { variantId: string; productId: string }, // Tipo do Input
  { success: boolean } // Tipo do Retorno
>(async ({ variantId, productId }, ctx) => {
  const { storeId } = ctx;

  const parentProduct = await db.query.productTable.findFirst({
    where: eq(productTable.id, productId),
  });

  // 🛡️ Segurança: Garantimos que o produto a ser deletado pertence à loja do contexto
  if (!parentProduct || parentProduct.storeId !== storeId) {
    throw new Error("Produto inválido ou sem permissão.");
  }

  await db
    .delete(productVariantTable)
    .where(eq(productVariantTable.id, variantId));

  revalidatePath(`/admin/products/${productId}`);

  return { success: true };
});
