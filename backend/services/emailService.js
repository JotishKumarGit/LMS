// services/emailService.js - WORKING VERSION
import nodemailer from 'nodemailer';

// FORCE LOAD ENV VARIABLES
console.log('📧 Email Service Starting...');

// Your actual credentials (temporarily hardcode for testing)
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

// Test connection on startup
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
  `
};

// Send email
export const sendVerificationEmail = async (email, name, token) => {
  try {
    console.log(`📧 Sending verification to: ${email}`);
    
    const info = await transporter.sendMail({
      from: `"LMS Platform" <${EMAIL_CONFIG.user}>`,
      to: email,
      subject: 'Verify Your Email',
      html: emailTemplates.verification(name, token)
    });
    
    console.log('✅ Email sent successfully! ID:', info.messageId);
    return true;
    
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.log('📧 Token for manual verification:', token);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, name, token) => {
  console.log(`📧 Password reset for ${email}: ${token}`);
  return true;
};

export const sendWelcomeEmail = async (email, name) => {
  console.log(`📧 Welcome ${name}!`);
  return true;
};