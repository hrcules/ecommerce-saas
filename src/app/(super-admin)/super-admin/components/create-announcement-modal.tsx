"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner"; // Ajuste se usar outro toast
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createAnnouncement } from "@/actions/announcement"; // Nossa action feita anteriormente!

export function CreateAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setIsPending(true);

    // Pegando os dados do form de modo simples (ou poderia usar react-hook-form)
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      type: formData.get("type") as "info" | "update" | "maintenance",
    };

    const result = await createAnnouncement(data);

    if (!result.success) {
      toast.error(result.error);
      setIsPending(false);
      return;
    }

    toast.success("Aviso publicado com sucesso!");
    setIsOpen(false);
    setIsPending(false);
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Aviso
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Aviso Global</DialogTitle>
          <DialogDescription>
            Este aviso será exibido no painel de todos os seus lojistas
            imediatamente após salvo.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              name="title"
              required
              placeholder="Ex: Nova atualização V2.0"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <select
              name="type"
              className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
            >
              <option value="info">Informação</option>
              <option value="update">Atualização (Novidade)</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Conteúdo do Aviso</label>
            <Textarea
              name="content"
              required
              placeholder="Escreva os detalhes..."
              rows={4}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Publicando..." : "Publicar Aviso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
