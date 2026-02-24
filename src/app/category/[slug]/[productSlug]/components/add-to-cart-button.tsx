"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, LogIn } from "lucide-react";

import { addProductToCart } from "@/actions/add-cart-product";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
}: AddToCartButtonProps) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const handleAddToCart = () => {
    if (!session?.user) {
      setIsAuthModalOpen(true);
      return;
    }

    mutate();
  };

  return (
    <>
      <Button
        className="rounded-full"
        size="lg"
        variant="outline"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending && <Loader2 className="animate-spin" />}
        Adicionar à sacola
      </Button>

      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="gap-6 rounded-3xl px-8 sm:max-w-md">
          <DialogHeader className="gap-6">
            <DialogTitle className="text-2xl">Criar uma conta</DialogTitle>
            <DialogDescription className="text-sm font-medium">
              Conecte-se à BEWEAR e aproveite uma experiência feita pra quem se
              veste com personalidade.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button asChild className="h-12 w-full rounded-full">
              <Link href="/authentication">
                <LogIn className="mr-2 h-4 w-4" />
                Fazer login ou cadastrar
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="h-12 w-full cursor-pointer rounded-full px-8"
              onClick={() => setIsAuthModalOpen(false)}
            >
              Continuar navegando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddToCartButton;
