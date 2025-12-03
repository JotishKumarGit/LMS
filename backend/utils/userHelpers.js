// utils/userHelpers.js - ALL HELPER FUNCTIONS
import bcrypt from 'bcryptjs';

// ✅ Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// ✅ Compare password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// ✅ Generate verification token
export const generateVerificationToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Generate reset token
export const generateResetToken = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ✅ Generate verification expiry
export const getVerificationExpiry = () => {
  return Date.now() + 24 * 60 * 60 * 1000; // 24 hours
};

// ✅ Generate reset expiry
export const getResetExpiry = () => {
  return Date.now() + 30 * 60 * 1000; // 30 minutes
};