import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { db } from "@/db";
import { categoryTable, productTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";
import { CreateVariantDialog } from "./components/create-variant-dialog";
import { EditProductDialog } from "./components/edit-product-dialog";
import { DeleteVariantButton } from "./components/delete-variant-button";
import { EditVariantDialog } from "./components/edit-variant-dialog";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const { id } = await params;

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

  const product = await db.query.productTable.findFirst({
    where: and(eq(productTable.id, id), eq(productTable.storeId, store.id)),
    with: {
      category: true,
      variants: true,
    },
  });

  if (!product) {
    return notFound();
  }

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  const existingColors = Array.from(
    new Set(product.variants.map((v) => v.color)),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 md:px-0">
      {/* ✅ Ajuste de Responsividade no Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-4 sm:items-center">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="mt-1 shrink-0 sm:mt-0"
          >
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {product.name}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gerencie os detalhes e variações deste produto.
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Grid ajustado para dar mais espaço à tabela em telas médias */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna Principal: Resumo do Produto */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalhes Principais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Categoria
                </p>
                <p className="font-medium">
                  {product.category?.name || "Sem categoria"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Descrição
                </p>
                <p className="mt-1 text-sm whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
              <EditProductDialog
                product={{
                  id: product.id,
                  name: product.name,
                  description: product.description,
                  categoryId: product.categoryId,
                }}
                categories={categories}
                colorPrimary={store.colorPrimary}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Secundária: Gerenciador de Variantes */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <CardTitle className="text-lg">Variações do Produto</CardTitle>
              <CreateVariantDialog
                productId={product.id}
                existingColors={existingColors}
              />
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {/* ✅ Wrapper para Scroll Horizontal em telas pequenas */}
              <div className="w-full overflow-x-auto border-y sm:rounded-md sm:border">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-muted/50 text-muted-foreground border-b text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 font-medium">Imagem</th>
                      <th className="px-4 py-3 font-medium">Nome/Cor</th>
                      <th className="px-4 py-3 font-medium">Preço</th>
                      <th className="px-4 py-3 font-medium">Estoque</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => {
                      // ✅ Lógica para saber se a variante está em oferta
                      const isPromo =
                        variant.compareAtPriceInCents &&
                        variant.compareAtPriceInCents > variant.priceInCents;

                      return (
                        <tr
                          key={variant.id}
                          className="hover:bg-muted/20 border-b transition-colors last:border-0"
                        >
                          <td className="px-4 py-3">
                            {variant.imageUrl ? (
                              <Image
                                src={variant.imageUrl}
                                alt={variant.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-md border object-cover"
                              />
                            ) : (
                              <div className="bg-muted text-muted-foreground flex h-12 w-12 items-center justify-center rounded-md border text-xs">
                                Sem Foto
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            <p>{variant.name}</p>
                            <p className="text-muted-foreground text-xs">
                              Cor: {variant.color} | Tamanho: {variant.size}
                            </p>
                          </td>

                          {/* ✅ Exibição inteligente do Preço / Oferta */}
                          <td className="px-4 py-3 font-medium">
                            {isPromo ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-muted-foreground text-xs line-through">
                                  {formatCentsToBRL(
                                    variant.compareAtPriceInCents!,
                                  )}
                                </span>
                                <span className="text-primary font-bold">
                                  {formatCentsToBRL(variant.priceInCents)}
                                </span>
                                <span className="mt-1 w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                  Oferta
                                </span>
                              </div>
                            ) : (
                              <span className="text-primary">
                                {formatCentsToBRL(variant.priceInCents)}
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                                variant.stock > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {variant.stock > 0
                                ? `${variant.stock} un.`
                                : "Esgotado"}
                            </span>
                          </td>

                          {/* ✅ Botões de ação em Flexbox para não quebrar layout */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <CreateVariantDialog
                                productId={product.id}
                                existingColors={existingColors}
                                isDuplicateMode={true}
                                initialData={{
                                  priceInCents: variant.priceInCents,
                                  stock: variant.stock,
                                  color: variant.color,
                                  imageUrl: variant.imageUrl,
                                }}
                              />
                              <EditVariantDialog
                                productId={product.id}
                                existingColors={existingColors}
                                variant={variant}
                                colorPrimary={store.colorPrimary}
                              />
                              <DeleteVariantButton
                                variantId={variant.id}
                                productId={product.id}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
