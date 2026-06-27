import { desc, eq } from "drizzle-orm";
import Image from "next/image";

import CategorySelector from "@/components/common/category-selector";
import Header from "@/components/common/header/index";
import { ProductList } from "@/components/common/product-list";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";
import { getTenantStore } from "@/lib/tentat";
import { BannerRenderer } from "@/components/common/banner-renderer";

export default async function Home() {
  const store = await getTenantStore();

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
        {/* === BANNER PRINCIPAL (CARROSSEL 1) === */}
        {(store.banner1MobileUrl || store.banner1DesktopUrl) && (
          <section className="mx-auto mt-6 w-full max-w-7xl px-5 md:px-10">
            {store.banner1MobileUrl && (
              <Image
                src={store.banner1MobileUrl}
                alt={`Banner Mobile ${store.name}`}
                height={0}
                width={0}
                sizes="100vw"
                className="h-auto w-full rounded-[24px] md:hidden"
                priority
              />
            )}
            {store.banner1DesktopUrl && (
              <Image
                src={store.banner1DesktopUrl}
                alt={`Banner Desktop ${store.name}`}
                height={0}
                width={0}
                sizes="100vw"
                className="hidden h-auto w-full rounded-[32px] md:block"
                priority
              />
            )}
          </section>
        )}

        <ProductList products={products} title="Mais vendidos" store={store} />
        <ProductList products={products} title="Ofertas" store={store} />

        <section className="mx-auto w-full max-w-7xl px-5 md:hidden">
          <CategorySelector categories={categories} />
        </section>

        {/* === BANNER SECUNDÁRIO (CARROSSEL 2) === */}
        {(store.banner2MobileUrl || store.banner2DesktopUrl) && (
          <section className="mx-auto mt-6 w-full max-w-7xl px-5 md:px-10">
            {store.banner2MobileUrl && (
              <Image
                src={store.banner2MobileUrl}
                alt={`Banner Mobile ${store.name}`}
                height={0}
                width={0}
                sizes="100vw"
                className="h-auto w-full rounded-[24px] md:hidden"
                priority
              />
            )}
            {store.banner2DesktopUrl && (
              <Image
                src={store.banner2DesktopUrl}
                alt={`Banner Desktop ${store.name}`}
                height={0}
                width={0}
                sizes="100vw"
                className="hidden h-auto w-full rounded-[32px] md:block"
                priority
              />
            )}
          </section>
        )}

        <ProductList
          products={newlyCreatedProducts}
          title="Novos produtos"
          store={store}
        />
      </main>
    </div>
  );
}
