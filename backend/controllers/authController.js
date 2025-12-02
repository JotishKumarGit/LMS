import User from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../utils/createToken.js';
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } from '../services/emailService.js';
import asyncHandler from 'express-async-handler';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student'
  });

  // Generate verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);

  // Generate JWT token
  const token = generateToken(user._id, user.role);

  // Set token in cookie
  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check for email and password
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Find user with password
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    res.status(401);
    throw new Error('Please verify your email before logging in');
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate token
  const token = generateToken(user._id, user.role);

  // Set token in cookie
  setTokenCookie(res, token);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isEmailVerified: user.isEmailVerified
    }
  });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification token');
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
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken();
  await user.save();

  // Send reset email
  await sendPasswordResetEmail(user.email, resetToken);

  res.json({
    success: true,
    message: 'Password reset email sent'
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.'
  });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('enrolledCourses.course', 'title thumbnail price')
    .populate('wishlist', 'title thumbnail price');
  
  res.json({
    success: true,
    user
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/auth/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, phone, address, socialLinks } = req.body;

  const user = await User.findById(req.user.id);

  if (name) user.name = name;
  if (bio) user.bio = bio;
  if (phone) user.phone = phone;
  if (address) user.address = address;
  if (socialLinks) user.socialLinks = socialLinks;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
});

// @desc    Change password
// @route   PUT /api/v1/auth/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  clearTokenCookie(res);
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});