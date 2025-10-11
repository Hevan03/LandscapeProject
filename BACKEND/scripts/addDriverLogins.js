const mongoose = require('mongoose');
const Driver = require('../Models/driverModel');

// Connect to MongoDB
mongoose.connect("mongodb+srv://admin:yZMUHC5xRGVRiEQd@cluster0.vvw6xvv.mongodb.net/MernStackProject")
  .then(() => {
    console.log("Connected to MongoDB");
    addDriverLogins();
  })
  .catch((err) => console.error("MongoDB connection error:", err));

async function addDriverLogins() {
  try {
    // Get all drivers without login credentials
    const drivers = await Driver.find({ 
      $or: [
        { username: { $exists: false } },
        { username: null }
      ]
    });

    console.log(`Found ${drivers.length} drivers without login credentials`);

    for (let i = 0; i < drivers.length; i++) {
      const driver = drivers[i];
      
      // Create username from driver name (lowercase, replace spaces with underscores)
      const username = driver.name.toLowerCase().replace(/\s+/g, '_') + '_' + (i + 1);
      const password = 'driver123'; // Default password for all drivers
      
      // Update driver with login credentials
      await Driver.findByIdAndUpdate(driver._id, {
        username: username,
        password: password
      });
      
      console.log(`Added login for ${driver.name}: ${username} / ${password}`);
    }

    console.log('All drivers now have login credentials!');
    console.log('\nDefault login credentials for all drivers:');
    console.log('Username: [driver_name]_[number]');
    console.log('Password: driver123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding driver logins:', error);
    process.exit(1);
  }
}
