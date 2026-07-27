"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";

import { createStore } from "@/actions/super-admin";
import {
  createStoreSchema,
  type CreateStoreInput,
} from "@/actions/super-admin/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch"; // ✅ NOVO COMPONENTE

export function CreateStoreModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateStoreInput>({
    resolver: zodResolver(createStoreSchema),
    defaultValues: {
      name: "",
      slug: "",
      ownerEmail: "",
      enableOnlinePayments: true,
    },
  });

  const onSubmit = (data: CreateStoreInput) => {
    startTransition(async () => {
      try {
        await createStore(data);
        toast.success("Loja criada com sucesso!");
        setOpen(false);
        form.reset();
      } catch {
        toast.error("Erro ao criar loja.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shrink-0">
          <PlusCircle className="mr-2 h-5 w-5" /> Nova Loja
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Nova Loja</DialogTitle>
          <DialogDescription>
            Introduza os dados para gerar uma nova vitrine no SaaS.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Bewear Fashion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Loja (Slug)</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: bewear-fashion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail do Lojista</FormLabel>
                  <FormControl>
                    <Input placeholder="lojista@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ NOVA CHAVE (SWITCH) DE MODO DE PAGAMENTO */}
            <FormField
              control={form.control}
              name="enableOnlinePayments"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Pagamento Online</FormLabel>
                    <FormDescription>
                      Desative para usar a loja apenas como Catálogo.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Vitrine
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
