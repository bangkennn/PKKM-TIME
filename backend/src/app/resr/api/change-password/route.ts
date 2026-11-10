import { NextRequest } from "next/server";
import { handleChangePassword, OPTIONS as baseOptions } from "@/app/rest/api/change-password/route";

/**
 * Route Alias /resr/api/change-password
 * Memenuhi spesifikasi konsistensi rute /resr/
 */
export async function POST(request: NextRequest) {
  return handleChangePassword(request);
}

export async function PUT(request: NextRequest) {
  return handleChangePassword(request);
}

export async function OPTIONS() {
  return baseOptions();
}

