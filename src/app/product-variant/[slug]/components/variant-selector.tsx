import type { productVariantTable } from "@/db/schema";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface VariantSelectorProps {
  selectedVariantSlug?: string;
  variants: (typeof productVariantTable.$inferSelect)[];
}

const VariantSelector = ({
  variants,
  selectedVariantSlug,
}: VariantSelectorProps) => {
  return (
    <div className="flex items-center gap-4">
      {variants.map((variant) => (
        <Link
          href={`/product-variant/${variant.slug}`}
          key={variant.id}
          className={
            selectedVariantSlug === variant.slug
              ? "border-primary rounded-xl border-2"
              : ""
          }
        >
          <Image
            src={variant.imageUrl}
            alt={variant.name}
            width={50}
            height={50}
            className="rounded-xl"
          />
        </Link>
      ))}
    </div>
  );
};

export default VariantSelector;
