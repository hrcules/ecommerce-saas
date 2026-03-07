"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProductDetailsAction } from "@/actions/update-product";

interface Category {
  id: string;
  name: string;
}

interface EditProductDialogProps {
  product: {
    id: string;
    name: string;
    description: string;
    categoryId: string;
  };
  categories: Category[];
}

export function EditProductDialog({
  product,
  categories,
}: EditProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // Injetamos o ID do produto de forma oculta para a action saber quem atualizar
    formData.append("productId", product.id);

    startTransition(async () => {
      try {
        await updateProductDetailsAction(formData);
        setIsOpen(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar o produto.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 w-full">
          Editar Detalhes
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product.name}
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product.categoryId}
              className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              required
              disabled={isPending}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product.description}
              className="min-h-[120px]"
              disabled={isPending}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
