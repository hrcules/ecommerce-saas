"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { storeTable, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CreateStoreInput, createStoreSchema } from "./schema";

export async function toggleStoreStatus(
  storeId: string,
  currentStatus: boolean,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (dbUser?.role !== "superadmin") {
    throw new Error("Acesso negado. Apenas o Super Admin pode fazer isso.");
  }

  await db
    .update(storeTable)
    .set({ isActive: !currentStatus, updatedAt: new Date() })
    .where(eq(storeTable.id, storeId));

  revalidatePath("/super-admin");
  revalidatePath("/");

  return { success: true };
}

export async function createStore(data: CreateStoreInput) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });
  if (dbUser?.role !== "superadmin") throw new Error("Acesso negado");

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
}
