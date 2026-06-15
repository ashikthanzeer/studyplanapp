const jwt = require('jsonwebtoken');

const secret = 'your_jwt_secret_key_change_in_production';
const localURL = 'http://localhost:3000/api';

async function testUser(userId, email) {
  console.log(`\n===================================`);
  console.log(`Testing User ID: ${userId} (${email})`);
  console.log(`===================================`);
  
  const payload = {
    id: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  };
  const token = jwt.sign(payload, secret);
  
  try {
    // 1. Start Pomodoro
    console.log('Starting Pomodoro session...');
    const startRes = await fetch(`${localURL}/pomodoro/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ duration_minutes: 25 })
    });
    
    console.log('Start Status:', startRes.status);
    const startData = await startRes.json();
    console.log('Start Data:', JSON.stringify(startData, null, 2));
    
    const sessionId = startData.session?.id;
    if (!sessionId) {
      console.log('Failed to start session, no ID returned.');
      return;
    }
    
    // 2. Complete Pomodoro
    console.log(`Completing Pomodoro session ${sessionId}...`);
    const compRes = await fetch(`${localURL}/pomodoro/${sessionId}/complete`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Complete Status:', compRes.status);
    const compData = await compRes.json();
    console.log('Complete Data:', JSON.stringify(compData, null, 2));
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

async function run() {
  await testUser(1, 'ashikthanzeer6@outlook.com');
  await testUser(3, 'devanarayananab781@gmail.com');
}

run().catch(console.error);
