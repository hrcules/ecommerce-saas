import { db } from "@/db";
import { eq } from "drizzle-orm";
import { categoryTable, productTable } from "@/db/schema";
import { notFound } from "next/navigation";
import Header from "@/components/common/header";
import ProductItem from "@/components/common/product-item";

interface CategoryPageProps {
  params: { slug: string };
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;
  const category = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
  });

  if (!category) {
    return notFound();
  }

  const products = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, category.id),
    with: { variants: true },
  });

  return (
    <>
      <Header />

      <div className="space-y-6 px-5">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, key) => (
            <ProductItem product={product} key={key} />
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
