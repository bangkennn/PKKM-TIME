import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { randomUUID } from "crypto";
import { createPkmProposalSchema } from "@/schemas/pkm.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface PkmProposalRow extends RowDataPacket {
  id: string;
  user_id: string;
  author_name: string;
  team_members: Array<{ name: string; role: string }> | string | null;
  title: string;
  scheme: string;
  academic_year: string;
  duration_months: number;
  pkm_topic: string | null;
  proposal_year: number | null;
  budget: number;
  abstract: string | null;
  file_name: string | null;
  file_custom_name: string | null;
  file_kemajuan: string | null;
  luaran_jenis: string | null;
  luaran_target: string | null;
  luaran_keterangan: string | null;
  target_luaran_nama: string | null;
  target_luaran_keterangan: string | null;
  file_akhir: string | null;
  luaran_akhir_jenis: string | null;
  luaran_akhir_realisasi: string | null;
  luaran_akhir_link: string | null;
  luaran_akhir_keterangan: string | null;
  status_tahap1: "draft" | "pending_review" | "approved" | "rejected";
  status_tahap2: "locked" | "in_progress" | "pending_review" | "approved" | "rejected";
  status_tahap3: "locked" | "in_progress" | "pending_review" | "approved" | "rejected";
  overall_status: "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export async function handleGetPkm(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const stage = searchParams.get("stage")?.trim() || "";

    let sql = `
      SELECT id, user_id, author_name, team_members, title, scheme, academic_year,
             duration_months, pkm_topic, proposal_year, budget, abstract, file_name, file_custom_name,
             file_kemajuan, luaran_jenis, luaran_target, luaran_keterangan,
             target_luaran_nama, target_luaran_keterangan,
             file_akhir, luaran_akhir_jenis, luaran_akhir_realisasi, luaran_akhir_link, luaran_akhir_keterangan,
             status_tahap1, status_tahap2, status_tahap3, overall_status, created_at, updated_at
      FROM pkm_proposals
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    // Filter berdasarkan Tahapan
    if (stage === "2") {
      sql += " AND status_tahap1 = 'approved'";
    } else if (stage === "3") {
      sql += " AND status_tahap2 = 'approved'";
    }

    if (status) {
      if (stage === "2") {
        sql += " AND status_tahap2 = ?";
      } else if (stage === "3") {
        sql += " AND status_tahap3 = ?";
      } else {
        sql += " AND status_tahap1 = ?";
      }
      params.push(status);
    }

    if (q) {
      sql += " AND (title LIKE ? OR author_name LIKE ? OR scheme LIKE ?)";
      const wild = `%${q}%`;
      params.push(wild, wild, wild);
    }

    sql += " ORDER BY created_at DESC";

    const [rows] = await pool.execute<PkmProposalRow[]>(sql, params);

    // Summary count komprehensif seluruh tahapan PKM
    const [countRows] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status_tahap1 = 'approved' THEN 1 ELSE 0 END) as stage1_approved,
        SUM(CASE WHEN status_tahap1 = 'pending_review' THEN 1 ELSE 0 END) as stage1_pending,
        SUM(CASE WHEN status_tahap2 = 'approved' THEN 1 ELSE 0 END) as stage2_approved,
        SUM(CASE WHEN status_tahap2 = 'pending_review' THEN 1 ELSE 0 END) as stage2_pending,
        SUM(CASE WHEN status_tahap2 = 'in_progress' THEN 1 ELSE 0 END) as stage2_in_progress,
        SUM(CASE WHEN status_tahap3 = 'approved' THEN 1 ELSE 0 END) as stage3_approved,
        SUM(CASE WHEN status_tahap3 = 'pending_review' THEN 1 ELSE 0 END) as stage3_pending,
        SUM(CASE WHEN overall_status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM pkm_proposals
    `);

    const total = Number(countRows[0]?.total) || 0;
    const stage1Approved = Number(countRows[0]?.stage1_approved) || 0;
    const stage1Pending = Number(countRows[0]?.stage1_pending) || 0;
    const stage2Approved = Number(countRows[0]?.stage2_approved) || 0;
    const stage2Pending = Number(countRows[0]?.stage2_pending) || 0;
    const stage2InProgress = Number(countRows[0]?.stage2_in_progress) || 0;
    const stage3Approved = Number(countRows[0]?.stage3_approved) || 0;
    const stage3Pending = Number(countRows[0]?.stage3_pending) || 0;
    const completed = Number(countRows[0]?.completed_count) || 0;

    return NextResponse.json({
      success: true,
      data: rows,
      summary: {
        total,
        approved: stage1Approved,
        pending: stage1Pending,
        stage1Approved,
        stage1Pending,
        stage2Approved,
        stage2Pending,
        stage2InProgress,
        stage3Approved,
        stage3Pending,
        completed,
        isStage2Unlocked: stage1Approved > 0,
        isStage3Unlocked: stage2Approved > 0,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal memuat usulan pengabdian: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function handleCreatePkm(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPkmProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi data usulan PKM gagal",
        },
        { status: 400 }
      );
    }

    const {
      title,
      scheme,
      academicYear,
      proposalYear,
      durationMonths = 6,
      pkmTopic,
      budget,
      teamMembers,
      luaranJenis,
      targetLuaranNama,
      targetLuaranKeterangan,
      abstract,
      fileName,
      fileCustomName,
    } = validation.data;
    let userId = validation.data.userId || "dosen-uuid-001";
    let authorName = validation.data.authorName || "Dr. Ir. Hendra Wijaya, M.Kom.";

    if (teamMembers && teamMembers.length > 0 && teamMembers[0]?.name) {
      authorName = teamMembers[0].name;
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded?.id) {
        userId = decoded.id;
      }
      if (decoded?.name && (!teamMembers || teamMembers.length === 0)) {
        authorName = decoded.name;
      }
    }

    const proposalId = randomUUID();
    const cleanAbstract = abstract && abstract.trim() !== "" ? abstract.trim() : null;
    const cleanFileName = fileName && fileName.trim() !== "" ? fileName.trim() : `Proposal_PKM_${Date.now()}.pdf`;
    const cleanFileCustom = fileCustomName && fileCustomName.trim() !== "" ? fileCustomName.trim() : cleanFileName;
    const teamMembersJson = teamMembers && teamMembers.length > 0 ? JSON.stringify(teamMembers) : null;

    await pool.execute<ResultSetHeader>(
      `INSERT INTO pkm_proposals 
       (id, user_id, author_name, team_members, title, scheme, academic_year, duration_months, pkm_topic, proposal_year, budget, abstract, file_name, file_custom_name, luaran_jenis, target_luaran_nama, target_luaran_keterangan, status_tahap1, status_tahap2, status_tahap3, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review', 'locked', 'locked', NOW(), NOW())`,
      [
        proposalId,
        userId,
        authorName,
        teamMembersJson,
        title,
        scheme,
        academicYear,
        durationMonths,
        pkmTopic || null,
        proposalYear || new Date().getFullYear(),
        budget,
        cleanAbstract,
        cleanFileName,
        cleanFileCustom,
        luaranJenis || null,
        targetLuaranNama || null,
        targetLuaranKeterangan || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Usulan proposal PKM '${title}' berhasil diajukan dan sedang menunggu review LPPM.`,
        data: {
          id: proposalId,
          title,
          scheme,
          academicYear,
          budget,
          status_tahap1: "pending_review",
          status_tahap2: "locked",
          status_tahap3: "locked",
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server";
    return NextResponse.json(
      {
        success: false,
        error: `Gagal mengajukan proposal PKM: ${message}`,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleGetPkm(request);
}

export async function POST(request: NextRequest) {
  return handleCreatePkm(request);
}

