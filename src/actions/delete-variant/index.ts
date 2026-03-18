"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productTable, productVariantTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function deleteVariantAction(
  variantId: string,
  productId: string,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Não autorizado");

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  const parentProduct = await db.query.productTable.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!parentProduct || parentProduct.storeId !== store.id) {
    throw new Error("Produto inválido ou sem permissão.");
  }

  await db
    .delete(productVariantTable)
    .where(eq(productVariantTable.id, variantId));

  revalidatePath(`/admin/products/${productId}`);

  return { success: true };
}
