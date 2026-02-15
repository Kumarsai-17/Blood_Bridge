const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const cleanupUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all users to be deleted
    const usersToDelete = await User.find({ 
      role: { $in: ['donor', 'hospital', 'bloodbank', 'admin'] } 
    });

    console.log(`\n📊 Found ${usersToDelete.length} user(s) to delete:`);
    
    // Group by role
    const byRole = {
      donor: 0,
      hospital: 0,
      bloodbank: 0,
      admin: 0
    };

    usersToDelete.forEach(user => {
      byRole[user.role]++;
    });

    console.log(`  - Donors: ${byRole.donor}`);
    console.log(`  - Hospitals: ${byRole.hospital}`);
    console.log(`  - Blood Banks: ${byRole.bloodbank}`);
    console.log(`  - Admins: ${byRole.admin}`);

    if (usersToDelete.length === 0) {
      console.log('\n✅ No users to delete');
      
      // Check super admin
      const superAdmin = await User.findOne({ role: 'super_admin' });
      if (superAdmin) {
        console.log('\n✅ Super Admin account exists:');
        console.log(`   Name: ${superAdmin.name}`);
        console.log(`   Email: ${superAdmin.email}`);
      } else {
        console.log('\n⚠️  No super admin found!');
      }
      
      process.exit(0);
    }

    // Delete all donors, hospitals, blood banks, and regular admins
    const result = await User.deleteMany({ 
      role: { $in: ['donor', 'hospital', 'bloodbank', 'admin'] } 
    });

    console.log(`\n🗑️  Deleted ${result.deletedCount} user(s) from database`);
    console.log('✅ Cleanup completed successfully');

    // Verify super admin still exists
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (superAdmin) {
      console.log('\n✅ Super Admin account preserved:');
      console.log(`   Name: ${superAdmin.name}`);
      console.log(`   Email: ${superAdmin.email}`);
    } else {
      console.log('\n⚠️  WARNING: No super admin found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupUsers();
