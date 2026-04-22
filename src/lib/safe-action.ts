import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getTenantStore } from "./tentat";
import { db } from "@/db";
import { user } from "@/db/schema";

type ActionHandler<TInput, TOutput, TContext> = (
  input: TInput,
  ctx: TContext,
) => Promise<TOutput>;

/**
 * 🛒 Nível 2: Escudo do Comprador (Autenticação Básica + Loja Atual)
 */
export const authenticatedAction = <TInput, TOutput>(
  // ✅ O SEGREDO ESTÁ AQUI: Adicione o storeId: string
  handler: ActionHandler<TInput, TOutput, { userId: string; storeId: string }>,
) => {
  return async (input: TInput): Promise<TOutput> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user)
      throw new Error("Não autorizado. É necessário fazer login.");

    const store = await getTenantStore();
    if (!store) throw new Error("Loja não encontrada na URL.");

    // ✅ O SEGREDO ESTÁ AQUI: Retorne o storeId
    return handler(input, { userId: session.user.id, storeId: store.id });
  };
};

/**
 * 🛡️ Nível 1: Escudo do Lojista (Dono da Loja)
 */
export const tenantOwnerAction = <TInput, TOutput>(
  handler: ActionHandler<TInput, TOutput, { userId: string; storeId: string }>,
) => {
  return async (input: TInput): Promise<TOutput> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user)
      throw new Error("Não autorizado. É necessário fazer login.");

    const store = await getTenantStore();
    if (!store || store.ownerId !== session.user.id) {
      throw new Error("Acesso negado. Você não é dono desta loja.");
    }

    return handler(input, { userId: session.user.id, storeId: store.id });
  };
};

/**
 * 👑 Nível 3: Escudo do Super Admin
 */
export const superAdminAction = <TInput, TOutput>(
  handler: ActionHandler<TInput, TOutput, { userId: string }>,
) => {
  return async (input: TInput): Promise<TOutput> => {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Não autorizado. Faça login.");

    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, session.user.id),
    });

    if (dbUser?.role !== "superadmin") {
      throw new Error("Acesso negado. Apenas o Super Admin possui permissão.");
    }

    return handler(input, { userId: session.user.id });
  };
};
