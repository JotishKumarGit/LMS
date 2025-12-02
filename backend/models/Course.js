import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter course title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  
  subtitle: {
    type: String,
    maxlength: [300, 'Subtitle cannot exceed 300 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Please enter course description']
  },
  
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['web-development', 'mobile-development', 'data-science', 'design', 'business', 'marketing', 'music', 'photography']
  },
  
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'beginner'
  },
  
  thumbnail: {
    type: String,
    required: [true, 'Please upload course thumbnail']
  },
  
  promoVideo: String,
  
  price: {
    type: Number,
    required: [true, 'Please enter course price'],
    min: [0, 'Price cannot be negative']
  },
  
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.price;
      },
      message: 'Discount price cannot be greater than original price'
    }
  },
  
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'INR', 'EUR', 'GBP']
  },
  
  duration: {
    type: Number, // in hours
    required: [true, 'Please enter course duration']
  },
  
  lecturesCount: {
    type: Number,
    default: 0
  },
  
  modules: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module'
  }],
  
  whatYouWillLearn: [{
    type: String,
    maxlength: [200, 'Learning point cannot exceed 200 characters']
  }],
  
  requirements: [String],
  
  targetAudience: [String],
  
  language: {
    type: String,
    default: 'English'
  },
  
  captions: [String],
  
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  studentsEnrolled: {
    type: Number,
    default: 0
  },
  
  isPublished: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isApproved: {
    type: Boolean,
    default: false
  },
  
  tags: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current price
courseSchema.virtual('currentPrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for discount percentage
courseSchema.virtual('discountPercentage').get(function() {
  if (!this.discountPrice || this.discountPrice === this.price) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Auto-update updatedAt
courseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);

export default Course;