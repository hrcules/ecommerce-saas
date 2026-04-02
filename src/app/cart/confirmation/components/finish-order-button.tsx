"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
// NOVO: Importando o toast da Sonner (ou a biblioteca que você estiver usando)
import { toast } from "sonner";

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
  // NOVO: Estado para segurar o loading enquanto o Stripe pensa
  const [isRedirecting, setIsRedirecting] = useState(false);

  const createDirectOrderMutation = useMutation({
    mutationFn: () =>
      createDirectOrder({
        variantId: variantId!,
        quantity: quantity!,
        addressId: addressId!,
      }),
  });

  // NOVO: O botão fica bloqueado durante as mutations E durante o redirecionamento
  const isPending =
    finishOrderMutation.isPending ||
    createDirectOrderMutation.isPending ||
    isRedirecting;

  const handleFinishOrder = async () => {
    try {
      setIsRedirecting(true);
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
        throw new Error("O Stripe não retornou a URL de checkout.");
      }
    } catch (error) {
      console.error("Erro no checkout:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocorreu um erro ao gerar o pagamento. Tente novamente.");
      }
    } finally {
      setIsRedirecting(false);
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
