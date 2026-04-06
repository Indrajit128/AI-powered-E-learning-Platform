const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db/db');
const { sendOTP } = require('../services/emailService');
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register user and send OTP
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }

    try {
        // Check for duplicate email and verification status
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('id, email_verified')
            .eq('email', email)
            .maybeSingle();

        if (fetchError) {
            console.error('DB fetch error:', fetchError);
            return res.status(500).json({ msg: 'Database error checking account status' });
        }

        if (existingUser && existingUser.email_verified) {
            return res.status(400).json({ msg: 'Email already exists and is verified. Please login.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        let result;
        if (existingUser) {
            // Update unverified user
            result = await supabase
                .from('users')
                .update({
                    name,
                    password_hash: passwordHash,
                    role,
                    otp,
                    otp_expires: expiry,
                    email_verified: false // ensure it stays false
                })
                .eq('email', email);
        } else {
            // Insert new user
            result = await supabase
                .from('users')
                .insert([{
                    name,
                    email,
                    password_hash: passwordHash,
                    role,
                    email_verified: false,
                    otp,
                    otp_expires: expiry
                }]);
        }

        if (result.error) {
            console.error('DB save error:', result.error);
            return res.status(500).json({ msg: `Database error: ${result.error.message}` });
        }

        // Send OTP email
        await sendOTP(email, otp);

        res.json({ msg: 'Registration successful. OTP sent to email.' });
    } catch (err) {
        console.error('Register error:', err);
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
        const { data: user, error } = await supabase
            .from('users')
            .select('id, role, otp_expires')
            .eq('email', email)
            .eq('otp', otp)
            .maybeSingle();

        if (error || !user) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // Check OTP expiry (Use numeric comparison for robustness against timezone drift)
        // If Supabase returns a string without Z, we treat it as UTC to match how we sent it
        let expiryStr = user.otp_expires;
        if (expiryStr && !expiryStr.endsWith('Z') && !expiryStr.includes('+')) {
            expiryStr += 'Z';
        }
        
        const expiryDate = new Date(expiryStr);
        const now = new Date();
        
        if (isNaN(expiryDate.getTime()) || expiryDate < now) {
            return res.status(400).json({ msg: 'OTP has expired. Please try registering again or resend the code.' });
        }

        // Mark as verified
        const { error: updateError } = await supabase
            .from('users')
            .update({ email_verified: true, otp: null, otp_expires: null })
            .eq('id', user.id);

        if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ msg: 'Failed to verify email' });
        }

        // fetch full user for response
        const { data: fullUser } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', user.id)
            .single();

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ msg: 'Email verified successfully', token, user: fullUser });
    } catch (err) {
        console.error('OTP verify error:', err);
        res.status(500).json({ msg: 'Verification failed' });
    }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to existing unverified user
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: 'Email is required' });

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email_verified')
            .eq('email', email)
            .maybeSingle();

        if (!user) return res.status(404).json({ msg: 'No account found with this email' });
        if (user.email_verified) return res.status(400).json({ msg: 'Email already verified. Please login.' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 30 * 60 * 1000);

        await supabase.from('users').update({ otp, otp_expires: expiry }).eq('email', email);
        await sendOTP(email, otp);

        res.json({ msg: 'New OTP sent to your email' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ msg: 'Failed to resend OTP' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user / Return JWT
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ msg: 'Please enter all fields' });

    try {
        const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle();

        if (error || !userData) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

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
        console.error('Login error:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
