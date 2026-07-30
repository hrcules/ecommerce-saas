import { z } from "zod";

// Schema para Criar
export const createAnnouncementSchema = z.object({
  title: z
    .string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres." }),
  content: z
    .string()
    .min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres." }),

  // CORREÇÃO AQUI: Trocado required_error por message
  type: z
    .enum(["info", "update", "maintenance"], {
      message: "Selecione um tipo válido.",
    })
    .default("info"),
});

// Schema para Atualizar
export const updateAnnouncementSchema = createAnnouncementSchema.extend({
  id: z.string().uuid({ message: "ID do aviso inválido." }),
  isActive: z.boolean().default(true),
});

// Schema para Deletar
export const deleteAnnouncementSchema = z.object({
  id: z.string().uuid({ message: "ID do aviso inválido." }),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
