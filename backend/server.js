const app = require('./app');
const connectDB = require('./config/database');
// const socketServer = require('./config/socket');
const dotenv  = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Start Server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Setup Socket.io
// socketServer(server);
