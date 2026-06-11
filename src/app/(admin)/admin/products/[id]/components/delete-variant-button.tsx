"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVariantAction } from "@/actions/delete-variant";
import { toast } from "sonner";

interface DeleteVariantButtonProps {
  variantId: string;
  productId: string;
}

export function DeleteVariantButton({
  variantId,
  productId,
}: DeleteVariantButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (
      confirm(
        "Tem certeza que deseja excluir esta variação? Essa ação não pode ser desfeita.",
      )
    ) {
      startTransition(async () => {
        try {
          const result = await deleteVariantAction({ variantId, productId });

          if (result?.error) {
            toast.error(result.error);
            return;
          }

          if (result?.success) {
            toast.success("Variação excluída com sucesso!");
          }
        } catch {
          toast.error("Erro inesperado ao tentar excluir a variação.");
        }
      });
    }
  };
  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
