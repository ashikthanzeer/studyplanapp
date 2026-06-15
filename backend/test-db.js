const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zYyhQl39avWA@ep-damp-dawn-aqiqmjpq-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('Connected to PostgreSQL successfully.');
  
  // 1. Get list of tables
  console.log('\n--- Tables in Database ---');
  const tablesRes = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema='public'
  `);
  console.log(tablesRes.rows.map(r => r.table_name));
  
  // 2. Row counts
  console.log('\n--- Row Counts ---');
  const tables = ['users', 'student_profiles', 'subjects', 'tasks', 'pomodoro_sessions', 'user_preferences', 'user_streaks', 'user_badges'];
  for (const table of tables) {
    try {
      const countRes = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`${table}: ${countRes.rows[0].count}`);
    } catch (e) {
      console.log(`${table}: Error - ${e.message}`);
    }
  }
  
  // 3. Recent 5 sessions
  console.log('\n--- Recent 5 Pomodoro Sessions ---');
  try {
    const sessionsRes = await client.query(`
      SELECT * FROM pomodoro_sessions 
      ORDER BY id DESC 
      LIMIT 5
    `);
    console.log(JSON.stringify(sessionsRes.rows, null, 2));
  } catch (e) {
    console.error('Error fetching recent sessions:', e.message);
  }

  // 4. Check user streaks structure
  console.log('\n--- User Streaks Schema ---');
  try {
    const columnsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_streaks'
    `);
    console.log(columnsRes.rows);
  } catch (e) {
    console.error(e.message);
  }

  await client.end();
}

run().catch(console.error);
