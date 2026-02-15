const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const removeAllAdmins = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admins (both admin and super_admin)
    const admins = await User.find({ 
      role: { $in: ['admin', 'super_admin'] } 
    });

    console.log(`\n📊 Found ${admins.length} admin(s) in database:`);
    admins.forEach(admin => {
      console.log(`  - ${admin.name} (${admin.email}) - Role: ${admin.role}`);
    });

    if (admins.length === 0) {
      console.log('\n✅ No admins found in database');
      process.exit(0);
    }

    // Delete all admins
    const result = await User.deleteMany({ 
      role: { $in: ['admin', 'super_admin'] } 
    });

    console.log(`\n🗑️  Deleted ${result.deletedCount} admin(s) from database`);
    console.log('✅ All admins removed successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing admins:', error);
    process.exit(1);
  }
};

removeAllAdmins();
