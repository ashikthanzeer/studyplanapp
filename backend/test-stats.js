const jwt = require('jsonwebtoken');

const secret = 'your_jwt_secret_key_change_in_production';
const localURL = 'http://localhost:3000/api';

async function testStats(userId, email) {
  console.log(`\n===================================`);
  console.log(`Testing Stats for User ID: ${userId} (${email})`);
  console.log(`===================================`);
  
  const payload = {
    id: userId,
    email: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
  };
  const token = jwt.sign(payload, secret);
  
  try {
    const res = await fetch(`${localURL}/pomodoro/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Stats Status:', res.status);
    const data = await res.json();
    console.log('Stats Data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Test error:', error);
  }
}

async function run() {
  await testStats(1, 'ashikthanzeer6@outlook.com');
  await testStats(3, 'devanarayananab781@gmail.com');
}

run().catch(console.error);
