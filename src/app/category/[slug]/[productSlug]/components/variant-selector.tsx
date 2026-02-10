"use client";

import Image from "next/image";
import Link from "next/link";

import type { productVariantTable } from "@/db/schema";

interface VariantSelectorProps {
  currentSlug?: string;
  variants: (typeof productVariantTable.$inferSelect)[];
  categorySlug: string;
}
const VariantSelector = ({
  variants,
  currentSlug,
  categorySlug,
}: VariantSelectorProps) => {
  if (variants.length <= 1) return null;
  return (
    <div className="flex items-center gap-4">
      {variants.map((variant) => {
        const isSelected = currentSlug === variant.slug;

        return (
          <Link
            key={variant.id}
            href={`/category/${categorySlug}/${variant.slug}`}
            scroll={false}
            replace
            className={isSelected ? "border-primary rounded-xl border-2" : ""}
          >
            <Image
              src={variant.imageUrl}
              alt={variant.name}
              width={75}
              height={75}
              className="rounded-xl"
            />
          </Link>
        );
      })}
    </div>
  );
};

export default VariantSelector;
