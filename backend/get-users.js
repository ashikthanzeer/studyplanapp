const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zYyhQl39avWA@ep-damp-dawn-aqiqmjpq-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  
  console.log('\n--- All Users ---');
  const usersRes = await client.query('SELECT id, email, created_at FROM users ORDER BY id DESC');
  console.log(usersRes.rows);
  
  console.log('\n--- All Streaks ---');
  const streaksRes = await client.query('SELECT * FROM user_streaks');
  console.log(streaksRes.rows);
  
  console.log('\n--- All Badges ---');
  const badgesRes = await client.query('SELECT * FROM user_badges');
  console.log(badgesRes.rows);

  await client.end();
}

run().catch(console.error);
