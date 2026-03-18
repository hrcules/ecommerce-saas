"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  upsertCategorySchema,
  UpsertCategorySchema,
} from "@/actions/upsert-category/schema";
import { upsertCategory } from "@/actions/upsert-category";

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: { id: string; name: string; slug: string } | null;
}

export const CategoryDialog = ({
  isOpen,
  onOpenChange,
  category,
}: CategoryDialogProps) => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpsertCategorySchema>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: { name: "", slug: "" },
  });

  useEffect(() => {
    if (category) {
      form.reset({ id: category.id, name: category.name, slug: category.slug });
    } else {
      form.reset({ name: "", slug: "" });
    }
  }, [category, form]);

  const onSubmit = async (data: UpsertCategorySchema) => {
    setIsPending(true);
    try {
      await upsertCategory(data);
      toast.success(category ? "Categoria atualizada!" : "Categoria criada!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar categoria.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {category ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Camisetas" />
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
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: camisetas" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
