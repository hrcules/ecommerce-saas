import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ShieldAlert, Store } from "lucide-react";
import Link from "next/link";

import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/authentication");

  const dbUser = await db.query.user.findFirst({
    where: eq(user.id, session.user.id),
  });

  if (dbUser?.role !== "superadmin") redirect("/");

  return (
    <div className="bg-muted/40 flex min-h-screen flex-col">
      <header className="bg-background sticky top-0 z-30 flex h-16 items-center gap-4 border-b px-4 shadow-sm sm:px-6">
        <nav className="flex items-center gap-6 text-lg font-medium md:text-sm">
          <Link
            href="/super-admin"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <ShieldAlert className="h-6 w-6 text-red-600" />
            <span className="font-bold tracking-tight">
              Bewear <span className="text-red-600">Admin</span>
            </span>
          </Link>
          <Link
            href="/super-admin"
            className="text-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <Store className="h-4 w-4" /> Lojas
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <span className="hidden rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-bold tracking-wider text-red-600 uppercase sm:inline-block">
            Acesso Restrito
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
