import { Pool, PoolClient } from 'pg';
declare const pool: Pool;
export declare function query(text: string, params?: any[]): Promise<import("pg").QueryResult<any>>;
export declare function getClient(): Promise<PoolClient>;
export declare function closePool(): Promise<void>;
export default pool;
//# sourceMappingURL=connection.d.ts.map