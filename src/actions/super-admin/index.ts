"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { storeTable, user } from "@/db/schema";
import { superAdminAction } from "@/lib/safe-action"; // ✅ Escudo Super Admin
import { CreateStoreInput, createStoreSchema } from "./schema";

export const toggleStoreStatus = superAdminAction<
  { storeId: string; currentStatus: boolean },
  { success: boolean }
>(async ({ storeId, currentStatus }) => {
  await db
    .update(storeTable)
    .set({ isActive: !currentStatus, updatedAt: new Date() })
    .where(eq(storeTable.id, storeId));

  revalidatePath("/super-admin");
  revalidatePath("/");

  return { success: true };
});

export const createStore = superAdminAction<
  CreateStoreInput,
  { success: boolean }
>(async (data) => {
  const { name, slug, ownerEmail } = createStoreSchema.parse(data);

  const merchant = await db.query.user.findFirst({
    where: eq(user.email, ownerEmail),
  });

  if (!merchant) {
    throw new Error(
      "Utilizador não encontrado. O lojista deve registar-se primeiro no site.",
    );
  }

  await db.transaction(async (tx) => {
    await tx.insert(storeTable).values({
      name,
      slug,
      ownerId: merchant.id,
      isActive: true,
    });

    await tx
      .update(user)
      .set({ role: "merchant" })
      .where(eq(user.id, merchant.id));
  });

  revalidatePath("/super-admin");
  return { success: true };
});
