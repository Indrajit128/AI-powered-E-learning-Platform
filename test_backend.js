const axios = require('axios');

async function testRegistration() {
    try {
        console.log('Testing Registration with Mock Fallback...');
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Node',
            email: 'node@test.com',
            password: 'Password123',
            role: 'faculty'
        });
        console.log('✅ Success! Data returned:', res.data.user);
    } catch (err) {
        console.error('❌ Failed! Error status:', err.response?.status);
        console.error('Error message:', err.response?.data || err.message);
    }
}

testRegistration();
