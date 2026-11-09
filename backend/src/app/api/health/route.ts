import { NextResponse } from "next/server";
import { DB_DATABASE_NAME, testConnection } from "@/lib/db";

export async function GET() {
  const dbStatus = await testConnection();

  return NextResponse.json({
    status: "ok",
    service: "PPKM Time API Service (MySQL XAMPP)",
    version: "1.0.0",
    database: {
      type: "MySQL / MariaDB (XAMPP)",
      target: DB_DATABASE_NAME,
      connected: dbStatus.connected,
      message: dbStatus.message,
    },
    timestamp: new Date().toISOString(),
  });
}
