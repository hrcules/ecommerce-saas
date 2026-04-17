"use client";

import Image from "next/image";
import Link from "next/link";

interface Variant {
  id: string;
  name: string;
  slug: string;
  color: string;
  size: string;
  imageUrl: string;
}

interface VariantSelectorProps {
  currentSlug: string;
  variants: Variant[];
  categorySlug: string;
}

export default function VariantSelector({
  currentSlug,
  variants,
  categorySlug,
}: VariantSelectorProps) {
  const uniqueColorsMap = new Map<string, Variant>();

  variants.forEach((variant) => {
    if (!uniqueColorsMap.has(variant.color)) {
      uniqueColorsMap.set(variant.color, variant);
    }
  });

  const uniqueVariantsToDisplay = Array.from(uniqueColorsMap.values());

  return (
    <div className="flex flex-wrap gap-3">
      {uniqueVariantsToDisplay.map((variant) => {
        const isSelectedColor =
          variants.find((v) => v.slug === currentSlug)?.color === variant.color;

        return (
          <Link
            key={variant.id}
            href={`/category/${categorySlug}/${variant.slug}`}
            className={`relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-all ${
              isSelectedColor
                ? "border-primary ring-primary ring-2 ring-offset-1"
                : "hover:border-muted-foreground/50 border-transparent"
            }`}
          >
            <Image
              src={variant.imageUrl}
              alt={`Cor ${variant.color}`}
              fill
              className="object-cover"
              sizes="64px"
            />
          </Link>
        );
      })}
    </div>
  );
}
