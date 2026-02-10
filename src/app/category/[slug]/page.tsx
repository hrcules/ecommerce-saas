import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import Header from "@/components/common/header";
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

  const category = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
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
