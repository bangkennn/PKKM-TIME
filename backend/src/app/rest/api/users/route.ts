import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { createUserSchema } from "@/schemas/user.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface SafeUserRow extends RowDataPacket {
  id: string;
  username: string;
  name: string;
  groups: "dosen" | "lpmi" | "admin";
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface CountRow extends RowDataPacket {
  total: number;
  dosen_count: number;
  lpmi_count: number;
  admin_count: number;
}

export async function handleGetUsers(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const group = searchParams.get("group")?.trim() || "";

    // Bangun SQL dinamis secara aman dengan parameterized query
    let sql = `
      SELECT id, username, name, groups, email, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (group && ["dosen", "lpmi", "admin"].includes(group)) {
      sql += " AND groups = ?";
      params.push(group);
    }

    if (q) {
      sql += " AND (name LIKE ? OR username LIKE ? OR email LIKE ?)";
      const wild = `%${q}%`;
      params.push(wild, wild, wild);
    }

    sql += " ORDER BY created_at DESC";

    const [users] = await pool.execute<SafeUserRow[]>(sql, params);

    // Ambil statistik ringkas grup
    const [countRows] = await pool.execute<CountRow[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN groups = 'dosen' THEN 1 ELSE 0 END) as dosen_count,
        SUM(CASE WHEN groups = 'lpmi' THEN 1 ELSE 0 END) as lpmi_count,
        SUM(CASE WHEN groups = 'admin' THEN 1 ELSE 0 END) as admin_count
      FROM users
    `);

    const summary = countRows[0] || {
      total: users.length,
      dosen_count: 0,
      lpmi_count: 0,
      admin_count: 0,
    };

    return NextResponse.json({
      success: true,
      data: users,
      summary: {
        total: Number(summary.total) || 0,
        dosen: Number(summary.dosen_count) || 0,
        lpmi: Number(summary.lpmi_count) || 0,
        admin: Number(summary.admin_count) || 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal mengambil daftar pengguna: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function handleCreateUser(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi data gagal",
        },
        { status: 400 }
      );
    }

    const { name, username, email, groups, password } = validation.data;

    // 1. Cek apakah username sudah terdaftar
    const [existingUsers] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Username / NIDN '${username}' sudah digunakan oleh akun lain. Silakan gunakan username berbeda.`,
        },
        { status: 409 }
      );
    }

    // 2. Hash kata sandi dengan bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = randomUUID();
    const cleanEmail = email && email.trim() !== "" ? email.trim() : null;

    // 3. Simpan ke basis data MySQL
    await pool.execute<ResultSetHeader>(
      `INSERT INTO users (id, username, password, name, groups, email, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, username, hashedPassword, name, groups, cleanEmail]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Akun untuk '${name}' dengan peran '${groups.toUpperCase()}' berhasil dibuat.`,
        data: {
          id: userId,
          username,
          name,
          groups,
          email: cleanEmail,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal membuat akun baru: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGetUsers(request);
}

export async function POST(request: NextRequest) {
  return handleCreateUser(request);
}

