import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { storeTable } from "@/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="bg-muted/20 hidden w-64 border-r p-6 md:block">
        <div className="mb-8 text-xl font-bold">{store.name} Admin</div>
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start"
            asChild
          >
            <Link href="/admin/">Dashboard</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start"
            asChild
          >
            <Link href="/admin/products">Produtos</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start"
            asChild
          >
            <Link href="/admin/categories">Categorias</Link>
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start"
            asChild
          >
            <Link href="/admin/orders">Pedidos</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
