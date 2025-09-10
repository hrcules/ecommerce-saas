import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const userTable = pgTable("user", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
});

export const categoryTable = pgTable("category", {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoryRelations = relations(categoryTable, ({ many }) => {
  return {
    products: many(productTable),
  };
});

export const productTable = pgTable("product", {
  id: uuid().defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => categoryTable.id)
    .notNull(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productRelations = relations(productTable, ({ one, many }) => {
  return {
    category: one(categoryTable, {
      fields: [productTable.categoryId],
      references: [categoryTable.id],
    }),
    variants: many(productVariantTable),
  };
});

export const productVariantTable = pgTable("product_variant", {
  id: uuid().defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => productTable.id)
    .notNull(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  color: text().notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariantRelations = relations(
  productVariantTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
  }),
);
