"use server";

import { eq } from "drizzle-orm";
import MercadoPagoConfig, { Payment } from "mercadopago";

import { db } from "@/db";
import { orderItemTable, orderTable, storeTable } from "@/db/schema";
import { calculateShipping } from "@/helpers/shipping";
import { authenticatedAction } from "@/lib/safe-action";

import { CreatePixPaymentSchema, createPixPaymentSchema } from "./schema";

export const createPixPaymentAction = authenticatedAction<
  CreatePixPaymentSchema,
  { success: boolean }
>(async (data, ctx) => {
  const { userId, storeId } = ctx;

  // ✅ Padrão Sênior: O Zod faz o parse manual da data aqui dentro!
  const { orderId } = createPixPaymentSchema.parse(data);

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
    with: { shippingAddress: true },
  });

  if (!order || order.userId !== userId || order.storeId !== storeId) {
    throw new Error("Pedido não encontrado ou não autorizado.");
  }

  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.id, storeId),
  });

  // IMPORTANTE: A coluna mpAccessToken precisa existir na sua storeTable
  if (!store || !store.mpAccessToken) {
    throw new Error("Esta loja não configurou o Mercado Pago.");
  }

  const orderItems = await db.query.orderItemTable.findMany({
    where: eq(orderItemTable.orderId, orderId),
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

  const totalInCents = subtotalInCents + freteInCents;
  const totalInBRL = Number((totalInCents / 100).toFixed(2));

  const client = new MercadoPagoConfig({
    accessToken: store.mpAccessToken,
  });
  const payment = new Payment(client);

  try {
    const result = await payment.create({
      body: {
        transaction_amount: totalInBRL,
        payment_method_id: "pix",
        payer: {
          email: order.shippingAddress?.email || "email@cliente.com",
        },
        external_reference: orderId,
        description: `Compra na loja ${store.name} - Pedido #${order.orderNumber}`,
      },
    });

    // Salvamos o QR Code no banco
    await db
      .update(orderTable)
      .set({
        pixQrCode: result.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64:
          result.point_of_interaction?.transaction_data?.qr_code_base64,
        pixPaymentId: String(result.id),
      })
      .where(eq(orderTable.id, orderId));

    return { success: true };
  } catch (error) {
    console.error("Erro MP:", error);
    throw new Error("Falha ao se comunicar com o Mercado Pago.");
  }
});
