import { z } from "zod";

export const createTemplateSchema = z.object({
  title: z
    .string({ error: "Judul template wajib diisi" })
    .trim()
    .min(3, "Judul template minimal 3 karakter")
    .max(255, "Judul template maksimal 255 karakter"),
  category: z.enum(["proposal", "laporan"] as const, {
    error: "Kategori berkas wajib dipilih (proposal atau laporan)",
  }),
  description: z.string().optional().nullable(),
  filename: z
    .string({ error: "Nama berkas wajib diisi" })
    .trim()
    .min(5, "Nama berkas tidak valid")
    .refine(
      (val) => val.toLowerCase().endsWith(".docx"),
      "Berkas harus berekstensi Microsoft Word (.docx)"
    ),
  file_size: z.string().optional().default("0 KB"),
  file_data: z.string().optional().nullable(),
  version: z.string().optional().default("v2026.1"),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
