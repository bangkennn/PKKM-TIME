import { z } from "zod";

export const createPPKMEntrySchema = z.object({
  title: z.string().min(3, "Judul kegiatan minimal 3 karakter"),
  category: z.string().min(2, "Kategori kegiatan wajib diisi"),
  durationMinutes: z.number().int().positive("Durasi kegiatan harus berupa angka positif dalam menit"),
  description: z.string().optional(),
  studentId: z.string().optional(),
  date: z.string().optional().default(() => new Date().toISOString()),
});

export const updatePPKMEntrySchema = createPPKMEntrySchema.partial();

export const queryParamSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  category: z.string().optional(),
  search: z.string().optional(),
});

export type CreatePPKMEntryInput = z.infer<typeof createPPKMEntrySchema>;
export type UpdatePPKMEntryInput = z.infer<typeof updatePPKMEntrySchema>;
export type QueryParams = z.infer<typeof queryParamSchema>;

