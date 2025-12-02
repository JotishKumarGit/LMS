import sendEmail from '../config/mailer.js';

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Our LMS Platform!</h2>
      <p>Thank you for registering. Please verify your email address to activate your account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationLink}" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all;">${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        If you didn't create an account, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'Verify Your Email Address',
    html
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all;">${resetLink}</p>
      <p>This link will expire in 30 minutes.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        If you didn't request a password reset, please ignore this email.
      </p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'Password Reset Request',
    html
  });
};

export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome ${name}!</h2>
      <p>Your account has been successfully verified. You can now login and start learning.</p>
      <p>Explore our courses and begin your learning journey today!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.CLIENT_URL}/courses" 
           style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Browse Courses
        </a>
      </div>
      <p>Happy Learning!</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: 'Welcome to Our Learning Platform!',
    html
  });
};