// Migration script to create User records for existing approved employees
import mongoose from 'mongoose';
import Employee_Service from './models/Employee_Service.js';
import User from './models/User.js';
import { hashPassword } from './utils/authAndNotify.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateEmployeesToUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all approved employees
    const approvedEmployees = await Employee_Service.find({ Employee_Status: 'Approve' });
    console.log(`Found ${approvedEmployees.length} approved employees`);

    let createdCount = 0;
    let existingCount = 0;

    for (const employee of approvedEmployees) {
      // Check if user already exists by service number
      const existingUser = await User.findOne({ serviceNum: employee.Service_Num.toString() });
      
      if (!existingUser) {
        // Map employee type to user role
        let userRole = 'employee';
        if (employee.Employee_Type === 'Driver') userRole = 'driver';
        else if (employee.Employee_Type === 'Landscaper') userRole = 'landscaper';
        
        // Generate unique username
        let baseUsername = employee.Employee_Name.toLowerCase().replace(/\s+/g, '_');
        let username = baseUsername;
        let counter = 1;
        
        // Check for username uniqueness
        while (await User.findOne({ username: username })) {
          username = `${baseUsername}_${counter}`;
          counter++;
        }
        
        // Create new user for rating system
        const newUser = new User({
          serviceNum: employee.Service_Num.toString(),
          username: username,
          phone: employee.Employee_Contact_Num,
          passwordHash: await hashPassword(employee.Employee_Password || 'default123'),
          role: userRole,
          status: 'active',
          rating: 0,
          ratingCount: 0
        });
        
        await newUser.save();
        console.log(`✅ Created user: ${newUser.username} (${employee.Employee_Name}) - Service: ${employee.Service_Num}`);
        createdCount++;
      } else {
        console.log(`⚠️  User already exists: ${existingUser.username} - Service: ${employee.Service_Num}`);
        existingCount++;
      }
    }

    console.log(`\nMigration completed:`);
    console.log(`- Created: ${createdCount} new users`);
    console.log(`- Existing: ${existingCount} users`);
    console.log(`- Total: ${createdCount + existingCount} users`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

migrateEmployeesToUsers();