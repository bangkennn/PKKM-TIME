import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string({
      error: "NIDN atau Nama Pengguna wajib diisi",
    })
    .trim()
    .min(1, "NIDN atau Nama Pengguna tidak boleh kosong"),
  password: z
    .string({
      error: "Kata sandi wajib diisi",
    })
    .min(1, "Kata sandi tidak boleh kosong"),
});

export type LoginInput = z.infer<typeof loginSchema>;

