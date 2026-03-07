"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { productTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateProductDetailsAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) throw new Error("Não autorizado");

  const productId = formData.get("productId") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!productId || !name || !categoryId) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) throw new Error("Loja não encontrada");

  const product = await db.query.productTable.findFirst({
    where: eq(productTable.id, productId),
  });

  if (!product || product.storeId !== store.id) {
    throw new Error("Produto inválido ou sem permissão.");
  }

  await db
    .update(productTable)
    .set({
      name,
      description,
      categoryId,
      updatedAt: new Date(),
    })
    .where(eq(productTable.id, productId));

  revalidatePath(`/admin/products/${productId}`);

  return { success: true };
}
