"use client";

import { useState, useTransition } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProductAction } from "@/actions/create-product";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // O "file" bruto para enviarmos no FormData
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  // Intercepta o envio do formulário
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Coleta os dados dos inputs do formulário
    const formData = new FormData(e.currentTarget);

    // Adiciona o arquivo manualmente no pacote
    if (selectedFile) {
      formData.set("image", selectedFile);
    }

    startTransition(async () => {
      try {
        await createProductAction(formData);
        // Deu certo! Redireciona de volta para a lista
        router.push("/admin/products");
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
        alert("Ocorreu um erro ao salvar o produto.");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 md:grid-cols-3"
    >
      <div className="space-y-6 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ex: Camiseta Oversized Preta"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descreva os detalhes, tecido, caimento..."
                className="min-h-[120px]"
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço Base (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="99.90"
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  name="categoryId"
                  className="border-input bg-background ring-offset-background flex h-10 w-full rounded-md border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  defaultValue=""
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
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mídia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Imagem Principal</Label>

              <div className="border-muted-foreground/25 hover:bg-muted/50 relative mt-2 flex justify-center rounded-lg border border-dashed px-6 py-10 transition-colors">
                {imagePreview ? (
                  <div className="relative aspect-square w-full">
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
                      onClick={removeImage}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadCloud className="text-muted-foreground mx-auto h-12 w-12" />
                    <div className="text-muted-foreground mt-4 flex justify-center text-sm leading-6">
                      <label
                        htmlFor="file-upload"
                        className="text-primary relative cursor-pointer rounded-md font-semibold hover:underline"
                      >
                        <span>Faça upload da foto</span>
                        <input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* O botão fica desabilitado e girando enquanto faz o upload pro R2 e salva no banco */}
        <Button className="w-full" size="lg" type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando e subindo imagem...
            </>
          ) : (
            "Salvar Produto"
          )}
        </Button>
      </div>
    </form>
  );
}
