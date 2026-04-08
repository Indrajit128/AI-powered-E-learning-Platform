const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for port 465, false for others (like 587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false
  }
});

const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"EduERP Platform" <${process.env.SMTP_USER}>`,  // Platform name instead of raw email
    to: email,
    subject: '🔐 Your EduERP Verification Code',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 800;">🎓 EduERP Platform</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">AI-Powered E-Learning & ERP System</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #1e293b; margin: 0 0 16px 0;">Email Verification</h2>
          <p style="color: #64748b; margin: 0 0 24px 0;">Enter the code below to verify your account. This code expires in <strong>30 minutes</strong>.</p>
          <div style="background: #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="color: white; font-size: 40px; font-weight: 900; letter-spacing: 12px;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">If you didn't request this, please ignore this email. Never share your OTP with anyone.</p>
        </div>
        <div style="background: #f1f5f9; padding: 16px 32px; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">© 2026 EduERP Platform. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    // If using placeholder credentials, mock the email sending
    if (process.env.SMTP_USER === 'your_email@gmail.com' || !process.env.SMTP_USER) {
      console.log(`⚠️ Mock Mode: By-passing email send.`);
      console.log(`✅ MOCK OTP for ${email}: ${otp}`);
      return;
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (err) {
    console.error('❌ Email send error:', err);
    throw err;
  }
};

module.exports = { sendOTP };
