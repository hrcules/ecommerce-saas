"use server";

import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable, storeTable } from "@/db/schema";
import { calculateShipping } from "@/helpers/shipping";
import { authenticatedAction } from "@/lib/safe-action"; // ✅ Escudo

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = authenticatedAction<
  CreateCheckoutSessionSchema,
  { checkoutUrl: string | null }
>(async (data, ctx) => {
  const { userId, storeId } = ctx;
  const { orderId } = createCheckoutSessionSchema.parse(data);

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  // 🛡️ Segurança Nível Militar: O pedido é MEU e é DESTA loja?
  if (!order || order.userId !== userId || order.storeId !== storeId) {
    throw new Error("Pedido não encontrado ou não autorizado.");
  }

  // Precisamos buscar a loja na DB para pegar a Chave Secreta do Stripe e as regras de frete
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.id, storeId),
  });

  if (!store || !store.stripeSecretKey) {
    throw new Error("Esta loja ainda não configurou os pagamentos.");
  }

  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });

  const subtotalInCents = orderItems.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0,
  );

  const freteInCents = calculateShipping(
    subtotalInCents,
    store.fixedShippingFeeInCents || 0,
    store.freeShippingThresholdInCents || null,
  );

  const stripe = new Stripe(store.stripeSecretKey);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: freteInCents,
            currency: "brl",
          },
          display_name: freteInCents === 0 ? "Frete Grátis" : "Frete Fixo",
        },
      },
    ],
    line_items: orderItems.map((orderItem) => {
      return {
        price_data: {
          currency: "brl",
          product_data: {
            name: `${orderItem.productVariant.product.name} - ${orderItem.productVariant.name}`,
            description: orderItem.productVariant.product.description,
            images: [orderItem.productVariant.imageUrl],
          },
          unit_amount: orderItem.priceInCents,
        },
        quantity: orderItem.quantity,
      };
    }),
  });

  return { checkoutUrl: checkoutSession.url };
});
