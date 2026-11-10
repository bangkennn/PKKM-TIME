import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { updateUserSchema } from "@/schemas/user.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  name: string;
  groups: string;
}

export async function handleUpdateUser(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi data gagal",
        },
        { status: 400 }
      );
    }

    const { name, email, groups } = validation.data;

    // Cek keberadaan user
    const [existing] = await pool.execute<UserRow[]>(
      "SELECT id, username, name, groups FROM users WHERE id = ? LIMIT 1",
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

    // Proteksi: Root admin tidak boleh diturunkan perannya
    if ((user.id === "admin-uuid-001" || user.username === "admin") && groups !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Peran Administrator Utama sistem tidak dapat diubah.",
        },
        { status: 403 }
      );
    }

    const cleanEmail = email && email.trim() !== "" ? email.trim() : null;

    await pool.execute<ResultSetHeader>(
      "UPDATE users SET name = ?, email = ?, groups = ?, updated_at = NOW() WHERE id = ?",
      [name, cleanEmail, groups, id]
    );

    return NextResponse.json({
      success: true,
      message: `Data akun '${name}' berhasil diperbarui.`,
      data: {
        id,
        name,
        email: cleanEmail,
        groups,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal memperbarui pengguna: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function handleDeleteUser(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Cek target user
    const [existing] = await pool.execute<UserRow[]>(
      "SELECT id, username, name, groups FROM users WHERE id = ? LIMIT 1",
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

    const targetUser = existing[0];

    // 1. Proteksi Root Administrator
    if (targetUser.id === "admin-uuid-001" || targetUser.username === "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Akun Administrator Utama sistem SiPANDU dilindungi dan tidak dapat dihapus.",
        },
        { status: 403 }
      );
    }

    // 2. Proteksi diri sendiri (Self-deletion prevention)
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded?.id === id) {
        return NextResponse.json(
          {
            success: false,
            error: "Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif masuk.",
          },
          { status: 400 }
        );
      }
    }

    // Hapus dari database
    await pool.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: `Akun '${targetUser.name}' (${targetUser.username}) berhasil dihapus.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal menghapus pengguna: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleUpdateUser(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleDeleteUser(request, context);
}

