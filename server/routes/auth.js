const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db');
const { sendOTP } = require('../services/emailService');
require('dotenv').config();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to email for verification/register
router.post('/send-otp', async (req, res) => {
  const { email, action } = req.body; // action: 'register' or 'login'
  if (!email) return res.status(400).json({ msg: 'Email required' });

  if (!email.toLowerCase().endsWith('@gmail.com')) {
    return res.status(400).json({ msg: 'Only @gmail.com allowed' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await db.query(
      'INSERT INTO users (email, otp, otp_expires) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET otp = $2, otp_expires = $3',
      [email, otp, expiry]
    );

    await sendOTP(email, otp);

    res.json({ msg: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ msg: 'OTP send failed' });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete register/login
router.post('/verify-otp', async (req, res) => {
  const { email, otp, name, password, role } = req.body;

  try {
    const user = await db.query(
      'SELECT * FROM users WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
      [email, otp]
    );

    if (user.rows.length === 0) return res.status(400).json({ msg: 'Invalid or expired OTP' });

    if (role) { // Register
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await db.query(
        'UPDATE users SET name = $1, password_hash = $2, role = $3, is_verified = true, otp = null WHERE email = $4 RETURNING id, name, email, role',
        [name, passwordHash, role, email]
      );

      const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: newUser.rows[0] });
    } else { // Login
      const fullUser = await db.query('SELECT id, name, email, role, password_hash FROM users WHERE email = $1', [email]);
      const isMatch = await bcrypt.compare(password, fullUser.rows[0].password_hash);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid password' });

      await db.query('UPDATE users SET otp = null WHERE email = $1', [email]);
      const token = jwt.sign({ id: fullUser.rows[0].id, role: fullUser.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, user: fullUser.rows[0] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Verification failed' });
  }
});

// Note: Update schema for OTP fields if needed


// @route   POST /api/auth/login
// @desc    Login a user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: 'Please enter all fields' });

    try {
        if (!email.toLowerCase().endsWith('@gmail.com')) {
            return res.status(400).json({ msg: 'Only @gmail.com accounts are allowed' });
        }
        
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email,
                role: user.rows[0].role
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
