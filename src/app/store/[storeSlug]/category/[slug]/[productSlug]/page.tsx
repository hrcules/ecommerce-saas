import { and, eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Header from "@/components/common/header/index";
import { ProductList } from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";

import ProductActions from "./components/product-actions";
import VariantSelector from "./components/variant-selector";

import { getTenantStore } from "@/lib/tentat";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug, productSlug } = await params;

  const store = await getTenantStore();

  if (!store) {
    return (
      <div className="p-10 text-center font-bold">
        Nenhuma loja configurada no sistema.
      </div>
    );
  }

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, productSlug),
    with: {
      product: {
        with: { variants: true, category: true },
      },
    },
  });

  if (!productVariant || productVariant.product.storeId !== store.id) {
    return notFound();
  }

  const likelyProduct = await db.query.productTable.findMany({
    where: and(
      eq(productTable.categoryId, productVariant.product.categoryId),
      eq(productTable.storeId, store.id),
    ),
    with: { variants: true, category: true },
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 pt-6 pb-12">
        <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            <div className="flex w-full flex-col">
              <Image
                src={productVariant.imageUrl}
                alt={productVariant.name}
                sizes="(max-width: 768px) 100vw, 50vw"
                width={0}
                height={0}
                className="h-auto w-full rounded-3xl object-cover md:rounded-[32px]"
                priority
              />
            </div>

            <div className="flex flex-col gap-6 md:py-6">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                  {productVariant.product.name}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {productVariant.name}
                </p>
                {/* <p className="mt-2 text-xl font-bold md:text-2xl">
                  {formatCentsToBRL(productVariant.priceInCents)}
                </p> */}
              </div>

              <div className="flex flex-col gap-3">
                <VariantSelector
                  currentSlug={productVariant.slug}
                  variants={productVariant.product.variants}
                  categorySlug={slug}
                />
              </div>

              <ProductActions
                variants={productVariant.product.variants.filter(
                  (v) => v.color === productVariant.color,
                )}
              />

              <div className="mt-2 flex flex-col">
                <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                  {productVariant.product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 md:mt-24">
          <ProductList
            title="Você também pode gostar"
            products={likelyProduct}
          />
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
