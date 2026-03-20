"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

// NOVO: Importando o Helper de Frete!
import { calculateShipping } from "@/helpers/shipping";

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema,
) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key is not set");
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  const { orderId } = createCheckoutSessionSchema.parse(data);
  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });
  if (!order) {
    throw new Error("Order not found");
  }
  if (order.userId !== session.user.id) {
    throw new Error("Unauthorized");
  }
  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
    with: {
      productVariant: { with: { product: true } },
    },
  });

  // ==========================================
  // NOVO: Lógica de Cálculo do Frete para o Stripe
  // ==========================================
  const store = await db.query.storeTable.findFirst();

  // 1. Calculamos o subtotal baseado nos itens do pedido
  const subtotalInCents = orderItems.reduce(
    (acc, item) => acc + item.priceInCents * item.quantity,
    0,
  );

  // 2. Usamos a mesma regra Sênior do frontend
  const freteInCents = calculateShipping(
    subtotalInCents,
    store?.fixedShippingFeeInCents || 0,
    store?.freeShippingThresholdInCents || null,
  );
  // ==========================================

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
    metadata: {
      orderId,
    },

    // NOVO: Injetando o frete de forma nativa no Stripe!
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: freteInCents,
            currency: "brl", // Moeda Real
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
};
