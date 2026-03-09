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
  // 1. A MÁGICA DO AGRUPAMENTO:
  // Usamos um Map para guardar apenas a PRIMEIRA variante de cada cor.
  const uniqueColorsMap = new Map<string, Variant>();

  variants.forEach((variant) => {
    // Se a cor ainda não está no mapa, adicionamos!
    // Se já está (ex: chegou a Verde M, mas já tínhamos a Verde P), ele ignora.
    if (!uniqueColorsMap.has(variant.color)) {
      uniqueColorsMap.set(variant.color, variant);
    }
  });

  // Transformamos o mapa de volta em um array para fazer o .map() no HTML
  const uniqueVariantsToDisplay = Array.from(uniqueColorsMap.values());

  return (
    <div className="flex flex-wrap gap-3">
      {uniqueVariantsToDisplay.map((variant) => {
        // Verifica se a variante do quadradinho tem a MESMA COR da variante atual da página
        // Isso garante que se o cliente estiver na Verde M, a borda roxa fica na miniatura Verde!
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
