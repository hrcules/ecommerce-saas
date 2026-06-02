import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  // 1. Aponta para a Matriz
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://lvh.me:3000",

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      // O Better Auth já gerou o token seguro e montou a URL!
      // Ex: http://localhost:3000/auth/reset-password?token=xyz123

      console.log(`🔗 [DEBUG] URL de Recuperação para ${user.email}:`, url);

      // Aqui nós chamaremos o seu disparador de e-mail real.
      // Ex: await sendPasswordResetEmail(user.email, url);
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  advanced: {
    crossSubDomainCookies: { enabled: true },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // ✅ AQUI ESTÁ A MÁGICA: Trocamos .localhost por .lvh.me
      domain:
        process.env.NODE_ENV === "production" ? ".bewear.com.br" : ".lvh.me",
    },
  },
  trustedOrigins: [
    "http://lvh.me:3000",
    "http://*.lvh.me:3000",
    "http://bewear.lvh.me:3000",
    "http://testbewear.lvh.me:3000",
  ],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: { modelName: "user" },
  session: { modelName: "session" },
  account: { modelName: "account" },
  verification: { modelName: "verification" },
});
