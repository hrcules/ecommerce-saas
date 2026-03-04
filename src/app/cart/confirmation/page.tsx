import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import Header from "@/components/common/header/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { productVariantTable, shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import { formatAddress } from "../helpers/address";
import FinishOrderButton from "./components/finish-order-button";
import CartSteper from "../components/cart-steper";

interface ConfirmationPageProps {
  searchParams: Promise<{
    variantId?: string;
    quantity?: string;
    addressId?: string;
  }>;
}

const ConfirmationPage = async ({ searchParams }: ConfirmationPageProps) => {
  const { variantId, quantity, addressId } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    redirect("/");
  }

  let products = [];
  let totalInCents = 0;
  let shippingAddress = null;

  if (variantId && quantity && addressId) {
    const variant = await db.query.productVariantTable.findFirst({
      where: eq(productVariantTable.id, variantId),
      with: { product: true },
    });

    const address = await db.query.shippingAddressTable.findFirst({
      where: eq(shippingAddressTable.id, addressId),
    });

    if (!variant || !address) {
      redirect("/");
    }

    products = [
      {
        id: variant.id,
        name: variant.product.name,
        variantName: variant.name,
        quantity: Number(quantity),
        priceInCents: variant.priceInCents,
        imageUrl: variant.imageUrl,
      },
    ];
    totalInCents = variant.priceInCents * Number(quantity);
    shippingAddress = address;
  } else {
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.user.id),
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

    if (!cart || cart?.items.length === 0 || !cart.shippingAddress) {
      redirect("/cart/identification");
    }

    products = cart.items.map((item) => ({
      id: item.productVariant.id,
      name: item.productVariant.product.name,
      variantName: item.productVariant.name,
      quantity: item.quantity,
      priceInCents: item.productVariant.priceInCents,
      imageUrl: item.productVariant.imageUrl,
    }));
    totalInCents = cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    );
    shippingAddress = cart.shippingAddress;
  }

  return (
    // 1. O contêiner pai garante 100% da altura da tela
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* 2. O main empurra o Footer para baixo e tem o espaçamento padrão */}
      <main className="flex-1 pt-6 pb-12">
        {/* 3. A NOSSA CAIXA MÁGICA: Centraliza, limita a largura e aplica o padding */}
        <div className="mx-auto w-full max-w-7xl space-y-6 px-5 md:px-10">
          <CartSteper />

          {/* Container flex para organizar os blocos e manter tudo alinhado */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Identificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Card>
                  {/* Adicionado um pt-6 para compensar a ausência do CardHeader neste card interno */}
                  <CardContent className="pt-6">
                    <p className="text-sm">{formatAddress(shippingAddress)}</p>
                  </CardContent>
                </Card>
                <FinishOrderButton
                  variantId={variantId}
                  quantity={quantity ? Number(quantity) : undefined}
                  addressId={addressId}
                />
              </CardContent>
            </Card>

            <CartSummary
              subtotalInCents={totalInCents}
              totalInCents={totalInCents}
              products={products}
            />
          </div>
        </div>
      </main>

      {/* 4. O Footer fica fora do main, solto na base do "flex-col" principal */}
      <Footer />
    </div>
  );
};

export default ConfirmationPage;
