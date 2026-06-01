"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { checkPixStatusAction } from "@/actions/check-pix-status";

interface PixStatusCheckerProps {
  orderId: string;
  storeSlug: string;
}

export function PixStatusChecker({
  orderId,
  storeSlug,
}: PixStatusCheckerProps) {
  const router = useRouter();

  useEffect(() => {
    // Cria o loop que roda a cada 5 segundos
    const interval = setInterval(async () => {
      const status = await checkPixStatusAction(orderId);

      if (status === "approved") {
        clearInterval(interval); // Para o loop
        toast.success("Pagamento confirmado!");

        // Redireciona o usuário para a página de sucesso/resumo
        router.push(`/checkout/success?orderId=${orderId}`);
      }
    }, 5000);

    // Limpa o loop se o usuário sair da página
    return () => clearInterval(interval);
  }, [orderId, storeSlug, router]);

  return null; // Este componente não tem visual, ele apenas trabalha nos bastidores!
}
