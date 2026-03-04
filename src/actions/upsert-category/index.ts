"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { categoryTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { upsertCategorySchema, UpsertCategorySchema } from "./schema";

export const upsertCategory = async (data: UpsertCategorySchema) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  const { id, name, slug } = upsertCategorySchema.parse(data);

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });
  if (!store) throw new Error("Loja não encontrada");

  if (id) {
    await db
      .update(categoryTable)
      .set({ name, slug, updatedAt: new Date() })
      .where(
        and(eq(categoryTable.id, id), eq(categoryTable.storeId, store.id)),
      );
  } else {
    await db.insert(categoryTable).values({
      name,
      slug,
      storeId: store.id,
    });
  }

  revalidatePath("/admin/categories");
};
