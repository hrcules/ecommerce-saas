import { desc, eq } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Header from "@/components/common/header/index";
import { ProductList } from "@/components/common/product-list";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

export default async function Home() {
  const store = await db.query.storeTable.findFirst();

  if (!store) {
    return (
      <div className="p-10 text-center font-bold">
        Nenhuma loja configurada no sistema.
      </div>
    );
  }

  const products = await db.query.productTable.findMany({
    where: eq(productTable.storeId, store.id),
    with: { variants: true, category: true },
  });

  const newlyCreatedProducts = await db.query.productTable.findMany({
    where: eq(productTable.storeId, store.id),
    orderBy: [desc(productTable.createdAt)],
    with: { variants: true, category: true },
  });
  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 space-y-8 pb-12">
        <section className="mx-auto mt-6 w-full max-w-7xl px-5 md:px-10">
          <Image
            src="/banner-1.png"
            alt="Leve uma vida com estilo"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full rounded-[24px] md:hidden"
            priority
          />
          <Image
            src="/banner_desktop-1.png"
            alt="Leve uma vida com estilo"
            height={0}
            width={0}
            sizes="100vw"
            className="hidden h-auto w-full rounded-[32px] md:block"
            priority
          />
        </section>

        <ProductList products={products} title="Mais vendidos" />
        <ProductList products={products} title="Ofertas" />

        <section className="mx-auto w-full max-w-7xl px-5 md:hidden">
          <CategorySelector categories={categories} />
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 md:px-10">
          <Image
            src="/banner-2.png"
            alt="Conforto e Personalidade"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full rounded-[24px] md:hidden"
          />
          <Image
            src="/banner_desktop-1.png"
            alt="Conforto e Personalidade"
            height={0}
            width={0}
            sizes="100vw"
            className="hidden h-auto w-full rounded-[32px] md:block"
          />
        </section>

        <ProductList products={newlyCreatedProducts} title="Novos produtos" />
      </main>
    </div>
  );
}
