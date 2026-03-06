import { db } from "@/db";

import HeaderClient from "./header-client";
import { categoryTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const Header = async () => {
  const store = await db.query.storeTable.findFirst();

  if (!store) {
    return null;
  }

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  return <HeaderClient categories={categories} />;
};

export default Header;
