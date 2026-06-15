const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zYyhQl39avWA@ep-damp-dawn-aqiqmjpq-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  console.log('\n--- All Pomodoro Sessions ---');
  const res = await client.query('SELECT * FROM pomodoro_sessions ORDER BY id DESC');
  console.log(JSON.stringify(res.rows, null, 2));

  await client.end();
}

run().catch(console.error);
