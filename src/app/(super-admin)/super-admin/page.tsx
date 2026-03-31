import { desc } from "drizzle-orm";
import { Store } from "lucide-react";

import { db } from "@/db";
import { storeTable } from "@/db/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { KillSwitchButton } from "./components/kill-switch-button";
import { CreateStoreModal } from "./components/create-store-modal";

export default async function SuperAdminPage() {
  const stores = await db.query.storeTable.findMany({
    with: { owner: true },
    orderBy: [desc(storeTable.createdAt)],
  });

  const activeStores = stores.filter((s) => s.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Inquilinos (Tenants)
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitore o status das lojas e gerencie acessos por inadimplência.
          </p>
        </div>
        <CreateStoreModal />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total de Contas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stores.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Adimplentes (Ativas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {activeStores}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Inadimplentes (Bloqueadas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {stores.length - activeStores}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lojas Cadastradas</CardTitle>
          <CardDescription>
            Gerencie o acesso à plataforma para cada lojista.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stores.map((store) => (
              <div
                key={store.id}
                className={`flex flex-col items-start justify-between gap-4 rounded-lg border p-5 transition-colors sm:flex-row sm:items-center ${
                  !store.isActive
                    ? "border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/10"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold">{store.name}</p>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                        store.isActive
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {store.isActive ? "Online" : "Suspensa"}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex flex-col text-sm sm:flex-row sm:gap-4">
                    <span>
                      <strong className="text-foreground font-medium">
                        Dono:
                      </strong>{" "}
                      {store.owner?.email || "Sem dono"}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>
                      <strong className="text-foreground font-medium">
                        Domínio:
                      </strong>{" "}
                      {store.slug}
                    </span>
                  </div>
                </div>

                <div className="flex w-full justify-end sm:w-auto">
                  <KillSwitchButton
                    storeId={store.id}
                    isActive={store.isActive}
                    storeName={store.name}
                  />
                </div>
              </div>
            ))}

            {stores.length === 0 && (
              <div className="py-12 text-center">
                <Store className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-20" />
                <h3 className="text-lg font-medium">Nenhuma loja encontrada</h3>
                <p className="text-muted-foreground">
                  Clique em {"Nova Loja"} para começar.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
