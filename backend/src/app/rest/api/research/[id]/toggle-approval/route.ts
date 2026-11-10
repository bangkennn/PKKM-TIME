import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface ProposalRow extends RowDataPacket {
  id: string;
  title: string;
  status_tahap1: string;
  status_tahap2: string;
  status_tahap3: string;
  overall_status: string;
}

export async function handleToggleApproval(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get("stage")?.trim() || "1";

    const [rows] = await pool.execute<ProposalRow[]>(
      "SELECT id, title, status_tahap1, status_tahap2, status_tahap3, overall_status FROM research_proposals WHERE id = ? LIMIT 1",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Usulan penelitian tidak ditemukan",
        },
        { status: 404 }
      );
    }

    const current = rows[0];

    if (stage === "2") {
      // Toggle approval Tahap 2 (Laporan Kemajuan)
      if (current.status_tahap1 !== "approved") {
        return NextResponse.json(
          {
            success: false,
            error: "Tahap 2 belum dapat disetujui karena Tahap 1 (Proposal) belum disetujui LPPM.",
          },
          { status: 400 }
        );
      }

      const isStage2Approved = current.status_tahap2 === "approved";
      const newStatusTahap2 = isStage2Approved ? "pending_review" : "approved";
      const newStatusTahap3 = isStage2Approved ? "locked" : "in_progress";

      await pool.execute<ResultSetHeader>(
        `UPDATE research_proposals 
         SET status_tahap2 = ?, status_tahap3 = ?, updated_at = NOW() 
         WHERE id = ?`,
        [newStatusTahap2, newStatusTahap3, id]
      );

      return NextResponse.json({
        success: true,
        message: isStage2Approved
          ? `Status Laporan Kemajuan '${current.title}' dikembalikan menjadi 'Menunggu Review LPPM'. Tahap 3 kembali terkunci.`
          : `Laporan Kemajuan '${current.title}' BERHASIL DISETUJUI oleh LPPM! Tahap 3 (Laporan Akhir) kini TERBUKA.`,
        data: {
          id,
          status_tahap2: newStatusTahap2,
          status_tahap3: newStatusTahap3,
        },
      });
    }

    if (stage === "3") {
      // Toggle approval Tahap 3 (Laporan Akhir) & Keseluruhan Penelitian
      if (current.status_tahap2 !== "approved") {
        return NextResponse.json(
          {
            success: false,
            error: "Tahap 3 belum dapat disetujui karena Laporan Kemajuan Tahap 2 belum disetujui LPPM.",
          },
          { status: 400 }
        );
      }

      const isStage3Approved = current.status_tahap3 === "approved";
      const newStatusTahap3 = isStage3Approved ? "pending_review" : "approved";
      const newOverallStatus = isStage3Approved ? "in_progress" : "completed";

      await pool.execute<ResultSetHeader>(
        `UPDATE research_proposals 
         SET status_tahap3 = ?, overall_status = ?, updated_at = NOW() 
         WHERE id = ?`,
        [newStatusTahap3, newOverallStatus, id]
      );

      return NextResponse.json({
        success: true,
        message: isStage3Approved
          ? `Status Laporan Akhir '${current.title}' dikembalikan menjadi 'Menunggu Review LPPM'. Status penelitian kembali 'Dalam Pengerjaan'.`
          : `Laporan Akhir '${current.title}' RESMI DISETUJUI oleh LPPM! Seluruh tahapan penelitian telah LENGKAP & status penelitian dinyatakan 'SELESAI'.`,
        data: {
          id,
          status_tahap3: newStatusTahap3,
          overall_status: newOverallStatus,
        },
      });
    }

    // Default: Toggle approval Tahap 1 (Proposal)
    const isCurrentlyApproved = current.status_tahap1 === "approved";
    const newStatusTahap1 = isCurrentlyApproved ? "pending_review" : "approved";
    const newStatusTahap2 = isCurrentlyApproved ? "locked" : "in_progress";
    const newStatusTahap3 = isCurrentlyApproved ? "locked" : current.status_tahap3;
    const newOverallStatus = isCurrentlyApproved ? "in_progress" : current.overall_status;

    await pool.execute<ResultSetHeader>(
      `UPDATE research_proposals 
       SET status_tahap1 = ?, status_tahap2 = ?, status_tahap3 = ?, overall_status = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newStatusTahap1, newStatusTahap2, newStatusTahap3, newOverallStatus, id]
    );

    return NextResponse.json({
      success: true,
      message: isCurrentlyApproved
        ? `Status proposal '${current.title}' dikembalikan menjadi 'Menunggu Review LPPM'. Tahap 2 kembali terkunci.`
        : `Proposal '${current.title}' BERHASIL DISETUJUI oleh pihak LPPM! Tahap 2 (Laporan Kemajuan) kini TERBUKA.`,
      data: {
        id,
        status_tahap1: newStatusTahap1,
        status_tahap2: newStatusTahap2,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal memperbarui status persetujuan: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return handleToggleApproval(request, context);
}
