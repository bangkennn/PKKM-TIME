import { NextResponse } from "next/server";
import { DB_DATABASE_NAME } from "@/lib/supabase";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "PPKM Time API Service",
    version: "1.0.0",
    databaseTarget: DB_DATABASE_NAME,
    timestamp: new Date().toISOString(),
  });
}

