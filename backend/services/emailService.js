// COMPLETE WORKING emailService.js
import nodemailer from 'nodemailer';
import fs from 'fs';

console.log('📧 Email Service Starting...');

const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  user: 'jotishk649@gmail.com',
  pass: 'qfvpuhceqvelivwp'
};

console.log('📧 Using Gmail:', EMAIL_CONFIG.user);

// Create transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_CONFIG.host,
  port: EMAIL_CONFIG.port,
  secure: false,
  auth: {
    user: EMAIL_CONFIG.user,
    pass: EMAIL_CONFIG.pass
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection
transporter.verify()
  .then(() => console.log('✅ Gmail connected successfully!'))
  .catch(err => console.error('❌ Gmail connection failed:', err.message));

// Email templates
const emailTemplates = {
  verification: (name, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">Welcome ${name}!</h2>
      <p>Your verification code:</p>
      <h1 style="color: #4CAF50; font-size: 32px;">${token}</h1>
      <p>This code expires in 24 hours.</p>
    </div>
  `,
  
  passwordReset: (name, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2196F3;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Use this code:</p>
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
        <h1 style="color: #2196F3; font-size: 36px; letter-spacing: 5px; margin: 0;">${token}</h1>
      </div>
      <p><strong>This code expires in 30 minutes.</strong></p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">LMS Platform Team</p>
    </div>
  `,
  
  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4CAF50;">Welcome to LMS Platform, ${name}!</h2>
      <p>Your email has been successfully verified.</p>
      <p>You can now login and start learning.</p>
    </div>
  `
};

// Helper function to send any email
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"LMS Platform" <${EMAIL_CONFIG.user}>`,
      to,
      subject,
      html
    });
    console.log(`✅ Email sent to ${to} - ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Email failed for ${to}:`, error.message);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (email, name, token) => {
  console.log(`\n📧 Sending verification to: ${email}`);
  console.log(`🔑 Token: ${token}`);
  
  const html = emailTemplates.verification(name, token);
  const success = await sendEmail(email, 'Verify Your Email', html);
  
  if (!success) {
    console.log('💡 Manual verification token:', token);
  }
  
  return success;
};

// Send password reset email - FIXED VERSION
export const sendPasswordResetEmail = async (email, name, token) => {
  console.log(`\n📧 Sending password reset to: ${email}`);
  console.log(`🔑 Reset Token: ${token}`);
  console.log(`⏰ Expires: 30 minutes from now`);
  
  const html = emailTemplates.passwordReset(name, token);
  const success = await sendEmail(email, 'Password Reset Request', html);
  
  if (!success) {
    console.log(`\n⚠️  Email sending failed!`);
    console.log(`📝 IMPORTANT: Save this token for testing:`);
    console.log(`   Email: ${email}`);
    console.log(`   Token: ${token}`);
    console.log(`   Expires: ${new Date(Date.now() + 30 * 60 * 1000).toISOString()}`);
    
    // Save to file for manual testing
    fs.appendFileSync(
      'password_reset.log',
      `[${new Date().toISOString()}] Email: ${email}, Token: ${token}\n`
    );
  }
  
  return success;
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  console.log(`\n📧 Sending welcome email to: ${email}`);
  
  const html = emailTemplates.welcome(name);
  return await sendEmail(email, 'Welcome to LMS Platform!', html);
};