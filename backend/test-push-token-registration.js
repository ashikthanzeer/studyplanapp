const { Client } = require('pg');
const jwt = require('jsonwebtoken');

const connectionString = 'postgresql://neondb_owner:npg_zYyhQl39avWA@ep-damp-dawn-aqiqmjpq-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const secret = 'your_jwt_secret_key_change_in_production';
const localURL = 'http://localhost:3000/api';
const mockPushToken = 'ExponentPushToken[mock_test_token_12345]';

async function run() {
  const dbClient = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  await dbClient.connect();
  console.log('Connected to Database.');

  // Clean up any leftovers first
  await dbClient.query('DELETE FROM user_push_tokens WHERE push_token = $1', [mockPushToken]);
  console.log('Cleaned up existing mock tokens.');

  // Generate tokens
  const token1 = jwt.sign({ id: 1, email: 'ashikthanzeer6@outlook.com' }, secret);
  const token2 = jwt.sign({ id: 3, email: 'devanarayananab781@gmail.com' }, secret);

  // Test 1: Register push token for User 1
  console.log('\n--- Test 1: Registering push token for User 1 ---');
  const res1 = await fetch(`${localURL}/auth/register-push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token1}`
    },
    body: JSON.stringify({ token: mockPushToken })
  });

  console.log('Test 1 status:', res1.status);
  const data1 = await res1.json();
  console.log('Test 1 body:', data1);

  if (res1.status !== 200 || !data1.success) {
    throw new Error('Test 1 failed: Expected status 200 and success true');
  }

  // Verify DB state
  const dbRes1 = await dbClient.query('SELECT user_id FROM user_push_tokens WHERE push_token = $1', [mockPushToken]);
  if (dbRes1.rows.length === 0 || dbRes1.rows[0].user_id !== 1) {
    throw new Error(`Test 1 DB verify failed: Expected owner user_id to be 1, got ${JSON.stringify(dbRes1.rows)}`);
  }
  console.log('✓ Test 1 DB verification passed: Token owned by User 1');

  // Test 2: Re-register the SAME push token for User 3 (Upsert check)
  console.log('\n--- Test 2: Re-registering push token for User 3 (Upsert conflict) ---');
  const res2 = await fetch(`${localURL}/auth/register-push-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token2}`
    },
    body: JSON.stringify({ token: mockPushToken })
  });

  console.log('Test 2 status:', res2.status);
  const data2 = await res2.json();
  console.log('Test 2 body:', data2);

  if (res2.status !== 200 || !data2.success) {
    throw new Error('Test 2 failed: Expected status 200 and success true');
  }

  // Verify DB state
  const dbRes2 = await dbClient.query('SELECT user_id FROM user_push_tokens WHERE push_token = $1', [mockPushToken]);
  if (dbRes2.rows.length === 0 || dbRes2.rows[0].user_id !== 3) {
    throw new Error(`Test 2 DB verify failed: Expected owner user_id to be updated to 3, got ${JSON.stringify(dbRes2.rows)}`);
  }
  console.log('✓ Test 2 DB verification passed: Token ownership successfully updated to User 3');

  // Clean up
  await dbClient.query('DELETE FROM user_push_tokens WHERE push_token = $1', [mockPushToken]);
  console.log('\nCleaned up mock token.');
  
  await dbClient.end();
  console.log('Verification successful!');
}

run().catch(async (err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
