import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
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
    <div>
      <Header />
      <div className="space-y-4 px-5">
        <CartSteper />

        <Card>
          <CardHeader>
            <CardTitle>Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardContent>
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
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;
