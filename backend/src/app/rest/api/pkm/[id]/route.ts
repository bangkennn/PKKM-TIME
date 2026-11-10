import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { updatePkmProposalSchema } from "@/schemas/pkm.schema";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM pkm_proposals WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usulan pengabdian (PKM) tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: `Gagal memuat detail usulan PKM: ${message}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = updatePkmProposalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Validasi data usulan PKM gagal",
        },
        { status: 400 }
      );
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status_tahap1, title FROM pkm_proposals WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usulan pengabdian (PKM) tidak ditemukan." },
        { status: 404 }
      );
    }

    const proposal = existing[0];
    if (proposal.status_tahap1 === "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Proposal PKM yang telah disetujui LPPM tidak dapat diubah kembali.",
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

    let authorName = validation.data.authorName;
    if (teamMembers && teamMembers.length > 0 && teamMembers[0]?.name) {
      authorName = teamMembers[0].name;
    }

    const cleanAbstract = abstract && abstract.trim() !== "" ? abstract.trim() : null;
    const cleanFileName = fileName && fileName.trim() !== "" ? fileName.trim() : null;
    const cleanFileCustom = fileCustomName && fileCustomName.trim() !== "" ? fileCustomName.trim() : cleanFileName;
    const teamMembersJson = teamMembers && teamMembers.length > 0 ? JSON.stringify(teamMembers) : null;

    await pool.execute<ResultSetHeader>(
      `UPDATE pkm_proposals
       SET title = ?,
           scheme = ?,
           academic_year = ?,
           proposal_year = ?,
           duration_months = ?,
           pkm_topic = ?,
           budget = ?,
           team_members = ?,
           luaran_jenis = ?,
           target_luaran_nama = ?,
           target_luaran_keterangan = ?,
           abstract = ?,
           file_name = COALESCE(?, file_name),
           file_custom_name = COALESCE(?, file_custom_name),
           author_name = COALESCE(?, author_name),
           updated_at = NOW()
       WHERE id = ?`,
      [
        title,
        scheme,
        academicYear,
        proposalYear || new Date().getFullYear(),
        durationMonths,
        pkmTopic || null,
        budget,
        teamMembersJson,
        luaranJenis || null,
        targetLuaranNama || null,
        targetLuaranKeterangan || null,
        cleanAbstract,
        cleanFileName,
        cleanFileCustom,
        authorName || null,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: `Usulan proposal PKM '${title}' berhasil diperbarui.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: `Gagal memperbarui proposal PKM: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [existing] = await pool.execute<RowDataPacket[]>(
      `SELECT id, status_tahap1, title FROM pkm_proposals WHERE id = ?`,
      [id]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Usulan pengabdian (PKM) tidak ditemukan." },
        { status: 404 }
      );
    }

    const proposal = existing[0];
    if (proposal.status_tahap1 === "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "Proposal PKM yang telah disetujui LPPM tidak dapat dihapus demi integritas data.",
        },
        { status: 400 }
      );
    }

    await pool.execute<ResultSetHeader>(
      `DELETE FROM pkm_proposals WHERE id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: `Usulan proposal PKM '${proposal.title}' berhasil dihapus.`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return NextResponse.json(
      { success: false, error: `Gagal menghapus usulan PKM: ${message}` },
      { status: 500 }
    );
  }
}

