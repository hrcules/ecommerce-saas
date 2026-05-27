import { z } from "zod";

export const createPixPaymentSchema = z.object({
  orderId: z.string().min(1, "O ID do pedido é obrigatório"),
});

export type CreatePixPaymentSchema = z.infer<typeof createPixPaymentSchema>;
