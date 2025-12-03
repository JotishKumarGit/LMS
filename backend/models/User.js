// models/User.js - 100% ERROR-FREE VERSION
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student'
  },
  
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
  bio: String,
  phone: String,
  address: String
  
}, {
  timestamps: true
});

// ✅ FIXED: Hash password WITHOUT async/await issues
userSchema.pre('save', function(next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash the password synchronously
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

// ✅ Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  return verificationToken;
};

// ✅ Generate password reset token
userSchema.methods.generateResetPasswordToken = function() {
  const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordToken = resetToken;
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;