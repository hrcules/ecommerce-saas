"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, UploadCloud, X } from "lucide-react";
import Image from "next/image";

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
import { updateVariantAction } from "@/actions/update-variant";
import { ColorCombobox } from "@/components/ui/color-combobox";

interface EditVariantDialogProps {
  productId: string;
  existingColors: string[];
  variant: {
    id: string;
    color: string;
    size: string;
    priceInCents: number;
    stock: number;
    imageUrl: string;
  };
}

export function EditVariantDialog({
  productId,
  existingColors,
  variant,
}: EditVariantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(
    variant.imageUrl,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);
    formData.set("variantId", variant.id);
    if (selectedFile) formData.set("image", selectedFile);

    startTransition(async () => {
      try {
        await updateVariantAction(formData);
        setIsOpen(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao atualizar a variação.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] md:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Variação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço Específico (R$)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                defaultValue={(variant.priceInCents / 100).toFixed(2)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Quantidade em Estoque</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                defaultValue={variant.stock}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor</Label>
              <ColorCombobox
                existingColors={existingColors}
                defaultValue={variant.color}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho</Label>
              <Input
                id="size"
                name="size"
                defaultValue={variant.size}
                required
                disabled={isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem da Variação (Opcional)</Label>
            <div className="relative mt-2 flex justify-center rounded-lg border border-dashed px-6 py-6">
              {imagePreview ? (
                <div className="relative h-32 w-32">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="rounded-md object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setImagePreview(null);
                      setSelectedFile(null);
                    }}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="text-muted-foreground mx-auto h-8 w-8" />
                  <label
                    htmlFor={`edit-image-${variant.id}`}
                    className="text-primary mt-2 block cursor-pointer text-sm font-semibold hover:underline"
                  >
                    Escolher Nova Foto
                    <input
                      id={`edit-image-${variant.id}`}
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isPending}
                    />
                  </label>
                </div>
              )}
            </div>
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
