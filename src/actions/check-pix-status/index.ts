"use server";

import { eq } from "drizzle-orm";
import MercadoPagoConfig, { Payment } from "mercadopago";

import { db } from "@/db";
import { orderTable, storeTable } from "@/db/schema";

export async function checkPixStatusAction(orderId: string) {
  try {
    // 1. Buscamos o pedido para pegar o ID do pagamento gerado no MP
    const order = await db.query.orderTable.findFirst({
      where: eq(orderTable.id, orderId),
    });

    if (!order || !order.pixPaymentId) return null;

    // Se o banco já estiver como pago (por algum Webhook futuro), abortamos
    if (order.status === "paid") return "approved";

    // 2. Buscamos o Token da loja dona do pedido
    const store = await db.query.storeTable.findFirst({
      where: eq(storeTable.id, order.storeId),
    });

    if (!store || !store.mpAccessToken) return null;

    // 3. Consultamos o status real direto no Mercado Pago
    const client = new MercadoPagoConfig({ accessToken: store.mpAccessToken });
    const payment = new Payment(client);
    const mpPayment = await payment.get({ id: order.pixPaymentId });

    // 4. Se o MP confirmar que o dinheiro caiu, atualizamos o nosso banco!
    if (mpPayment.status === "approved") {
      await db
        .update(orderTable)
        .set({
          status: "paid",
          updatedAt: new Date(),
        })
        .where(eq(orderTable.id, orderId));

      return "approved";
    }

    return mpPayment.status;
  } catch (error) {
    console.error("Erro ao verificar status do PIX:", error);
    return null;
  }
}
