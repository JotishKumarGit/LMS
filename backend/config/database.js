import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Add connection options for MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s
      socketTimeoutMS: 45000, // Close sockets after 45s
    });
    
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    
    // More detailed error info
    if (error.name === 'MongooseServerSelectionError') {
      console.log('🔍 Check:');
      console.log('1. Is MongoDB Atlas cluster running?');
      console.log('2. Is IP whitelisted in Atlas?');
      console.log('3. Is password correct?');
    }
    
    process.exit(1);
  }
};

export default connectDB;