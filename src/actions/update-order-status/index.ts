"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import { tenantOwnerAction } from "@/lib/safe-action"; // ✅ O Escudo

export const updateOrderStatusAction = tenantOwnerAction<
  { orderId: string; newStatus: string }, // Tipo do Input
  { success: boolean } // Tipo do Retorno
>(async ({ orderId, newStatus }, ctx) => {
  const { storeId } = ctx;

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  // 🛡️ Segurança: Garantimos que o pedido pertence à loja atual
  if (!order || order.storeId !== storeId) {
    throw new Error("Pedido não encontrado ou não pertence à sua loja.");
  }

  await db
    .update(orderTable)
    .set({ status: newStatus })
    .where(eq(orderTable.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath("/orders");

  return { success: true };
});
