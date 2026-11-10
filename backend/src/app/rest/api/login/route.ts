import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { loginSchema } from "@/schemas/auth.schema";
import { signToken, UserGroup } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  password: string;
  name: string;
  groups: UserGroup;
  email: string | null;
}

/**
 * Helper untuk menentukan URL redirect berdasarkan groups
 */
export function getRedirectUrlByGroup(groups: UserGroup): string {
  switch (groups) {
    case "dosen":
      return "/dosen/dashboard";
    case "lpmi":
      return "/lpmi/dashboard";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/dosen/dashboard";
  }
}

/**
 * Handler bersama untuk proses login autentikasi JWT
 */
export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Cari user di database MySQL
    const [rows] = await pool.execute<UserRow[]>(
      "SELECT id, username, password, name, groups, email FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    const user = rows[0];

    // Jika pengguna tidak ditemukan
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Kredensial tidak valid. Silakan periksa kembali NIDN/Nama Pengguna dan Kata Sandi Anda.",
        },
        { status: 401 }
      );
    }

    // Verifikasi kata sandi dengan hash bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Kredensial tidak valid. Silakan periksa kembali NIDN/Nama Pengguna dan Kata Sandi Anda.",
        },
        { status: 401 }
      );
    }

    // Terbitkan JWT Token yang menyematkan groups
    const token = signToken({
      id: user.id,
      username: user.username,
      name: user.name,
      groups: user.groups,
      email: user.email,
    });

    const redirectUrl = getRedirectUrlByGroup(user.groups);

    return NextResponse.json(
      {
        success: true,
        message: "Login berhasil. Selamat datang di Portal SiPANDU!",
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          groups: user.groups,
          email: user.email,
        },
        redirectUrl,
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
  return handleLogin(request);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

