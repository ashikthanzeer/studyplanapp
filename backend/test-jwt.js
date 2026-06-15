const jwt = require('jsonwebtoken');

const secret = 'your_jwt_secret_key_change_in_production';
const payload = {
  id: 1,
  email: 'ashikthanzeer6@outlook.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60
};

const token = jwt.sign(payload, secret);
console.log('Forged Token:', token);

async function test() {
  const res = await fetch('https://study-planner-api-khxb.onrender.com/api/auth/profile', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Profile:', JSON.stringify(data, null, 2));
}

test().catch(console.error);
