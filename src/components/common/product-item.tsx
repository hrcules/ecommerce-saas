"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import type {
  categoryTable,
  productTable,
  productVariantTable,
} from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";
import { cn } from "@/lib/utils";

interface ProductItemProps {
  product: typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
    category: typeof categoryTable.$inferSelect;
  };

  textContainerClassName?: string;
  className?: string;
  pixDiscountPercent?: number; // ✅ NOVO: Recebendo a porcentagem do desconto
}

const ProductItem = ({
  product,
  textContainerClassName,
  className,
  pixDiscountPercent = 0,
}: ProductItemProps) => {
  const params = useParams();
  const pathname = usePathname();
  const storeSlug = params.storeSlug as string;

  const basePath =
    storeSlug && pathname.startsWith(`/store/${storeSlug}`)
      ? `/store/${storeSlug}`
      : "";

  const firstVariant = product.variants[0];

  if (!firstVariant) return null;

  // ✅ Matemática do desconto
  const originalPrice = firstVariant.priceInCents;
  const pixPrice =
    pixDiscountPercent > 0
      ? originalPrice - (originalPrice * pixDiscountPercent) / 100
      : originalPrice;

  return (
    <Link
      href={`${basePath}/category/${product.category.slug}/${firstVariant.slug}`}
      className={cn("group flex flex-col gap-3", className)}
    >
      <div className="bg-muted relative mx-auto aspect-square w-[92%] overflow-hidden rounded-[20px] md:rounded-[28px]">
        <Image
          src={firstVariant.imageUrl}
          alt={firstVariant.name}
          fill
          sizes="(max-width: 768px) 160px, 280px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div
        className={cn(
          "flex w-full flex-col gap-1 px-2",
          textContainerClassName,
        )}
      >
        <p className="text-foreground truncate text-base font-semibold md:text-lg">
          {product.name}
        </p>

        <p className="text-muted-foreground truncate text-sm font-medium">
          {product.description}
        </p>

        {pixDiscountPercent > 0 ? (
          <div className="mt-0.5 flex flex-col">
            <span className="text-muted-foreground text-xs line-through">
              {formatCentsToBRL(originalPrice)}
            </span>
            <p className="text-primary truncate text-lg font-extrabold md:text-xl">
              {formatCentsToBRL(pixPrice)}{" "}
              <span className="text-xs font-bold">no PIX</span>
            </p>
          </div>
        ) : (
          <p className="text-primary mt-0.5 truncate text-lg font-extrabold md:text-xl">
            {formatCentsToBRL(originalPrice)}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductItem;
