"use server";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  cartItemTable,
  cartTable,
  orderItemTable,
  orderTable,
  productVariantTable,
  storeTable,
} from "@/db/schema";
import { calculateShipping } from "@/helpers/shipping";
import { authenticatedAction } from "@/lib/safe-action";

export const finishOrder = authenticatedAction<void, { orderId: string }>(
  async (_, ctx) => {
    const { userId, storeId } = ctx;

    const cart = await db.query.cartTable.findFirst({
      where: and(eq(cartTable.userId, userId), eq(cartTable.storeId, storeId)),
      with: {
        shippingAddress: true,
        items: {
          with: {
            productVariant: {
              with: { product: true },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new Error("Cart not found");
    }
    if (!cart.shippingAddress) {
      throw new Error("Shipping address not found");
    }
    if (cart.items.length === 0) {
      throw new Error("O carrinho está vazio.");
    }

    for (const item of cart.items) {
      if (item.productVariant.stock < item.quantity) {
        throw new Error(
          `Estoque insuficiente para "${item.productVariant.product.name}". Temos apenas ${item.productVariant.stock} unidades.`,
        );
      }
    }

    const store = await db.query.storeTable.findFirst({
      where: eq(storeTable.id, storeId),
    });

    if (!store) {
      throw new Error("Loja não encontrada");
    }

    const subtotalInCents = cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    );

    const shippingInCents = calculateShipping(
      subtotalInCents,
      store.fixedShippingFeeInCents || 0,
      store.freeShippingThresholdInCents || null,
    );

    const totalPriceInCents = subtotalInCents + shippingInCents;

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const orderNumber = Number(`${timestamp}${randomSuffix}`.slice(-9));

    let orderId: string | undefined;

    await db.transaction(async (tx) => {
      if (!cart.shippingAddress) throw new Error("Shipping address not found");

      const [order] = await tx
        .insert(orderTable)
        .values({
          orderNumber,
          storeId: storeId,
          userId: userId,
          totalPriceInCents,
          shippingAddressId: cart.shippingAddress.id,
          status: "pending",
          stripeCheckoutSessionId: "",
        })
        .returning();

      if (!order) {
        throw new Error("Failed to create order");
      }

      orderId = order.id;

      const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> =
        cart.items.map((item) => ({
          orderId: order.id as string,
          productVariantId: item.productVariant.id,
          quantity: item.quantity,
          priceInCents: item.productVariant.priceInCents,
        }));

      await tx.insert(orderItemTable).values(orderItemsPayload);

      for (const item of cart.items) {
        await tx
          .update(productVariantTable)
          .set({
            stock: sql`${productVariantTable.stock} - ${item.quantity}`,
          })
          .where(eq(productVariantTable.id, item.productVariant.id));
      }

      await tx.delete(cartItemTable).where(eq(cartItemTable.cartId, cart.id));
      await tx.delete(cartTable).where(eq(cartTable.id, cart.id));
    });

    if (!orderId) {
      throw new Error("Failed to create order");
    }

    return { orderId };
  },
);
