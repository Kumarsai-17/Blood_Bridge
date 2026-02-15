const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function resetSuperAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing super admin
    await User.deleteOne({ role: 'super_admin' });
    console.log('🗑️ Deleted existing super admin');

    // Create new super admin with fresh password
    const password = 'SuperAdmin@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'superadmin@bloodbridge.com',
      phone: '0000000000',
      password: hashedPassword,
      role: 'super_admin',
      isApproved: true,
      emailVerified: true,
      mustChangePassword: false,
      location: { lat: null, lng: null }
    });

    console.log('✅ Created new super admin:');
    console.log('Email:', superAdmin.email);
    console.log('Password:', password);
    console.log('Role:', superAdmin.role);

    // Test the password immediately
    const testMatch = await bcrypt.compare(password, superAdmin.password);
    console.log('🧪 Password test:', testMatch ? '✅ MATCH' : '❌ NO MATCH');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetSuperAdmin();