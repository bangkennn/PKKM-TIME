import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().trim().min(1, "Nama dosen wajib diisi"),
  role: z.string().trim().min(1, "Peran dosen wajib dipilih"),
});

export const createResearchProposalSchema = z.object({
  title: z
    .string({
      error: "Judul penelitian wajib diisi",
    })
    .trim()
    .min(5, "Judul penelitian minimal 5 karakter")
    .max(255, "Judul penelitian maksimal 255 karakter"),
  scheme: z
    .string({
      error: "Skema penelitian wajib dipilih",
    })
    .trim()
    .min(2, "Skema penelitian minimal 2 karakter"),
  academicYear: z
    .string({
      error: "Tahun akademik wajib diisi",
    })
    .trim()
    .min(4, "Tahun akademik tidak valid"),
  proposalYear: z.coerce
    .number()
    .int()
    .min(2000, "Tahun usulan tidak valid")
    .max(2100, "Tahun usulan tidak valid")
    .optional(),
  durationMonths: z.coerce
    .number()
    .int()
    .min(1, "Lama kegiatan minimal 1 bulan")
    .max(60, "Lama kegiatan maksimal 60 bulan")
    .default(6)
    .optional(),
  researchTopic: z.string().trim().optional(),
  budget: z.coerce
    .number({
      error: "Anggaran biaya wajib berupa angka",
    })
    .min(0, "Anggaran tidak boleh negatif"),
  teamMembers: z.array(teamMemberSchema).optional(),
  luaranJenis: z.string().trim().optional().or(z.literal("")),
  targetLuaranNama: z.string().trim().optional().or(z.literal("")),
  targetLuaranKeterangan: z.string().trim().optional().or(z.literal("")),
  abstract: z.string().trim().optional().or(z.literal("")),
  fileName: z.string().trim().optional().or(z.literal("")),
  fileCustomName: z.string().trim().optional().or(z.literal("")),
  authorName: z.string().trim().optional(),
  userId: z.string().trim().optional(),
});

export type CreateResearchProposalInput = z.infer<typeof createResearchProposalSchema>;

export const updateResearchProposalSchema = createResearchProposalSchema;
export type UpdateResearchProposalInput = z.infer<typeof updateResearchProposalSchema>;

export const submitProgressReportSchema = z.object({
  fileKemajuan: z
    .string({
      error: "Berkas laporan kemajuan wajib diunggah",
    })
    .trim()
    .min(1, "Berkas laporan kemajuan wajib dipilih"),
  luaranJenis: z
    .string({
      error: "Jenis luaran wajib diisi",
    })
    .trim()
    .min(2, "Jenis luaran minimal 2 karakter"),
  luaranTarget: z
    .string({
      error: "Target capaian luaran wajib diisi",
    })
    .trim()
    .min(2, "Target capaian luaran minimal 2 karakter"),
  luaranKeterangan: z.string().trim().optional().or(z.literal("")),
});
export type SubmitProgressReportInput = z.infer<typeof submitProgressReportSchema>;

export const submitFinalReportSchema = z.object({
  fileAkhir: z
    .string({
      error: "Berkas laporan akhir wajib diunggah",
    })
    .trim()
    .min(1, "Berkas laporan akhir wajib dipilih"),
  luaranAkhirJenis: z
    .string({
      error: "Jenis luaran final wajib diisi",
    })
    .trim()
    .min(2, "Jenis luaran final minimal 2 karakter"),
  luaranAkhirRealisasi: z
    .string({
      error: "Status realisasi luaran wajib diisi",
    })
    .trim()
    .min(2, "Status realisasi luaran minimal 2 karakter"),
  luaranAkhirLink: z.string().trim().optional().or(z.literal("")),
  luaranAkhirKeterangan: z.string().trim().optional().or(z.literal("")),
});
export type SubmitFinalReportInput = z.infer<typeof submitFinalReportSchema>;

