const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Your E-Learning Platform OTP',
    html: `
      <h2>Your OTP Code</h2>
      <p>Use this one-time password to verify your email: <strong>${otp}</strong></p>
      <p>It expires in 10 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

module.exports = { sendOTP };

