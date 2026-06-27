import Image from "next/image";

interface BannerRendererProps {
  url: string | null;
  alt: string;
  className?: string;
  fallbackColor: string;
}

export const BannerRenderer = ({
  url,
  alt,
  className,
  fallbackColor,
}: BannerRendererProps) => {
  // Se não tem URL, renderiza um placeholder elegante com a cor da loja
  if (!url) {
    return (
      <div className={className} style={{ backgroundColor: fallbackColor }}>
        <div className="flex h-full w-full items-center justify-center opacity-40">
          {/* Você pode colocar o logo da loja aqui opcionalmente */}
        </div>
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      height={0}
      width={0}
      sizes="100vw"
      className={className}
      priority
    />
  );
};
