import { eq } from "drizzle-orm";
import { db } from "@/db";
import { categoryTable } from "@/db/schema";

import HeaderClient from "./header-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const Header = async () => {
  const store = await db.query.storeTable.findFirst();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!store) {
    return null;
  }

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  return (
    <HeaderClient categories={categories} store={store} session={session} />
  );
};

export default Header;
