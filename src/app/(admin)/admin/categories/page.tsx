import { Plus } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { eq } from "drizzle-orm";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { categoryTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // 1. Identifica a loja do lojista logado
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session!.user.id),
  });

  // 2. Busca apenas as categorias desta loja
  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store!.id),
    orderBy: (category, { desc }) => desc(category.createdAt),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Categorias</h2>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Link>
        </Button>
      </div>

      <Card className="border-none">
        <CardHeader>
          <CardTitle>Suas Categorias ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-muted-foreground text-sm">
                    /{category.slug}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/categories/${category.id}`}>Editar</Link>
                </Button>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-muted-foreground py-8 text-center">
                Nenhuma categoria encontrada.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
