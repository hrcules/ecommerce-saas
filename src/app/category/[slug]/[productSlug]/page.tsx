import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Header from "@/components/common/header";
import { ProductList } from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

import ProductActions from "./components/product-actions";
import VariantSelector from "./components/variant-selector";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug, productSlug } = await params;

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, productSlug),
    with: {
      product: {
        with: { variants: true, category: true },
      },
    },
  });

  if (!productVariant) {
    return notFound();
  }

  const likelyProduct = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariant.product.categoryId),
    with: { variants: true, category: true },
  });

  return (
    <>
      <Header />
      <div className="flex flex-col space-y-6">
        <div className="px-5">
          <Image
            src={productVariant.imageUrl}
            alt={productVariant.name}
            sizes="100vw"
            width={0}
            height={0}
            className="h-auto w-full rounded-3xl object-cover"
          />
        </div>

        <div className="px-5">
          <VariantSelector
            currentSlug={productVariant.slug}
            variants={productVariant.product.variants}
            categorySlug={slug}
          />
        </div>

        <div className="px-5">
          <h2 className="text-lg font-semibold">
            {productVariant.product.name}
          </h2>
          <h3 className="text-muted-foreground text-sm">
            {productVariant.name}
          </h3>

          <h3 className="text-lg font-semibold">
            {formatCentsToBRL(productVariant.priceInCents)}
          </h3>
        </div>

        <ProductActions productVariantId={productVariant.id} />

        <div className="px-5">
          <p>{productVariant.product.description}</p>
        </div>

        <ProductList title="Você também pode gostar" products={likelyProduct} />
      </div>
    </>
  );
};

export default ProductPage;
