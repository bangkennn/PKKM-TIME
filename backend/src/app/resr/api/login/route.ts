import { NextRequest } from "next/server";
import { handleLogin, OPTIONS as baseOptions } from "@/app/rest/api/login/route";

/**
 * Route Alias /resr/api/login
 * Memenuhi spesifikasi rute tepat sesuai permintaan pengguna
 */
export async function POST(request: NextRequest) {
  return handleLogin(request);
}

export async function OPTIONS() {
  return baseOptions();
}

