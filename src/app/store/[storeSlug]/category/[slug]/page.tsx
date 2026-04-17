import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import Header from "@/components/common/header/index";
import { ProductGrid } from "@/components/common/product-list";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const store = await db.query.storeTable.findFirst();

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
      <div className="py-8">
        <ProductGrid products={category.products} title={category.name} />
      </div>
    </>
  );
}
