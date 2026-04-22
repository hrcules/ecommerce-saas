"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { tenantOwnerAction } from "@/lib/safe-action"; // ✅ O Escudo
import { upsertCategorySchema, UpsertCategorySchema } from "./schema";

// Note que aqui o input é o UpsertCategorySchema, não um FormData!
export const upsertCategory = tenantOwnerAction<UpsertCategorySchema, void>(
  async (data, ctx) => {
    const { storeId } = ctx;

    const { id, name, slug } = upsertCategorySchema.parse(data);

    if (id) {
      await db
        .update(categoryTable)
        .set({ name, slug, updatedAt: new Date() })
        .where(
          and(eq(categoryTable.id, id), eq(categoryTable.storeId, storeId)), // 🛡️ Segurança dupla
        );
    } else {
      await db.insert(categoryTable).values({
        name,
        slug,
        storeId: storeId, // 🛡️ Loja correta do contexto
      });
    }

    revalidatePath("/admin/categories");
  },
);
