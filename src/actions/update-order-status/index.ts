"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { orderTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Não autorizado");

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });
  if (!store) throw new Error("Loja não encontrada");

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order || order.storeId !== store.id) {
    throw new Error("Pedido não encontrado ou não pertence à tua loja.");
  }

  await db
    .update(orderTable)
    .set({ status: newStatus })
    .where(eq(orderTable.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath("/orders");

  return { success: true };
}
