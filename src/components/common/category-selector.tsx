import Link from "next/link";

import { categoryTable } from "@/db/schema";

import { Button } from "../ui/button";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
  storeColor: string;
}

const CategorySelector = ({
  categories,
  storeColor,
}: CategorySelectorProps) => {
  const lightBackgroundColor = `${storeColor}6A`;

  return (
    <div
      className="rounded-3xl p-6"
      style={{ backgroundColor: lightBackgroundColor }}
    >
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Button
            variant={"ghost"}
            key={category.id}
            asChild
            className="h-auto w-full rounded-2xl bg-white px-3 py-3 text-center text-xs leading-tight font-semibold break-words whitespace-normal"
          >
            <Link href={`/category/${category.slug}`}>{category.name}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
