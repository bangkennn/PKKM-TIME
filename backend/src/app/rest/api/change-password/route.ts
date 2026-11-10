import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  password: string;
}

const changePasswordSchema = z.object({
  userId: z.string().optional(),
  currentPassword: z.string().min(1, "Kata sandi saat ini wajib diisi"),
  newPassword: z.string().min(6, "Kata sandi baru minimal 6 karakter"),
});

export async function handleChangePassword(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = changePasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi data gagal",
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;
    let targetUserId = validation.data.userId;

    // Coba ekstrak user ID dari JWT token Authorization Header jika tersedia
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded?.id) {
        targetUserId = decoded.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Sesi tidak valid atau ID pengguna tidak ditemukan. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    // Ambil data pengguna dari database MySQL
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT id, username, password FROM users WHERE id = ? LIMIT 1",
      [targetUserId]
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Pengguna tidak ditemukan dalam sistem.",
        },
        { status: 404 }
      );
    }

    // Verifikasi kata sandi saat ini dengan hash bcrypt di MySQL
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          error: "Kata sandi saat ini yang Anda masukkan salah. Silakan coba kembali.",
        },
        { status: 400 }
      );
    }

    // Pastikan kata sandi baru tidak sama persis dengan kata sandi lama
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
      return NextResponse.json(
        {
          success: false,
          error: "Kata sandi baru tidak boleh sama dengan kata sandi saat ini.",
        },
        { status: 400 }
      );
    }

    // Enkripsi kata sandi baru menggunakan bcrypt
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Perbarui kata sandi di tabel users
    await pool.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedNewPassword, targetUserId]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Kata sandi Anda berhasil diperbarui. Silakan gunakan kata sandi baru untuk login berikutnya.",
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan internal server";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return handleChangePassword(request);
}

export async function PUT(request: NextRequest) {
  return handleChangePassword(request);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

