import jwt from "jsonwebtoken";

export type UserGroup = "dosen" | "lpmi" | "admin";

export interface TokenPayload {
  id: string;
  username: string;
  name: string;
  groups: UserGroup;
  email?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET || "sipandu-stmik-time-super-secret-jwt-key-2026";

/**
 * Menandatangani (sign) payload menjadi token JWT
 * Masa berlaku default: 24 jam (1d)
 */
export function signToken(payload: TokenPayload, expiresIn: string | number = "24h"): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
  });
}

/**
 * Memverifikasi dan mendekode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

