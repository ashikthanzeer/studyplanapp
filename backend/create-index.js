const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_zYyhQl39avWA@ep-damp-dawn-aqiqmjpq-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await client.connect();
  console.log('Connected to database.');
  
  console.log('Creating index if not exists...');
  await client.query('CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);');
  console.log('Index created successfully.');
  
  await client.end();
}

run().catch(console.error);
