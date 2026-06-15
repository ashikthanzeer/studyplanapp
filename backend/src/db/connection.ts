import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), 'backend', '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../../../.env'),
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const useConnectionString = !!process.env.DATABASE_URL;

const poolConfig: any = useConnectionString
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'study_planner_dev',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };

// Cloud databases (Neon, Supabase, Render) require SSL in production/remote connections
if (
  process.env.NODE_ENV === 'production' ||
  (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'))
) {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const maxAttempts = 3;
  let delay = 500; // ms

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount, attempt });
      return result;
    } catch (error: any) {
      const duration = Date.now() - start;
      console.error(`Database query error (attempt ${attempt}/${maxAttempts}, duration ${duration}ms):`, error);

      const errCode = error?.code || '';
      const isSyntaxOrConstraint = errCode.startsWith('23') || errCode.startsWith('42');

      if (isSyntaxOrConstraint || attempt === maxAttempts) {
        throw error;
      }

      console.warn(`Retrying query in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error('Database query failed after max retries');
}

export async function getClient(): Promise<PoolClient> {
  const client = await pool.connect();
  return client;
}

export async function closePool() {
  await pool.end();
}

export default pool;
