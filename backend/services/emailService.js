import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Email templates
const emailTemplates = {
  verification: (name, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Welcome to LMS Platform, ${name}!</h2>
      <p>Thank you for registering. Please verify your email address by using the verification code below:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${token}</h1>
      </div>
      
      <p>This verification code will expire in 24 hours.</p>
      
      <p>If you didn't create an account, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        Best regards,<br>
        LMS Platform Team
      </p>
    </div>
  `,

  passwordReset: (name, token) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #2196F3;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>You requested to reset your password. Use the code below to reset your password:</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
        <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 5px;">${token}</h1>
      </div>
      
      <p>This reset code will expire in 30 minutes.</p>
      
      <p>If you didn't request a password reset, please ignore this email.</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        Best regards,<br>
        LMS Platform Team
      </p>
    </div>
  `,

  welcome: (name) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4CAF50;">Welcome to LMS Platform, ${name}!</h2>
      <p>Your email has been successfully verified. You can now login and start learning.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/login" 
           style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Login Now
        </a>
      </div>
      
      <p>Explore our wide range of courses and start your learning journey today!</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
      
      <p style="color: #666; font-size: 12px;">
        Happy Learning!<br>
        LMS Platform Team
      </p>
    </div>
  `
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"LMS Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};

// Specific email functions
export const sendVerificationEmail = async (email, name, token) => {
  const html = emailTemplates.verification(name, token);
  return await sendEmail(email, 'Verify Your Email Address', html);
};

export const sendPasswordResetEmail = async (email, name, token) => {
  const html = emailTemplates.passwordReset(name, token);
  return await sendEmail(email, 'Password Reset Request', html);
};

export const sendWelcomeEmail = async (email, name) => {
  const html = emailTemplates.welcome(name);
  return await sendEmail(email, 'Welcome to LMS Platform!', html);
};