import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createPPKMEntrySchema, queryParamSchema } from "@/schemas/ppkm.schema";

/**
 * GET /api/ppkm
 * Mengambil daftar data kegiatan dari Supabase
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

    let query = supabase
      .from("ppkm_entries")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    const { data, count, error } = await query;

    // Graceful fallback jika tabel belum dibuat di Supabase
    if (error) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          page,
          limit,
          total: 0,
          notice: `Supabase database query: ${error.message}. Pastikan tabel 'ppkm_entries' telah dimigrasikan di database PPKM_stmik_time.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      meta: {
        page,
        limit,
        total: count || 0,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ppkm
 * Menyimpan data kegiatan baru ke Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createPPKMEntrySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Payload validasi gagal",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const newEntry = validation.data;

    const { data, error } = await supabase
      .from("ppkm_entries")
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: `Gagal menyimpan ke Supabase: ${error.message}`,
          payloadEcho: newEntry,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Data kegiatan berhasil disimpan",
        data,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

