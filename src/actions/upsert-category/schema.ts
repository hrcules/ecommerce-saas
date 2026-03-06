import { z } from "zod";

export const upsertCategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "O nome é obrigatório"),
  slug: z.string().min(1, "O slug é obrigatório"),
});

export type UpsertCategorySchema = z.infer<typeof upsertCategorySchema>;
