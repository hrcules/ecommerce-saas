"use client";

import { useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2 } from "lucide-react";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { createDirectOrder } from "@/actions/create-direct-order"; // <-- Precisaremos criar essa action no próximo passo
import { Button } from "@/components/ui/button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";

interface FinishOrderButtonProps {
  variantId?: string;
  quantity?: number;
  addressId?: string;
}

const FinishOrderButton = ({
  variantId,
  quantity,
  addressId,
}: FinishOrderButtonProps) => {
  // Mutation 1: Fluxo padrão do Carrinho
  const finishOrderMutation = useFinishOrder();

  // Mutation 2: Fluxo novo de Compra Direta
  const createDirectOrderMutation = useMutation({
    mutationFn: () =>
      createDirectOrder({
        variantId: variantId!,
        quantity: quantity!,
        addressId: addressId!,
      }),
  });

  // O botão ficará em estado de loading se qualquer uma das duas mutations estiver rodando
  const isPending =
    finishOrderMutation.isPending || createDirectOrderMutation.isPending;

  const handleFinishOrder = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key is not set");
    }

    let orderId: string;

    // A MÁGICA ACONTECE AQUI: Bifurcação de Fluxos
    if (variantId && quantity && addressId) {
      // Fluxo: Comprar Agora (Ignora o carrinho)
      const result = await createDirectOrderMutation.mutateAsync();
      orderId = result.orderId;
    } else {
      // Fluxo: Carrinho Padrão
      const result = await finishOrderMutation.mutateAsync();
      orderId = result.orderId;
    }

    // A partir daqui, o código é agnóstico. Ele só pega o orderId gerado e manda pro Stripe
    const checkoutSession = await createCheckoutSession({
      orderId,
    });

    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );

    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }

    await stripe.redirectToCheckout({
      sessionId: checkoutSession.id,
    });
  };

  return (
    <Button
      className="w-full rounded-full"
      size="lg"
      onClick={handleFinishOrder}
      disabled={isPending}
    >
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Finalizar compra
    </Button>
  );
};

export default FinishOrderButton;
