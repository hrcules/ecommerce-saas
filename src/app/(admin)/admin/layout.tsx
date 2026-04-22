import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { storeTable } from "@/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { Metadata } from "next";
import NotificationBell from "@/components/common/notification-bell";
import { getTenantStore } from "@/lib/tentat";

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

  const store = await getTenantStore();

  if (!store) {
    redirect("/"); // Loja não existe, manda pra Home (ou 404)
  }

  if (store.ownerId !== session.user.id) {
    console.warn(
      `Tentativa de invasão bloqueada! User: ${session.user.id} tentou acessar a loja: ${store.id}`,
    );

    // Expulsa o usuário intruso de volta para a vitrine pública da loja
    redirect("/");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="bg-muted/20 hidden w-64 border-r p-6 md:block">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-xl font-bold">{store.name} Admin</div>
          <NotificationBell />
        </div>
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
          <Button
            variant="ghost"
            className="text-muted-foreground w-full justify-start"
            asChild
          >
            <Link href="/admin/settings">Configurações</Link>
          </Button>
        </nav>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
