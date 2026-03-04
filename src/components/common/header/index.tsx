import { db } from "@/db";

// Agora ele importa o filho que está na mesma pasta
import HeaderClient from "./header-client";

const Header = async () => {
  const categories = await db.query.categoryTable.findMany();

  return <HeaderClient categories={categories} />;
};

export default Header;
