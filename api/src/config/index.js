const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = {
  // Server Configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/kpi-management-api',
    testUri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/kpi-management-api-test',
  },
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
  
  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  },
};

module.exports = config;
