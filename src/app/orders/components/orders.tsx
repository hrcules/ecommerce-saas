"use client";

import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { orderTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

interface OrdersProps {
  orders: Array<{
    id: string;
    totalPriceInCents: number;
    orderNumber: number | null;
    status: (typeof orderTable.$inferSelect)["status"];
    createdAt: Date;
    items: Array<{
      id: string;
      imageUrl: string;
      productName: string;
      productVariantName: string;
      priceInCents: number;
      quantity: number;
    }>;
  }>;
}

const Orders = ({ orders }: OrdersProps) => {
  function formatOrderNumber(orderNumber: number): string {
    return orderNumber.toString().padStart(4, "0");
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent>
            <Accordion type="single" collapsible key={order.id}>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex flex-col gap-1">
                    {order.status === "paid" && <Badge>Pago</Badge>}
                    {order.status === "pending" && (
                      <Badge variant="destructive">Pagamento pendente</Badge>
                    )}
                    <p>Número do pedido</p>
                    <p className="text-accent-foreground text-sm">
                      {order.orderNumber &&
                        `#${formatOrderNumber(order.orderNumber)}`}
                    </p>
                    {order.status === "canceled" && (
                      <Badge variant="destructive">Cancelado</Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-accent-foreground text-sm">
                    Pedido realizado em:{" "}
                    <span className="font-medium">
                      {order.createdAt.toLocaleDateString()} às{" "}
                      {order.createdAt.toLocaleTimeString()}
                    </span>
                  </p>

                  <Separator className="my-4" />

                  {order.items.map((product, index) => (
                    <>
                      <div
                        className="my-5 flex items-center justify-between"
                        key={product.id}
                      >
                        <div className="flex items-center gap-4">
                          <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            width={78}
                            height={78}
                            className="rounded-lg"
                          />
                          <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold">
                              {product.productName}
                            </p>
                            <p className="text-muted-foreground text-xs font-medium">
                              {product.productVariantName} x {product.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-2">
                          <p className="text-sm font-bold">
                            {formatCentsToBRL(
                              product.priceInCents * product.quantity,
                            )}
                          </p>
                        </div>
                      </div>
                      {index !== order.items.length - 1 && <Separator />}
                    </>
                  ))}
                  <div className="py-5">
                    <Separator />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm">Subtotal</p>
                      <p className="text-muted-foreground text-sm font-medium">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Frete</p>
                      <p className="text-muted-foreground text-sm font-medium">
                        GRÁTIS
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm">Total</p>
                      <p className="text-sm font-semibold">
                        {formatCentsToBRL(order.totalPriceInCents)}
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default Orders;
