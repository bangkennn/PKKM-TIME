import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { submitFinalReportSchema } from "@/schemas/research.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = submitFinalReportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi laporan akhir gagal",
        },
        { status: 400 }
      );
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT id, title, status_tahap2, status_tahap3 FROM research_proposals WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usulan penelitian tidak ditemukan." },
        { status: 404 }
      );
    }

    const proposal = rows[0];
    if (proposal.status_tahap2 !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Laporan akhir hanya dapat diunggah jika laporan kemajuan telah disetujui LPPM.",
        },
        { status: 400 }
      );
    }

    const {
      fileAkhir,
      luaranAkhirJenis,
      luaranAkhirRealisasi,
      luaranAkhirLink,
      luaranAkhirKeterangan,
    } = validation.data;

    await pool.execute<ResultSetHeader>(
      `UPDATE research_proposals
       SET file_akhir = ?, luaran_akhir_jenis = ?, luaran_akhir_realisasi = ?,
           luaran_akhir_link = ?, luaran_akhir_keterangan = ?,
           status_tahap3 = 'pending_review', updated_at = NOW()
       WHERE id = ?`,
      [
        fileAkhir,
        luaranAkhirJenis,
        luaranAkhirRealisasi,
        luaranAkhirLink || null,
        luaranAkhirKeterangan || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Laporan akhir dan bukti luaran final penelitian '${proposal.title}' berhasil dikirimkan ke LPPM dan sedang menunggu review pengesahan.`,
      data: {
        id,
        status_tahap3: "pending_review",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: `Gagal mengirimkan laporan akhir: ${message}` },
      { status: 500 }
    );
  }
}

