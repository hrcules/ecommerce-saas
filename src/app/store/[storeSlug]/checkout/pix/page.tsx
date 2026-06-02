import { eq } from "drizzle-orm";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";

import { db } from "@/db";
import { orderTable } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "./components/copy-button";
import { PixStatusChecker } from "./components/pix-status-checker";

interface PixPageProps {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ orderId?: string }>;
}

export default async function PixCheckoutPage(props: PixPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { orderId } = searchParams;
  const { storeSlug } = params;

  if (!orderId) {
    redirect("/cart");
  }

  const order = await db.query.orderTable.findFirst({
    where: eq(orderTable.id, orderId),
  });

  if (!order) notFound();

  if (order.status !== "pending") {
    if (order.status === "paid")
      redirect(`/checkout/success?orderId=${orderId}`);
    redirect("/cart");
  }

  const qrCodeBase64 = order.pixQrCodeBase64;
  const qrCodeCopiaCola = order.pixQrCode;

  if (!qrCodeBase64 || !qrCodeCopiaCola) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <AlertCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <CardTitle>Erro no PIX</CardTitle>
            <CardDescription>
              Não conseguimos recuperar o QR Code deste pedido.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="space-y-2 border-b pb-4 text-center">
          <div className="mx-auto mb-2 w-fit rounded-full bg-emerald-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Pague via PIX</CardTitle>
          <CardDescription className="text-base">
            Abra o app do seu banco e escaneie o código abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-8">
          <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-4 shadow-inner">
            <Image
              src={`data:image/jpeg;base64,${qrCodeBase64}`}
              alt="QR Code PIX"
              width={250}
              height={250}
              className="pointer-events-none rounded-lg"
            />
          </div>

          <div className="w-full space-y-2 text-center">
            <p className="text-lg font-semibold">
              Total: R${" "}
              {(order.totalPriceInCents / 100).toFixed(2).replace(".", ",")}
            </p>
            <p className="text-muted-foreground text-sm">
              O pagamento será aprovado em instantes.
            </p>
          </div>

          <div className="w-full space-y-3 border-t pt-4">
            <p className="text-muted-foreground text-center text-sm font-medium">
              Ou pague com o código Copia e Cola
            </p>

            <div className="relative">
              <input
                readOnly
                value={qrCodeCopiaCola}
                className="bg-muted text-muted-foreground w-full cursor-default rounded-md border p-3 pr-12 text-xs outline-none"
              />
              <CopyButton textToCopy={qrCodeCopiaCola} />
            </div>
          </div>
        </CardContent>
      </Card>

      <PixStatusChecker orderId={orderId} storeSlug={storeSlug} />
    </div>
  );
}
