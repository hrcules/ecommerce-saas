import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers"; // ✅ IMPORTAÇÃO CRÍTICA DO NEXT.JS
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import {
  orderTable,
  orderItemTable,
  productVariantTable,
  storeTable,
  user,
  notificationTable,
} from "@/db/schema";
import {
  sendCustomerReceiptEmail,
  sendStoreOwnerNotificationEmail,
} from "@/lib/email";
import { formatCentsToBRL } from "@/helpers/money";

// ✅ FORÇA A VERCEL A NÃO FAZER CACHE DESTA ROTA
export const dynamic = "force-dynamic";

export const POST = async (request: Request) => {
  // --------------------------------------------------
  // PASSO DE DEBUG 1: VALIDAR O CORPO BRUTO (RAW BODY)
  // --------------------------------------------------
  const text = await request.text();
  console.log("🔍 [DEBUG WH] --- INÍCIO DO DIAGNÓSTICO DEFINITIVO ---");
  console.log("🔍 [DEBUG WH] 1. Comprimento do texto bruto:", text?.length);

  let unverifiedEvent;
  try {
    unverifiedEvent = JSON.parse(text);
  } catch (err) {
    console.error("❌ [DEBUG WH] Falha: O corpo não é um JSON válido.");
    return new NextResponse("JSON Inválido", { status: 400 });
  }

  // --------------------------------------------------
  // PASSO DE DEBUG 2: VALIDAÇÃO DOS METADADOS
  // --------------------------------------------------
  const storeId = unverifiedEvent?.data?.object?.metadata?.storeId;
  console.log("🔍 [DEBUG WH] 2. storeId extraído do JSON:", storeId);

  if (!storeId) {
    console.error(
      "❌ [DEBUG WH] Falha: storeId ausente. Ignorando evento paralelo do Stripe.",
    );
    return new NextResponse("storeId ausente no metadata", { status: 400 });
  }

  // --------------------------------------------------
  // PASSO DE DEBUG 3: CONCORDÂNCIA DO BANCO DE DADOS
  // --------------------------------------------------
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.id, storeId),
  });

  console.log("🔍 [DEBUG WH] 3. Loja encontrada no DB?", !!store);
  if (store) {
    console.log(
      "🔍 [DEBUG WH] 3. Comprimento do Webhook Secret no DB:",
      store.stripeWebhookSecret?.length,
    );
    console.log(
      "🔍 [DEBUG WH] 3. Prefixo do Webhook Secret no DB:",
      store.stripeWebhookSecret?.substring(0, 8),
    );
  }

  if (!store || !store.stripeSecretKey || !store.stripeWebhookSecret) {
    return new NextResponse("Chaves não configuradas", { status: 400 });
  }

  // --------------------------------------------------
  // PASSO DE DEBUG 4: VALIDAÇÃO DO CABEÇALHO DE ASSINATURA (MODO NEXT.JS)
  // --------------------------------------------------
  // ✅ Usando a função nativa do Next.js em vez de request.headers.get
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  console.log("🔍 [DEBUG WH] 4. Cabeçalho signature presente?", !!signature);
  console.log(
    "🔍 [DEBUG WH] 4. Início da assinatura:",
    signature?.substring(0, 30),
  );

  // ✅ Limpeza bruta para evitar caracteres fantasmas do banco de dados
  const cleanWebhookSecret = store.stripeWebhookSecret.replace(/['"\s]/g, "");
  const cleanSecretKey = store.stripeSecretKey.replace(/['"\s]/g, "");

  const stripe = new Stripe(cleanSecretKey);
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature!,
      cleanWebhookSecret,
    );
    console.log(
      "✅ [DEBUG WH] SUCESSO ABSOLUTO: Assinatura validada com precisão!",
    );
  } catch (error: unknown) {
    console.error(
      "❌ [DEBUG WH] ERRO DO CONSTRUCT_EVENT:",
      (error as Error).message,
    );
    return new NextResponse(`Erro na assinatura: ${(error as Error).message}`, {
      status: 400,
    });
  }

  // ==========================================
  // CENÁRIO 1: PAGAMENTO APROVADO! 💰
  // ==========================================
  if (event.type === "checkout.session.completed") {
    console.log(`🟢 [WEBHOOK] Pagamento Aprovado para a loja: ${store.name}`);

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    await db
      .update(orderTable)
      .set({ status: "paid" })
      .where(eq(orderTable.id, orderId));

    try {
      const order = await db.query.orderTable.findFirst({
        where: eq(orderTable.id, orderId),
        with: { shippingAddress: true },
      });

      const emailOrderItems = await db.query.orderItemTable.findMany({
        where: eq(orderItemTable.orderId, orderId),
        with: {
          productVariant: {
            with: { product: true },
          },
        },
      });

      if (order && order.shippingAddress) {
        const owner = await db.query.user.findFirst({
          where: eq(user.id, store.ownerId),
        });

        const subtotalInCents = emailOrderItems.reduce(
          (acc, item) => acc + item.priceInCents * item.quantity,
          0,
        );

        const freteInCents = order.totalPriceInCents - subtotalInCents;

        const formattedItems = emailOrderItems.map((item) => ({
          name: `${item.productVariant.product.name} (${item.productVariant.name})`,
          quantity: item.quantity,
          priceFormatted: formatCentsToBRL(item.priceInCents * item.quantity),
        }));

        const formattedSubtotal = formatCentsToBRL(subtotalInCents);
        const formattedShipping = formatCentsToBRL(freteInCents);
        const formattedTotal = formatCentsToBRL(order.totalPriceInCents);

        await sendCustomerReceiptEmail(
          order.shippingAddress.email,
          order.shippingAddress.fullName,
          order.orderNumber,
          store.name,
          formattedItems,
          formattedSubtotal,
          formattedShipping,
          formattedTotal,
        );

        if (owner && owner.email) {
          await sendStoreOwnerNotificationEmail(
            owner.email,
            order.orderNumber,
            store.name,
            formattedItems,
            formattedSubtotal,
            formattedShipping,
            formattedTotal,
          );

          await db.insert(notificationTable).values({
            userId: owner.id,
            title: "💰 Nova Venda Realizada!",
            message: `O pedido #${order.orderNumber} no valor de ${formattedTotal} acabou de ser pago via Cartão.`,
            type: "sale",
          });
        }
      }
    } catch (emailError) {
      console.error("❌ Erro fatal no bloco de envio de e-mails:", emailError);
    }
  }

  // ==========================================
  // CENÁRIO 2: SESSÃO EXPIRADA OU FALHOU! 🛑
  // ==========================================
  else if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed"
  ) {
    console.log(`🔴 [WEBHOOK] Sessão expirada/falhou. Estornando estoque...`);

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (!orderId) {
      return new NextResponse("Pedido não encontrado", { status: 400 });
    }

    // 1. Marca o pedido como cancelado
    await db
      .update(orderTable)
      .set({ status: "cancelled" })
      .where(eq(orderTable.id, orderId));

    // 2. Busca os itens para saber o que devolver
    const orderItems = await db.query.orderItemTable.findMany({
      where: eq(orderItemTable.orderId, orderId),
    });

    // 3. O Estorno: Devolvemos as quantidades para a prateleira
    for (const item of orderItems) {
      try {
        await db
          .update(productVariantTable)
          .set({
            stock: sql`${productVariantTable.stock} + ${item.quantity}`, // ➕ Soma em vez de subtrair!
          })
          .where(eq(productVariantTable.id, item.productVariantId));
      } catch (error) {
        console.error("❌ Erro ao repor estoque:", error);
      }
    }

    console.log("✅ Estoque estornado com sucesso!");
  }

  return NextResponse.json({ received: true });
};
