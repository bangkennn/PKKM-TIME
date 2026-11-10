import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { submitPkmProgressReportSchema } from "@/schemas/pkm.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = submitPkmProgressReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi laporan kemajuan PKM gagal",
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, status_tahap1, status_tahap2 FROM pkm_proposals WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usulan pengabdian (PKM) tidak ditemukan." },
        { status: 404 }
      );
    }

    const proposal = rows[0];
    if (proposal.status_tahap1 !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Laporan kemajuan hanya dapat diunggah jika proposal PKM telah disetujui LPPM.",
        },
        { status: 400 }
      );
    }

    const { fileKemajuan, luaranJenis, luaranTarget, luaranKeterangan } = validation.data;

    await pool.execute<ResultSetHeader>(
      `UPDATE pkm_proposals
       SET file_kemajuan = ?, luaran_jenis = ?, luaran_target = ?, luaran_keterangan = ?,
           status_tahap2 = 'pending_review', updated_at = NOW()
       WHERE id = ?`,
      [fileKemajuan, luaranJenis, luaranTarget, luaranKeterangan || null, id]
    );

    return NextResponse.json({
      success: true,
      message: `Laporan kemajuan dan luaran pengabdian '${proposal.title}' berhasil dikirimkan ke LPPM dan sedang menunggu review.`,
      data: {
        id,
        status_tahap2: "pending_review",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: `Gagal mengirimkan laporan kemajuan PKM: ${message}` },
      { status: 500 }
    );
  }
}

