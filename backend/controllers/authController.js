// controllers/authController.js - COMPLETE FIXED VERSION
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/createToken.js';
import {sendVerificationEmail,sendPasswordResetEmail,sendWelcomeEmail} from '../services/emailService.js';

// Helper functions (REPLACE model methods)
const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user with email verification
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    debugger;
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
 
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // ✅ Hash password MANUALLY (NO middleware)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Generate verification token using helper
    const verificationToken = generateVerificationToken();
    const verificationExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // ✅ Already hashed
      role: role || 'student',
      emailVerificationToken: verificationToken,
      emailVerificationExpire: verificationExpiry
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    // Handle duplicate email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
};

// @desc    Verify email with token
// @route   POST /api/v1/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;

    // Find user by email and token
    const user = await User.findOne({
      email,
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during email verification'
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // ✅ Generate new verification token using helper
    const verificationToken = generateVerificationToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while resending verification'
    });
  }
};

// @desc    Login user (only if email verified)
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // ✅ Compare password MANUALLY (NO model method)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: 'Please verify your email before logging in'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('\n🔍 FORGOT PASSWORD DEBUG:');
    console.log('Email received:', email);

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('User not found - returning security message');
      return res.json({
        success: true,
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    console.log('Generated Token:', resetToken);
    console.log('Expiry Time:', new Date(resetExpiry).toISOString());

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetExpiry;
    await user.save();
    
    console.log('Token saved to database');
    
    // Check if token actually saved
    const updatedUser = await User.findOne({ email });
    console.log('Stored Token:', updatedUser.resetPasswordToken);
    console.log('Stored Expiry:', updatedUser.resetPasswordExpire);

    // Send reset email
    console.log('Attempting to send email...');
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset'
    });
  }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    console.log('\n🔍 RESET PASSWORD DEBUG:');
    console.log('Email:', email);
    console.log('Token received:', token);
    console.log('Current time:', Date.now());
    console.log('Current time (ISO):', new Date().toISOString());

    // First find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    console.log('User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    console.log('User resetToken:', user.resetPasswordToken);
    console.log('User resetExpire:', user.resetPasswordExpire);
    console.log('Is token expired?', user.resetPasswordExpire < Date.now());
    console.log('Token matches?', user.resetPasswordToken === token);

    // Check token and expiry
    if (!user.resetPasswordToken || 
        !user.resetPasswordExpire || 
        user.resetPasswordToken !== token || 
        user.resetPasswordExpire < Date.now()) {
      
      console.log('❌ Token validation failed:');
      console.log('   - Has token?', !!user.resetPasswordToken);
      console.log('   - Has expiry?', !!user.resetPasswordExpire);
      console.log('   - Token match?', user.resetPasswordToken === token);
      console.log('   - Not expired?', user.resetPasswordExpire >= Date.now());
      
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    console.log('✅ Token validation passed');
    console.log('Hashing new password...');

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    console.log('✅ Password reset successful');
    console.log('New password saved');

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password reset'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        bio: user.bio,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, phone, address } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};


// controllers/authController.js - ADD THESE FUNCTIONS AT THE BOTTOM

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current password, new password and confirmation'
      });
    }
    
    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password and confirmation do not match'
      });
    }
    
    // Check if new password is different from current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }
    
    // Password strength validation
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();
    await user.save();
    
    // Optionally: Invalidate all existing tokens (for security)
    // user.refreshTokens = [];
    // await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password change'
    });
  }
};

// @desc    Logout user (invalidate token on client side)
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // For JWT tokens (stateless), we just clear client-side token
    // If you want server-side token invalidation, implement token blacklist
    
    // Optional: Clear refresh tokens if you're using them
    // const user = await User.findById(req.user.id);
    // user.refreshTokens = [];
    // await user.save();
    
    // Clear token cookie if using cookies
    res.clearCookie('token');
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
};

// @desc    Get user sessions (if implementing session management)
// @route   GET /api/v1/auth/sessions
// @access  Private
export const getSessions = async (req, res) => {
  try {
    // This is optional - if you want to track active sessions
    const user = await User.findById(req.user.id).select('lastLogin loginHistory');
    
    res.json({
      success: true,
      sessions: user.loginHistory || [],
      lastLogin: user.lastLogin
    });
    
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Terminate all sessions (logout from all devices)
// @route   POST /api/v1/auth/terminate-all-sessions
// @access  Private
export const terminateAllSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Update last password change to invalidate all existing tokens
    user.passwordChangedAt = Date.now();
    
    // Clear refresh tokens if using
    // user.refreshTokens = [];
    
    // Update login history
    if (!user.loginHistory) user.loginHistory = [];
    user.loginHistory.push({
      action: 'all_sessions_terminated',
      timestamp: new Date(),
      ip: req.ip
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'All sessions terminated. Please login again.'
    });
    
  } catch (error) {
    console.error('Terminate sessions error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

