import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { createPPKMEntrySchema, queryParamSchema } from "@/schemas/ppkm.schema";
import crypto from "crypto";
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

interface CountRow extends RowDataPacket {
  total: number;
}

/**
 * GET /api/ppkm
 * Mengambil daftar kegiatan PPKM dari MySQL XAMPP
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsedParams = queryParamSchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
    });

    if (!parsedParams.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Parameter query tidak valid",
          details: parsedParams.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { page, limit, category, search } = parsedParams.data;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }

    if (search) {
      conditions.push("(title LIKE ? OR description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 1. Get total count
    const countSql = `SELECT COUNT(*) as total FROM ppkm_entries ${whereClause}`;
    const [countResult] = await pool.execute<CountRow[]>(countSql, params);
    const total = countResult[0]?.total || 0;

    // 2. Get paginated rows
    // In mysql2 execute, LIMIT and OFFSET can be directly embedded as integers to avoid driver strict typing mismatch
    const dataSql = `SELECT * FROM ppkm_entries ${whereClause} ORDER BY created_at DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`;
    const [rows] = await pool.execute<PPKMRow[]>(dataSql, params);

    return NextResponse.json({
      success: true,
      data: rows,
      meta: {
        page,
        limit,
        total,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json(
      {
        success: false,
        error: message,
        notice: "Pastikan MySQL di XAMPP Control Panel aktif dan database 'ppkm_stmik_time' sudah diimport.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ppkm
 * Menyimpan data kegiatan baru ke MySQL XAMPP
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPPKMEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { title, category, durationMinutes, description, studentId, date } = validation.data;
    const id = crypto.randomUUID();

    const insertSql = `
      INSERT INTO ppkm_entries (id, title, category, duration_minutes, description, student_id, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute<ResultSetHeader>(insertSql, [
      id,
      title,
      category,
      durationMinutes,
      description || null,
      studentId || null,
      date ? new Date(date) : new Date(),
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: "Gagal menyimpan data ke database" },
        { status: 500 }
      );
    }

    // Ambil data yang baru dibuat
    const [createdRows] = await pool.execute<PPKMRow[]>(
      "SELECT * FROM ppkm_entries WHERE id = ?",
      [id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Data kegiatan berhasil disimpan ke MySQL",
        data: createdRows[0],
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json(
      {
        success: false,
        error: message,
        notice: "Pastikan MySQL di XAMPP Control Panel aktif dan database 'ppkm_stmik_time' sudah diimport.",
      },
      { status: 500 }
    );
  }
}
