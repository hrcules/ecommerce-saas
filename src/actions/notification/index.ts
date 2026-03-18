"use server";

import { eq, desc } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db";
import { notificationTable } from "@/db/schema";
import { auth } from "@/lib/auth";

// 1. Busca as últimas 10 notificações do usuário logado
export const getNotifications = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  const notifications = await db.query.notificationTable.findMany({
    where: eq(notificationTable.userId, session.user.id),
    orderBy: [desc(notificationTable.createdAt)],
    limit: 10,
  });

  return notifications;
};

// 2. Marca uma notificação específica como lida (quando o usuário clica nela)
export const markNotificationAsRead = async (notificationId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autorizado");
  }

  await db
    .update(notificationTable)
    .set({ isRead: true })
    .where(eq(notificationTable.id, notificationId));

  return { success: true };
};
