import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";

import HeaderClient from "./header-client";

const Header = async () => {
  const store = await db.query.storeTable.findFirst();

  if (!store) {
    return null;
  }

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  return <HeaderClient categories={categories} store={store} />;
};

export default Header;
