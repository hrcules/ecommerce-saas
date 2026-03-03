import { z } from "zod";

export const createDirectOrderSchema = z.object({
  variantId: z.string(),
  quantity: z.number().int().positive(),
  addressId: z.string(),
});

export type CreateDirectOrderParams = z.infer<typeof createDirectOrderSchema>;
