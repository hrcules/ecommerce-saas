import { eq } from "drizzle-orm";
import { headers } from "next/headers"; // Importante!
import { db } from "@/db";
import { categoryTable } from "@/db/schema";
import { auth } from "@/lib/auth"; // Importante!

import HeaderClient from "./header-client";

const Header = async () => {
  // Lemos o cookie direto do servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const store = await db.query.storeTable.findFirst();

  if (!store) {
    return null;
  }

  const categories = await db.query.categoryTable.findMany({
    where: eq(categoryTable.storeId, store.id),
  });

  // Passamos a sessão como propriedade
  return (
    <HeaderClient categories={categories} store={store} session={session} />
  );
};

export default Header;
