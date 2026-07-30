"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { announcementTable } from "@/db/schema";

import {
  CreateAnnouncementInput,
  createAnnouncementSchema,
  UpdateAnnouncementInput,
  updateAnnouncementSchema,
} from "./schema";

// ==========================================
// 1. CRIAR AVISO
// ==========================================
export async function createAnnouncement(data: CreateAnnouncementInput) {
  const parsed = createAnnouncementSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db.insert(announcementTable).values({
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      isActive: true,
    });

    revalidatePath("/", "layout"); // Revalida toda a aplicação para exibir o aviso
    return { success: true };
  } catch (error) {
    console.error("[CREATE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Erro interno ao criar o aviso." };
  }
}

// ==========================================
// 2. ATUALIZAR AVISO
// ==========================================
export async function updateAnnouncement(data: UpdateAnnouncementInput) {
  const parsed = updateAnnouncementSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await db
      .update(announcementTable)
      .set({
        title: parsed.data.title,
        content: parsed.data.content,
        type: parsed.data.type,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(announcementTable.id, parsed.data.id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Erro interno ao atualizar o aviso." };
  }
}

// ==========================================
// 3. DELETAR AVISO
// ==========================================
export async function deleteAnnouncement(id: string) {
  try {
    if (!id) return { success: false, error: "ID é obrigatório." };

    await db.delete(announcementTable).where(eq(announcementTable.id, id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[DELETE_ANNOUNCEMENT_ERROR]", error);
    return { success: false, error: "Erro interno ao deletar o aviso." };
  }
}

// ==========================================
// 4. ALTERNAR STATUS (Ativar/Desativar rapidamente)
// ==========================================
export async function toggleAnnouncementStatus(
  id: string,
  currentStatus: boolean,
) {
  try {
    if (!id) return { success: false, error: "ID é obrigatório." };

    await db
      .update(announcementTable)
      .set({ isActive: !currentStatus, updatedAt: new Date() })
      .where(eq(announcementTable.id, id));

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("[TOGGLE_ANNOUNCEMENT_ERROR]", error);
    return {
      success: false,
      error: "Erro interno ao alterar o status do aviso.",
    };
  }
}
