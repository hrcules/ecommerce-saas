import { and, desc, eq, gte, lte } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { orderTable, storeTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatCentsToBRL } from "@/helpers/money";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrderStatusSelector } from "./components/order-status-selector";

import OrdersFilter from "./components/orders-filter";

interface AdminOrdersPageProps {
  searchParams: Promise<{
    start?: string;
    end?: string;
  }>;
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const { start, end } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // 1. Identifica a loja do lojista
  const store = await db.query.storeTable.findFirst({
    where: eq(storeTable.ownerId, session.user.id),
  });

  if (!store) {
    redirect("/");
  }

  // 2. Monta as condições do filtro Dinamicamente
  const conditions = [eq(orderTable.storeId, store.id)];

  if (start) {
    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);
    conditions.push(gte(orderTable.createdAt, startDate));
  }

  if (end) {
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orderTable.createdAt, endDate));
  }

  // 3. Consulta Profunda (Deep Fetch): Trazendo Endereço, Itens, Variante e Produto Pai!
  const orders = await db.query.orderTable.findMany({
    where: and(...conditions),
    orderBy: [desc(orderTable.createdAt)],
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Pedidos</h2>
        <p className="text-muted-foreground">Gerencie as vendas da sua loja.</p>
      </div>

      <OrdersFilter />

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {orders.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Nenhum pedido encontrado neste período.
              </p>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card flex flex-col gap-4 rounded-xl border p-5"
                >
                  {/* Cabeçalho do Pedido */}
                  <div className="flex flex-col items-start justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                    <div>
                      <div className="mb-1 flex items-center gap-3">
                        <p className="text-lg font-bold">
                          #{order.orderNumber}
                        </p>
                        {/* A MÁGICA ACONTECE AQUI: O nosso dropdown interativo! */}
                        <OrderStatusSelector
                          orderId={order.id}
                          currentStatus={order.status}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col md:items-end">
                      <p className="text-primary text-2xl font-bold">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </p>
                    </div>
                  </div>

                  {/* Corpo do Pedido: Informações Detalhadas */}
                  <div className="grid grid-cols-1 gap-8 pt-2 md:grid-cols-2">
                    {/* Coluna 1: Dados do Cliente */}
                    <div className="space-y-2">
                      <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                        Dados do Cliente
                      </h4>
                      {order.shippingAddress ? (
                        <div className="space-y-1 text-sm">
                          <p className="text-base font-medium">
                            {order.shippingAddress.fullName}
                          </p>
                          <p>
                            Email:{" "}
                            <span className="text-muted-foreground">
                              {order.shippingAddress.email}
                            </span>
                          </p>
                          <p>
                            Telefone:{" "}
                            <span className="text-muted-foreground">
                              {order.shippingAddress.phone}
                            </span>
                          </p>
                          <p className="text-muted-foreground pt-2">
                            {order.shippingAddress.address},{" "}
                            {order.shippingAddress.number}
                            {order.shippingAddress.complement &&
                              ` - ${order.shippingAddress.complement}`}
                            <br />
                            {order.shippingAddress.city} -{" "}
                            {order.shippingAddress.state} | CEP:{" "}
                            {order.shippingAddress.zipCode}
                          </p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Endereço não encontrado.
                        </p>
                      )}
                    </div>

                    {/* Coluna 2: Itens do Pedido */}
                    <div className="space-y-3">
                      <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
                        Itens do Pedido ({order.items.length})
                      </h4>
                      <ul className="space-y-3">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="bg-muted/30 flex items-start justify-between rounded-md p-2 text-sm"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {item.quantity}x{" "}
                                {item.productVariant.product.name}
                              </span>
                              <span className="text-muted-foreground text-xs">
                                Variação: {item.productVariant.name}
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatCentsToBRL(
                                item.priceInCents * item.quantity,
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
