"use server";

import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { categoryTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const deleteCategory = async (categoryId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  // 1. Busca a loja do usuário
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });
  if (!store) throw new Error("Loja não encontrada");

  // 2. Trava de Segurança SaaS: Conta as categorias ativas desta loja
  const categoriesCount = await db
    .select({ value: count() })
    .from(categoryTable)
    .where(eq(categoryTable.storeId, store.id));

  if (categoriesCount[0].value <= 1) {
    throw new Error("Sua loja precisa ter pelo menos uma categoria ativa.");
  }

  // 3. Exclui a categoria (garantindo pelo `and` que ela pertence a esta loja)
  await db
    .delete(categoryTable)
    .where(
      and(
        eq(categoryTable.id, categoryId),
        eq(categoryTable.storeId, store.id),
      ),
    );

  // Atualiza a tela instantaneamente
  revalidatePath("/admin/categories");
};
