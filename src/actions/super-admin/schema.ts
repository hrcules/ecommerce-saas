import { z } from "zod";

export const createStoreSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  slug: z
    .string()
    .min(3, "O slug deve ter pelo menos 3 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "O slug deve conter apenas letras minúsculas, números e hífens",
    ),
  ownerEmail: z.string().email("Introduza um e-mail válido"),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
