const mongoose = require('mongoose');
const config = require('./index');

// Function to create default roles
const createDefaultRoles = async () => {
  try {
    const { Role } = require('../models');
    
    // Check if roles already exist
    const existingRoles = await Role.countDocuments();
    if (existingRoles > 0) {
      console.log('Default roles already exist, skipping...');
      return;
    }

    // Create default roles
    const defaultRoles = [
      { id: 1, name: 'user' },
      { id: 2, name: 'admin' }
    ];

    const createdRoles = await Role.insertMany(defaultRoles);
    console.log('✅ Default roles created:', createdRoles.map(r => r.name));

  } catch (error) {
    console.error('❌ Error creating default roles:', error);
  }
};

// Function to create default categories
const createDefaultCategories = async () => {
  try {
    const { Category } = require('../models');
    
    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories > 0) {
      console.log('Default categories already exist, skipping...');
      return;
    }

    // Create default categories
    const defaultCategories = [
      {
        id:1,
        name: 'Sales & Marketing',
        description: 'KPIs related to sales performance, marketing campaigns, and customer acquisition'
      },
      {
        id:2,
        name: 'Operations',
        description: 'KPIs for operational efficiency, process improvement, and resource utilization'
      },
      {
        id:3,
        name: 'Finance',
        description: 'Financial KPIs including revenue, costs, profitability, and budget performance'
      },
      {
        id:4,
        name: 'Human Resources',
        description: 'HR KPIs covering employee performance, retention, training, and satisfaction'
      },
      {
        id:5,
        name: 'Customer Service',
        description: 'Customer satisfaction, support metrics, and service quality indicators'
      },
      {
        id:6,
        name: 'Technology',
        description: 'IT performance, system uptime, development metrics, and digital transformation'
      },
      {
        id:7,
        name: 'Quality & Compliance',
        description: 'Quality control, compliance metrics, and regulatory adherence'
      },
      {
        id:8,
        name: 'Innovation & R&D',
        description: 'Research and development progress, innovation metrics, and product development'
      }
    ];

    const createdCategories = await Category.insertMany(defaultCategories);
    console.log('✅ Default categories created:', createdCategories.map(c => `${c.name} (ID: ${c.id})`));

  } catch (error) {
    console.error('❌ Error creating default categories:', error);
  }
};

// Function to create default users
const createDefaultUsers = async () => {
  try {
    const { User, Role } = require('../models');
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Default users already exist, skipping...');
      return;
    }

    // Get roles
    const adminRole = await Role.findOne({ name: 'admin' });
    const userRole = await Role.findOne({ name: 'user' });

    if (!adminRole || !userRole) {
      console.log('Roles not found, skipping user creation...');
      return;
    }

    // Create default users
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        password_hash: '$2a$12$GVGfD/qa5HhdC.epzysAhuDJfaKqkdl2Hr4HtGqttg3XcvX2MaFbe', // password: admin123
        role_id: adminRole._id,
      }
    ];

    const createdUsers = await User.insertMany(defaultUsers);
    console.log('✅ Default users created:', createdUsers.map(u => `${u.username} (${u.email})`));
 
  } catch (error) {
    console.error('❌ Error creating default users:', error); 
  }
};

const connectDB = async () => {
  try {
    const mongoURI = config.nodeEnv === 'test' ? config.mongodb.testUri : config.mongodb.uri;
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create default roles if they don't exist
    await createDefaultRoles();
    
    // Create default categories if they don't exist
    await createDefaultCategories();
    
    // Create default users if they don't exist
    await createDefaultUsers();
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
