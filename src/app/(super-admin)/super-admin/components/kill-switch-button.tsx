"use client";

import { useTransition } from "react";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { toggleStoreStatus } from "@/actions/super-admin";
import { Button } from "@/components/ui/button";

interface KillSwitchButtonProps {
  storeId: string;
  isActive: boolean;
  storeName: string;
}

export function KillSwitchButton({
  storeId,
  isActive,
  storeName,
}: KillSwitchButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    if (
      isActive &&
      !confirm(
        `Tem certeza que deseja DESLIGAR a loja "${storeName}"? Os clientes não poderão mais acessá-la.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await toggleStoreStatus(storeId, isActive);
        if (isActive) {
          toast.error(`A loja ${storeName} foi desativada.`);
        } else {
          toast.success(`A loja ${storeName} foi reativada!`);
        }
      } catch {
        toast.error("Erro ao alterar o status da loja.");
      }
    });
  };

  return (
    <Button
      variant={isActive ? "destructive" : "default"}
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className="w-32 cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isActive ? (
        <PowerOff className="mr-2 h-4 w-4" />
      ) : (
        <Power className="mr-2 h-4 w-4" />
      )}
      {isActive ? "Desligar" : "Ligar"}
    </Button>
  );
}
