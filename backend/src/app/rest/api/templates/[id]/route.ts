import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import path from "path";
import fs from "fs";

export const UPLOAD_TEMPLATES_DIR = path.join(process.cwd(), "uploads", "templates");

export interface TemplateDetailRow extends RowDataPacket {
  id: string;
  title: string;
  category: "proposal" | "laporan";
  description: string | null;
  filename: string;
  file_size: string;
  file_data: string | null;
  version: string;
  created_at: string;
  updated_at: string;
}

export async function handleGetTemplateDetail(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<TemplateDetailRow[]>(
      `SELECT * FROM \`document_templates\` WHERE id = ? LIMIT 1`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Template dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    const item = rows[0];
    let fileDataBase64 = item.file_data;

    // Periksa apakah berkas disimpan di disk filesystem
    const diskPath = path.join(UPLOAD_TEMPLATES_DIR, `${id}.docx`);
    if (fs.existsSync(diskPath)) {
      try {
        const buffer = fs.readFileSync(diskPath);
        fileDataBase64 = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${buffer.toString("base64")}`;
      } catch (readErr) {
        console.error("Gagal membaca berkas dari disk:", readErr);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        file_data: fileDataBase64,
      },
    });
  } catch (error) {
    console.error("GET /rest/api/templates/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal server." },
      { status: 500 }
    );
  }
}

export async function handleDeleteTemplate(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [check] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, filename FROM \`document_templates\` WHERE id = ? LIMIT 1`,
      [id]
    );

    if (check.length === 0) {
      return NextResponse.json(
        { success: false, message: "Template dokumen tidak ditemukan." },
        { status: 404 }
      );
    }

    // Hapus berkas fisik dari disk jika ada
    const diskPath = path.join(UPLOAD_TEMPLATES_DIR, `${id}.docx`);
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (unlinkErr) {
        console.warn("Gagal menghapus berkas fisik dari disk:", unlinkErr);
      }
    }

    await pool.query<ResultSetHeader>(
      `DELETE FROM \`document_templates\` WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `Template '${check[0].title}' (${check[0].filename}) berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE /rest/api/templates/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus berkas template dari basis data." },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleGetTemplateDetail(request, context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleDeleteTemplate(request, context);
}

