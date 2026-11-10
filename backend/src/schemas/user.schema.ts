import { z } from "zod";

export const userRoleEnum = z.enum(["dosen", "lpmi", "admin"], {
  error: "Peran grup harus salah satu dari: dosen, lpmi, admin",
});

export const createUserSchema = z.object({
  name: z
    .string({
      error: "Nama lengkap wajib diisi",
    })
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  username: z
    .string({
      error: "Username / NIDN wajib diisi",
    })
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username hanya boleh memuat huruf, angka, titik, dash (-), atau garis bawah (_)"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  groups: userRoleEnum,
  password: z
    .string({
      error: "Kata sandi awal wajib diisi",
    })
    .min(6, "Kata sandi awal minimal 6 karakter"),
});

export const updateUserSchema = z.object({
  name: z
    .string({
      error: "Nama lengkap wajib diisi",
    })
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid")
    .optional()
    .or(z.literal(""))
    .nullable(),
  groups: userRoleEnum,
});

export const resetUserPasswordSchema = z.object({
  newPassword: z
    .string({
      error: "Kata sandi baru wajib diisi",
    })
    .min(6, "Kata sandi baru minimal 6 karakter"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;

