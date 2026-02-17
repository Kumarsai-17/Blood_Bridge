const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('\n⚠️  Super admin already exists:');
      console.log(`   Name: ${existingSuperAdmin.name}`);
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log('\n❌ Cannot create duplicate super admin');
      process.exit(1);
    }

    // Super admin credentials
    const superAdminData = {
      name: 'Super Admin',
      email: 'superadmin@bloodbridge.com',
      phone: '+1-234-567-8900',
      password: 'SuperAdmin@123', // Secure password
      role: 'super_admin',
      region: null, // Super admin has no region restriction
      isApproved: true,
      emailVerified: true,
      mustChangePassword: false
      // No location field - super admin doesn't need location
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // Create super admin
    const superAdmin = new User({
      ...superAdminData,
      password: hashedPassword
    });

    await superAdmin.save();

    console.log('\n✅ Super Admin created successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email: ${superAdminData.email}`);
    console.log(`   Password: ${superAdminData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log(`\n🔗 Login at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();
