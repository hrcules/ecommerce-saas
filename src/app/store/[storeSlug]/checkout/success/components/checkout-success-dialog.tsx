"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const CheckoutSuccessDialog = () => {
  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-[90%] rounded-[24px] p-6 text-center md:max-w-[500px] md:rounded-[32px] md:p-10">
        <Image
          src="/illustration.svg"
          alt="Success"
          width={300}
          height={300}
          className="mx-auto h-auto w-[200px] md:w-[260px]"
          priority
        />

        <DialogTitle className="mt-4 text-2xl font-bold md:mt-6 md:text-3xl">
          Pedido efetuado!
        </DialogTitle>

        <DialogDescription className="text-muted-foreground font-medium md:mx-auto md:max-w-[90%] md:text-base">
          Seu pedido foi realizado com sucesso. Você receberá um e-mail de
          confirmação em breve. Você pode acompanhar o status na seção de “Meus
          Pedidos”.
        </DialogDescription>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center sm:gap-4 md:mt-8">
          <Button
            className="w-full rounded-full px-6 sm:w-auto"
            size="lg"
            asChild
          >
            <Link href="/orders">Ver meus pedidos</Link>
          </Button>
          <Button
            className="w-full rounded-full px-6 sm:w-auto"
            variant="outline"
            size="lg"
            asChild
          >
            <Link href="/">Voltar para a loja</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSuccessDialog;
