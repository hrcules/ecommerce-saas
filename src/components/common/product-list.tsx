"use client";

import {
  categoryTable,
  productTable,
  type productVariantTable,
} from "@/db/schema";

import ProductItem from "./product-item";

interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
    category: typeof categoryTable.$inferSelect; // <--- ADICIONE ESTA LINHA OBRIGATORIAMENTE
  })[];
}

const ProductList = ({ title, products }: ProductListProps) => {
  return (
    <div className="space-y-6">
      <h3 className="px-5 font-semibold">{title}</h3>
      <div className="flex w-full gap-4 overflow-x-auto px-5 [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <ProductItem
            product={product}
            key={product.id}
            textContainerClassName="w-full"
          />
        ))}
      </div>
    </div>
  );
};

const ProductGrid = ({ title, products }: ProductListProps) => {
  return (
    <div className="space-y-6 pb-10">
      <h3 className="px-5 font-semibold">{title}</h3>
      <div className="grid grid-cols-2 gap-4 px-5 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem
            key={product.id}
            product={product}
            textContainerClassName="w-full max-w-none"
          />
        ))}
      </div>
    </div>
  );
};

export { ProductList, ProductGrid };
