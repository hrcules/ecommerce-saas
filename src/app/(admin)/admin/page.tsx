import { db } from "@/db";
import { orderTable, productTable, storeTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session!.user.id),
  });

  // Buscando métricas reais do banco
  const totalRevenue = await db
    .select({ total: sql<number>`sum(${orderTable.totalPriceInCents})` })
    .from(orderTable)
    .where(eq(orderTable.storeId, store!.id));

  const productsCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(productTable)
    .where(eq(productTable.storeId, store!.id));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo ao painel da {store?.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCentsToBRL(totalRevenue[0]?.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Produtos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productsCount[0]?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
