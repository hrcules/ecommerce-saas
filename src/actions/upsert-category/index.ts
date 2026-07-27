"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { tenantOwnerAction } from "@/lib/safe-action"; // ✅ O Escudo
import { upsertCategorySchema, UpsertCategorySchema } from "./schema";

function generateSlug(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export const upsertCategory = tenantOwnerAction<UpsertCategorySchema, void>(
  async (data, ctx) => {
    const { storeId } = ctx;

    const { id, name, slug } = upsertCategorySchema.parse(data);

    const safeSlug = generateSlug(slug || name);

    if (id) {
      await db
        .update(categoryTable)
        .set({ name, slug: safeSlug, updatedAt: new Date() })
        .where(
          and(eq(categoryTable.id, id), eq(categoryTable.storeId, storeId)),
        );
    } else {
      await db.insert(categoryTable).values({
        name,
        slug: safeSlug,
        storeId: storeId,
      });
    }

    revalidatePath("/admin/categories");
  },
);
