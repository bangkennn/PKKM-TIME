import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { resetUserPasswordSchema } from "@/schemas/user.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  name: string;
}

export async function handleResetPassword(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = resetUserPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi kata sandi gagal",
        },
        { status: 400 }
      );
    }

    const { newPassword } = validation.data;

    // Cek keberadaan akun
    const [existing] = await pool.execute<UserRow[]>(
      "SELECT id, username, name FROM users WHERE id = ? LIMIT 1",
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Pengguna tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const user = existing[0];

    // Hash kata sandi baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.execute<ResultSetHeader>(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashedPassword, id]
    );

    return NextResponse.json({
      success: true,
      message: `Kata sandi untuk akun '${user.name}' (${user.username}) berhasil diatur ulang.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal mengatur ulang kata sandi: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleResetPassword(request, context);
}

