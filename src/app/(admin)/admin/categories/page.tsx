import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { CategoriesClient } from "./components/categories-client";

export default async function CategoriesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session!.user.id),
  });

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store!.id),
    orderBy: (category, { desc }) => desc(category.createdAt),
  });

  return <CategoriesClient categories={categories} />;
}
