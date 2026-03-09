"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { createDirectOrder } from "@/actions/create-direct-order";
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
  const finishOrderMutation = useFinishOrder();

  const createDirectOrderMutation = useMutation({
    mutationFn: () =>
      createDirectOrder({
        variantId: variantId!,
        quantity: quantity!,
        addressId: addressId!,
      }),
  });

  const isPending =
    finishOrderMutation.isPending || createDirectOrderMutation.isPending;

  const handleFinishOrder = async () => {
    let orderId: string;

    if (variantId && quantity && addressId) {
      const result = await createDirectOrderMutation.mutateAsync();
      orderId = result.orderId;
    } else {
      const result = await finishOrderMutation.mutateAsync();
      orderId = result.orderId;
    }

    const response = await createCheckoutSession({
      orderId,
    });

    if (response?.checkoutUrl) {
      window.location.href = response.checkoutUrl;
    } else {
      console.error("Erro: O Stripe não retornou a URL de checkout.");
      alert("Ocorreu um erro ao gerar o pagamento. Tente novamente.");
    }
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
