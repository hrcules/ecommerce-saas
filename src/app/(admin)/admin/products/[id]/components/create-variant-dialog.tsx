"use client";

import { useState, useTransition, useEffect } from "react";
import { Loader2, Plus, UploadCloud, X, Copy } from "lucide-react";
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
import { createVariantAction } from "@/actions/create-variant";
import { ColorCombobox } from "@/components/ui/color-combobox";

// ✅ 1. Definimos o tipo dos dados que podem ser herdados
export interface VariantInitialData {
  priceInCents: number;
  stock: number;
  color: string;
  imageUrl: string;
}

interface CreateVariantDialogProps {
  productId: string;
  existingColors: string[];
  // ✅ 2. Adicionamos a propriedade opcional para herdar dados
  initialData?: VariantInitialData;
  // ✅ 3. Opcional: Se for um botão de duplicar, podemos mudar o texto/ícone
  isDuplicateMode?: boolean;
}

export function CreateVariantDialog({
  productId,
  existingColors,
  initialData,
  isDuplicateMode = false,
}: CreateVariantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ✅ 4. Efeito para preencher a imagem antiga quando o modal abre no modo "Duplicar"
  useEffect(() => {
    if (isOpen && initialData?.imageUrl) {
      setImagePreview(initialData.imageUrl);
      setSelectedFile(null); // Zera o arquivo porque vamos usar a URL
    } else if (!isOpen) {
      // Limpa os estados quando fecha
      setImagePreview(null);
      setSelectedFile(null);
    }
  }, [isOpen, initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // ✅ 5. Validação Flexível: Precisa ter um arquivo NOVO ou uma URL HERDADA
    if (!selectedFile && !initialData?.imageUrl) {
      alert("Por favor, selecione uma imagem para esta variação.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("productId", productId);

    // ✅ 6. A lógica de envio da imagem:
    if (selectedFile) {
      // Se ele escolheu uma foto nova, envia o arquivo (como antes)
      formData.set("image", selectedFile);
    } else if (initialData?.imageUrl) {
      // Se ele NÃO escolheu foto nova, mas tem foto antiga, manda a URL escondida!
      // IMPORTANTE: Seu backend precisará ler essa string agora!
      formData.set("previousImageUrl", initialData.imageUrl);

      // Enviamos um Blob vazio no campo "image" só para o FormData não quebrar caso o backend exija o campo
      formData.set("image", new Blob([], { type: "application/octet-stream" }));
    }

    startTransition(async () => {
      try {
        await createVariantAction(formData);
        setIsOpen(false);
      } catch (error) {
        console.error(error);
        alert("Erro ao criar a variação.");
      }
    });
  };

  // ✅ 7. Função auxiliar para formatar centavos herdados para o input (Ex: 8990 -> "89.90")
  const formatPriceForInput = (cents?: number) => {
    if (!cents) return "";
    return (cents / 100).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isDuplicateMode ? (
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-primary h-8 w-8"
          >
            <Copy className="h-4 w-4" /> {/* Ícone menor para usar na tabela */}
          </Button>
        ) : (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Variação
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px] md:min-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isDuplicateMode ? "Duplicar Variação" : "Nova Variação de Produto"}
          </DialogTitle>
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
                required
                disabled={isPending}
                // ✅ 8. Herda o preço
                defaultValue={formatPriceForInput(initialData?.priceInCents)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Quantidade em Estoque</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                required
                disabled={isPending}
                // ✅ 9. Herda o estoque (ou zero)
                defaultValue={initialData?.stock ?? "0"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color">Cor (Ex: Verde, Bege)</Label>
              {/* ✅ Se a ColorCombobox suportar defaultValue, passe o initialData?.color para ela.
                  Se não suportar, ela pode precisar de um ajuste interno para herdar. */}
              <ColorCombobox
                existingColors={existingColors}
                disabled={isPending}
                // Exemplo: value={initialData?.color} (Depende de como você montou esse componente)
              />
              {/* Hack rápido para garantir que a cor vá pro FormData se o Combobox for complexo */}
              <input
                type="hidden"
                name="color"
                value={initialData?.color || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Tamanho (Ex: P, M, 42)</Label>
              <Input
                id="size"
                name="size"
                required
                disabled={isPending}
                // ⚠️ Deixamos o tamanho VAZIO de propósito para forçar ele a digitar um novo!
                defaultValue=""
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imagem da Variação</Label>
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
                      // Se tinha foto herdada, ela é removida visualmente
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
                    htmlFor="variant-image"
                    className="text-primary mt-2 block cursor-pointer text-sm font-semibold hover:underline"
                  >
                    Escolher Foto
                    <input
                      id="variant-image"
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
              {isDuplicateMode ? "Salvar Cópia" : "Salvar Variação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
