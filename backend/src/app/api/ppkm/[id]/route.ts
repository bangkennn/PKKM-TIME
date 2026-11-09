import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createPPKMEntrySchema, updatePPKMEntrySchema } from "@/schemas/ppkm.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/ppkm/[id]
 * Mengambil satu data kegiatan berdasarkan ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabase
      .from("ppkm_entries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: `Data dengan ID '${id}' tidak ditemukan`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
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

    const { data, error } = await supabase
      .from("ppkm_entries")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui (Full Update)",
      data,
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

    const { data, error } = await supabase
      .from("ppkm_entries")
      .update(validation.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Data berhasil diperbarui (Partial Update)",
      data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/ppkm/[id]
 * Menghapus data kegiatan berdasarkan ID
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const { error } = await supabase
      .from("ppkm_entries")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Data dengan ID '${id}' berhasil dihapus`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

