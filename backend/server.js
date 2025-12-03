import app from './app.js';
import connectDB from './config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5001;


// Wrapper function for async/await
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api/v1`);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.log(`❌ Unhandled Rejection: ${err.message}`);
      console.log('Shutting down server...');
      server.close(() => {
        process.exit(1);
      });
    });
    
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();