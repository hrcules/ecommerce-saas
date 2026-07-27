import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import Header from "@/components/common/header/index";
import { ProductGrid } from "@/components/common/product-list";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { getTenantStore } from "@/lib/tentat";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const store = await getTenantStore();

  if (!store) {
    return (
      <div className="p-10 text-center font-bold">
        Nenhuma loja configurada no sistema.
      </div>
    );
  }

  const category = await db.query.categoryTable.findFirst({
    where: and(
      eq(categoryTable.slug, slug),
      eq(categoryTable.storeId, store.id),
    ),
    with: {
      products: {
        with: {
          variants: true,
          category: true,
        },
      },
    },
  });

  if (!category) {
    return notFound();
  }

  return (
    <>
      <Header />
      {/* Container com altura mínima para manter o rodapé lá embaixo caso não tenha produtos */}
      <div className="flex min-h-[50vh] flex-col py-8">
        {category.products.length > 0 ? (
          <ProductGrid
            products={category.products}
            title={category.name}
            store={store}
          />
        ) : (
          <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-4 px-4 text-center">
            <div className="bg-muted/50 rounded-full p-6">
              <svg
                className="text-muted-foreground/50 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                ></path>
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                {category.name}
              </h2>
              <p className="text-muted-foreground mx-auto max-w-md">
                Ainda não há nenhum produto disponível nesta categoria. Volte
                novamente mais tarde!
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
