const { Pool } = require('pg');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: __dirname + '/.env' });

const test = async () => {
    console.log('--- Testing Database Connection ---');
    console.log('URL:', process.env.DATABASE_URL.replace(/:[^@:]+@/, ':****@')); // Hide password
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
    });

    try {
        const res = await pool.query('SELECT NOW()');
        console.log('✅ DB Connected:', res.rows[0].now);
        
        console.log('\n--- Testing Users Table Schema ---');
        const schemaRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.table(schemaRes.rows);
        
    } catch (err) {
        console.error('❌ DB Error:', err.message);
    }

    console.log('\n--- Testing SMTP Connection ---');
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection verified');
        
        console.log('Sending test email to:', process.env.SMTP_USER);
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            subject: 'OTP Test',
            text: 'If you see this, SMTP is working!',
        });
        console.log('✅ Test email sent successfully');
    } catch (err) {
        console.error('❌ SMTP Error:', err.message);
    }

    process.exit();
};

test();
