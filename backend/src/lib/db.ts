import mysql from "mysql2/promise";

const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "ppkm_stmik_time";

export const DB_DATABASE_NAME = dbName;

// Create MySQL connection pool
export const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * Execute a parameterized SQL query with type-safety and automatic connection release.
 */
export async function query<T>(sql: string, params: (string | number | boolean | Date | null | undefined)[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params as any);
  return rows as T;
}

/**
 * Test MySQL connection
 */
export async function testConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { connected: true, message: "Koneksi ke MySQL XAMPP berhasil." };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Tidak dapat terhubung ke MySQL XAMPP";
    return { connected: false, message };
  }
}
