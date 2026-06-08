"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.getClient = getClient;
exports.closePool = closePool;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const envPaths = [
    path_1.default.join(process.cwd(), '.env'),
    path_1.default.join(process.cwd(), 'backend', '.env'),
    path_1.default.join(__dirname, '../.env'),
    path_1.default.join(__dirname, '../../.env'),
    path_1.default.join(__dirname, '../../../.env'),
];
for (const envPath of envPaths) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        break;
    }
}
const useConnectionString = !!process.env.DATABASE_URL;
const poolConfig = useConnectionString
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'study_planner_dev',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
    };
// Cloud databases (Neon, Supabase, Render) require SSL in production/remote connections
if (process.env.NODE_ENV === 'production' ||
    (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') && !process.env.DATABASE_URL.includes('127.0.0.1'))) {
    poolConfig.ssl = {
        rejectUnauthorized: false,
    };
}
const pool = new pg_1.Pool(poolConfig);
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: result.rowCount });
        return result;
    }
    catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}
async function getClient() {
    const client = await pool.connect();
    return client;
}
async function closePool() {
    await pool.end();
}
exports.default = pool;
//# sourceMappingURL=connection.js.map