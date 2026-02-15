const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const cleanupAllUsers = async () => {
  try {
    console.log('🧹 Starting cleanup process...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database\n');

    // Find super admin
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      console.log('❌ No super admin found! Cannot proceed.');
      process.exit(1);
    }

    console.log('✅ Super Admin found:');
    console.log('   Email:', superAdmin.email);
    console.log('   Name:', superAdmin.name);
    console.log('');

    // Count users before deletion
    const totalUsers = await User.countDocuments();
    const usersToDelete = await User.countDocuments({ 
      role: { $ne: 'super_admin' } 
    });

    console.log('📊 Current Status:');
    console.log('   Total Users:', totalUsers);
    console.log('   Users to Delete:', usersToDelete);
    console.log('   Super Admin (will keep):', 1);
    console.log('');

    if (usersToDelete === 0) {
      console.log('ℹ️  No users to delete. Only super admin exists.');
      process.exit(0);
    }

    // Get breakdown by role
    const admins = await User.countDocuments({ role: 'admin' });
    const donors = await User.countDocuments({ role: 'donor' });
    const hospitals = await User.countDocuments({ role: 'hospital' });
    const bloodbanks = await User.countDocuments({ role: 'bloodbank' });

    console.log('📋 Users to be deleted:');
    console.log('   Admins:', admins);
    console.log('   Donors:', donors);
    console.log('   Hospitals:', hospitals);
    console.log('   Blood Banks:', bloodbanks);
    console.log('');

    // Delete all users except super admin
    console.log('🗑️  Deleting users...');
    const result = await User.deleteMany({ 
      role: { $ne: 'super_admin' } 
    });

    console.log('✅ Deletion complete!');
    console.log('   Deleted:', result.deletedCount, 'users');
    console.log('');

    // Verify final count
    const remainingUsers = await User.countDocuments();
    console.log('📊 Final Status:');
    console.log('   Remaining Users:', remainingUsers);
    console.log('   Super Admin:', await User.countDocuments({ role: 'super_admin' }));
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CLEANUP SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Only super admin account remains in the database.');
    console.log('You can now create new users with updated location fields.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

cleanupAllUsers();
