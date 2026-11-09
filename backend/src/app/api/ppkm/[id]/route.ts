import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createPPKMEntrySchema, updatePPKMEntrySchema } from "@/schemas/ppkm.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface PPKMRow extends RowDataPacket {
  id: string;
  title: string;
  category: string;
  duration_minutes: number;
  description: string | null;
  student_id: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ppkm/[id]
 * Mengambil detail 1 data kegiatan berdasarkan ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const [rows] = await pool.execute<PPKMRow[]>(
      "SELECT * FROM ppkm_entries WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: `Data dengan ID '${id}' tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PUT /api/ppkm/[id]
 * Mengganti seluruh data kegiatan (Full Replace)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const validation = createPPKMEntrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload PUT tidak lengkap",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { title, category, durationMinutes, description, studentId, date } = validation.data;

    const updateSql = `
      UPDATE ppkm_entries
      SET title = ?, category = ?, duration_minutes = ?, description = ?, student_id = ?, date = ?
      WHERE id = ?
    `;

    const [result] = await pool.execute<ResultSetHeader>(updateSql, [
      title,
      category,
      durationMinutes,
      description || null,
      studentId || null,
      date ? new Date(date) : new Date(),
      id,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: `Data dengan ID '${id}' tidak ditemukan` },
        { status: 404 }
      );
    }

    const [updatedRows] = await pool.execute<PPKMRow[]>(
      "SELECT * FROM ppkm_entries WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui (Full Update)",
      data: updatedRows[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/ppkm/[id]
 * Memperbarui sebagian data kegiatan (Partial Update)
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const validation = updatePPKMEntrySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload PATCH tidak valid",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const fields: string[] = [];
    const values: (string | number | Date | null)[] = [];

    const data = validation.data;
    if (data.title !== undefined) {
      fields.push("title = ?");
      values.push(data.title);
    }
    if (data.category !== undefined) {
      fields.push("category = ?");
      values.push(data.category);
    }
    if (data.durationMinutes !== undefined) {
      fields.push("duration_minutes = ?");
      values.push(data.durationMinutes);
    }
    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }
    if (data.studentId !== undefined) {
      fields.push("student_id = ?");
      values.push(data.studentId);
    }
    if (data.date !== undefined) {
      fields.push("date = ?");
      values.push(data.date ? new Date(data.date) : new Date());
    }

    if (fields.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada field yang diberikan untuk diperbarui" },
        { status: 400 }
      );
    }

    values.push(id);
    const updateSql = `UPDATE ppkm_entries SET ${fields.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute<ResultSetHeader>(updateSql, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: `Data dengan ID '${id}' tidak ditemukan` },
        { status: 404 }
      );
    }

    const [updatedRows] = await pool.execute<PPKMRow[]>(
      "SELECT * FROM ppkm_entries WHERE id = ?",
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui (Partial Update)",
      data: updatedRows[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/ppkm/[id]
 * Menghapus data kegiatan dari MySQL XAMPP
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM ppkm_entries WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: `Data dengan ID '${id}' tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Data dengan ID '${id}' berhasil dihapus dari database MySQL`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
