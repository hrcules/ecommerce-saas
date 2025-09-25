import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import VariantSelector from "./components/variant-selector";
import QuantitySelector from "./components/quantity-selector";

interface ProdutcVariantPageProps {
  params: { slug: string };
}

const ProdutcVariantPage = async ({ params }: ProdutcVariantPageProps) => {
  const { slug } = await params;
  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      product: {
        with: { variants: true },
      },
    },
  });

  if (!productVariant) {
    return notFound();
  }

  const likelyProduct = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariant.product.categoryId),
    with: { variants: true },
  });

  return (
    <>
      <Header />
      <div className="flex flex-col space-y-6">
        <Image
          src={productVariant.imageUrl}
          alt={productVariant.name}
          sizes="100vw"
          width={0}
          height={0}
          className="h-auto w-full object-cover"
        />

        <div className="px-5">
          {/* VARIANTS */}
          <VariantSelector
            selectedVariantSlug={productVariant.slug}
            variants={productVariant.product.variants}
          />
        </div>

        <div className="px-5">
          {/* description */}
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

        <div className="px-5">
          {/* QUANTIDADE */}
          <QuantitySelector />
        </div>
        <div className="flex flex-col space-y-4 px-5">
          {/* Butoes */}
          <Button className="rounded-full" size="lg" variant="outline">
            Adicionar à sacola
          </Button>
          <Button className="rounded-full" size={"lg"}>
            Comprar agora
          </Button>
        </div>

        <div className="px-5">
          <p>{productVariant.product.description}</p>
        </div>

        <ProductList title="Você também pode gostar" products={likelyProduct} />

        <Footer />
      </div>
    </>
  );
};

export default ProdutcVariantPage;
