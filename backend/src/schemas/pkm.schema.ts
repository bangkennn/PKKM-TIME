import { z } from "zod";

export const pkmTeamMemberSchema = z.object({
  name: z.string().trim().min(1, "Nama dosen pelaksana wajib diisi"),
  role: z.string().trim().min(1, "Peran wajib dipilih"),
});

export const createPkmProposalSchema = z.object({
  title: z
    .string({
      error: "Judul kegiatan pengabdian wajib diisi",
    })
    .trim()
    .min(5, "Judul kegiatan minimal 5 karakter")
    .max(255, "Judul kegiatan maksimal 255 karakter"),
  scheme: z
    .string({
      error: "Skema PKM wajib dipilih",
    })
    .trim()
    .min(2, "Skema PKM minimal 2 karakter"),
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
  pkmTopic: z.string().trim().optional(),
  budget: z.coerce
    .number({
      error: "Anggaran biaya wajib berupa angka",
    })
    .min(0, "Anggaran tidak boleh negatif"),
  teamMembers: z.array(pkmTeamMemberSchema).optional(),
  luaranJenis: z.string().trim().optional().or(z.literal("")),
  targetLuaranNama: z.string().trim().optional().or(z.literal("")),
  targetLuaranKeterangan: z.string().trim().optional().or(z.literal("")),
  abstract: z.string().trim().optional().or(z.literal("")),
  fileName: z.string().trim().optional().or(z.literal("")),
  fileCustomName: z.string().trim().optional().or(z.literal("")),
  authorName: z.string().trim().optional(),
  userId: z.string().trim().optional(),
});

export type CreatePkmProposalInput = z.infer<typeof createPkmProposalSchema>;

export const updatePkmProposalSchema = createPkmProposalSchema;
export type UpdatePkmProposalInput = z.infer<typeof updatePkmProposalSchema>;

export const submitPkmProgressReportSchema = z.object({
  fileKemajuan: z
    .string({
      error: "Berkas laporan kemajuan PKM wajib diunggah",
    })
    .trim()
    .min(1, "Berkas laporan kemajuan wajib dipilih"),
  luaranJenis: z
    .string({
      error: "Jenis luaran PKM wajib diisi",
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
export type SubmitPkmProgressReportInput = z.infer<typeof submitPkmProgressReportSchema>;

export const submitPkmFinalReportSchema = z.object({
  fileAkhir: z
    .string({
      error: "Berkas laporan akhir PKM wajib diunggah",
    })
    .trim()
    .min(1, "Berkas laporan akhir wajib dipilih"),
  luaranAkhirJenis: z
    .string({
      error: "Jenis luaran final PKM wajib diisi",
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
export type SubmitPkmFinalReportInput = z.infer<typeof submitPkmFinalReportSchema>;

