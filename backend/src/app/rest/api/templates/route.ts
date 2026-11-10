import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { randomUUID } from "crypto";
import { createTemplateSchema } from "@/schemas/template.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import path from "path";
import fs from "fs";

export const UPLOAD_TEMPLATES_DIR = path.join(process.cwd(), "uploads", "templates");

export interface TemplateRow extends RowDataPacket {
  id: string;
  title: string;
  category: "proposal" | "laporan";
  description: string | null;
  filename: string;
  file_size: string;
  file_data?: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export async function handleGetTemplates(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.trim().toLowerCase();
    const q = searchParams.get("q")?.trim();

    let sql = `
      SELECT id, title, category, description, filename, file_size, version, created_at, updated_at
      FROM \`document_templates\`
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (category && (category === "proposal" || category === "laporan")) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (q) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR filename LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query<TemplateRow[]>(sql, params);

    // Summary calculation
    const [summaryRows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN category = 'proposal' THEN 1 ELSE 0 END) AS proposal_count,
        SUM(CASE WHEN category = 'laporan' THEN 1 ELSE 0 END) AS laporan_count
      FROM \`document_templates\`
    `);

    const s = summaryRows[0] || {};

    return NextResponse.json({
      success: true,
      data: rows,
      summary: {
        total: Number(s.total || 0),
        proposal: Number(s.proposal_count || 0),
        laporan: Number(s.laporan_count || 0),
      },
    });
  } catch (error) {
    console.error("GET /rest/api/templates error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server saat mengambil data template." },
      { status: 500 }
    );
  }
}

export async function handlePostTemplate(request: NextRequest) {
  try {
    const body = await request.json();
    const parseResult = createTemplateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: parseResult.error.issues[0]?.message || "Validasi data template gagal.",
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, category, description, filename, file_size, file_data, version } = parseResult.data;

    // Strict validation: Must end with .docx
    if (!filename.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        {
          success: false,
          message: "Format berkas tidak valid. Berkas wajib berupa dokumen Microsoft Word (.docx).",
        },
        { status: 400 }
      );
    }

    const id = `tpl-${randomUUID()}`;

    // Simpan berkas fisik ke disk server (uploads/templates/) untuk mencegah limit max_allowed_packet MySQL
    let storedFileDataRef: string | null = null;
    if (file_data) {
      try {
        if (!fs.existsSync(UPLOAD_TEMPLATES_DIR)) {
          fs.mkdirSync(UPLOAD_TEMPLATES_DIR, { recursive: true });
        }
        const matches = file_data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        const base64Content = matches ? matches[2] : file_data;
        const fileBuffer = Buffer.from(base64Content, "base64");
        const filePath = path.join(UPLOAD_TEMPLATES_DIR, `${id}.docx`);
        fs.writeFileSync(filePath, fileBuffer);
        storedFileDataRef = `uploads/templates/${id}.docx`;
      } catch (fsError) {
        console.error("Gagal menulis berkas template ke disk:", fsError);
      }
    }

    await pool.query<ResultSetHeader>(
      `INSERT INTO \`document_templates\` 
       (id, title, category, description, filename, file_size, file_data, version) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title.trim(),
        category,
        description ? description.trim() : null,
        filename.trim(),
        file_size || "0 KB",
        storedFileDataRef,
        version || "v2026.1",
      ]
    );

    const [createdRows] = await pool.query<TemplateRow[]>(
      `SELECT id, title, category, description, filename, file_size, version, created_at, updated_at
       FROM \`document_templates\` WHERE id = ?`,
      [id]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Template berkas (.docx) berhasil ditambahkan.",
        data: createdRows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /rest/api/templates error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan template berkas ke basis data." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGetTemplates(request);
}

export async function POST(request: NextRequest) {
  return handlePostTemplate(request);
}

