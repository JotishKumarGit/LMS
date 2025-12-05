// models/User.js - ONLY SCHEMA, NO LOGIC
import mongoose from 'mongoose';

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
  
 resetPasswordToken: {
    type: String,
    default: null
  },
  
  resetPasswordExpire: {
    type: Date,
    default: null
  },
  
  bio: String,
  phone: String,
  address: String
  
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;