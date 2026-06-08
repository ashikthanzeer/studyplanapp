import { query, closePool } from './connection';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const sqlPath = path.join(__dirname, 'migration_remove_kanban.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL migration script...');
    await query(sql);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

run();
