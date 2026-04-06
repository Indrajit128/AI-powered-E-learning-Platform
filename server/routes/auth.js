const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { sendOTP } = require('../services/emailService');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register user and send OTP
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (!email.toLowerCase().endsWith('@gmail.com')) {
        return res.status(400).json({ msg: 'Email format validation failed: Only @gmail.com allowed' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    try {
        // Check for duplicate email
        const userExists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ msg: 'Email already exists. Cannot register twice.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Insert User unverified
        await db.query(
            'INSERT INTO users (name, email, password_hash, role, email_verified, otp, otp_expires) VALUES ($1, $2, $3, $4, FALSE, $5, $6)',
            [name, email, passwordHash, role, otp, expiry]
        );

        // Send OTP email
        await sendOTP(email, otp);

        res.json({ msg: 'Registration successful. OTP sent to email.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error during registration' });
    }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP to allow login
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ msg: 'Email and OTP are required' });
    }

    try {
        const user = await db.query(
            'SELECT id, role FROM users WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
            [email, otp]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        const userId = user.rows[0].id;

        // Mark as verified
        await db.query('UPDATE users SET email_verified = true, otp = null WHERE id = $1', [userId]);

        const token = jwt.sign({ id: userId, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ msg: 'Email verified successfully', token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Verification failed' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user / Return JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: 'Please enter all fields' });

    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });

        const userData = user.rows[0];

        const isMatch = await bcrypt.compare(password, userData.password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!userData.email_verified) {
            return res.status(403).json({ msg: 'Please verify your email before login' });
        }

        const token = jwt.sign({ id: userData.id, role: userData.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                role: userData.role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
