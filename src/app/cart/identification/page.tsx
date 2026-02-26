import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import Header from "@/components/common/header";
import { db } from "@/db";
import { productVariantTable, shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import CartSummary from "../components/cart-summary";
import Addresses from "./components/addresses";
import CartSteper from "../components/cart-steper";

interface IdentificationPageProps {
  searchParams: Promise<{
    variantId?: string;
    quantity?: string;
  }>;
}

const IdentificationPage = async ({
  searchParams,
}: IdentificationPageProps) => {
  const { variantId, quantity } = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) {
    redirect("/");
  }

  const shippingAddresses = await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, session.user.id),
  });

  let products = [];
  let totalInCents = 0;
  let defaultAddressId = null;

  if (variantId && quantity) {
    const variant = await db.query.productVariantTable.findFirst({
      where: eq(productVariantTable.id, variantId),
      with: { product: true },
    });

    if (!variant) {
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

    if (!cart || cart?.items.length === 0) {
      redirect("/");
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
    defaultAddressId = cart.shippingAddress?.id || null;
  }
  return (
    <div>
      <Header />
      <div className="space-y-4 px-5">
        <CartSteper />

        <Addresses
          shippingAddresses={shippingAddresses}
          defaultShippingAddressId={cart.shippingAddress?.id || null}
        />
        <CartSummary
          subtotalInCents={totalInCents}
          totalInCents={totalInCents}
          products={products}
        />
      </div>
    </div>
  );
};

export default IdentificationPage;
