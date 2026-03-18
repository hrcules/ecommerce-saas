import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { db } from "@/db";
import { productTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";

export default async function AdminProductsPage() {
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

  const products = await db.query.productTable.findMany({
    where: eq(productTable.storeId, store.id),
    orderBy: [desc(productTable.createdAt)],
    with: {
      category: true,
      variants: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie o catálogo da sua loja.
          </p>
        </div>

        {/* O botão que levará para a nossa futura tela de criação */}
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Link>
        </Button>
      </div>

      <Card className="border-none">
        <CardHeader>
          <CardTitle>Seu Catálogo ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem nenhum produto cadastrado.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/admin/products/new">Começar a vender</Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-left text-sm">
                  <thead className="text-muted-foreground bg-muted/50 border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Produto</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium">Variantes</th>
                      <th className="px-4 py-3 font-medium">Preço Base</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const basePrice = product.variants[0]?.priceInCents || 0;

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-muted/20 border-b transition-colors last:border-0"
                        >
                          <td className="flex items-center gap-3 px-4 py-3 font-medium">
                            {product.variants[0]?.imageUrl && (
                              <Image
                                src={product.variants[0].imageUrl}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-md border object-cover"
                              />
                            )}
                            {product.name}
                          </td>
                          <td className="text-muted-foreground px-4 py-3">
                            {product.category?.name || "Sem categoria"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-secondary text-secondary-foreground inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium">
                              {product.variants.length}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {formatCentsToBRL(basePrice)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                Editar
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
