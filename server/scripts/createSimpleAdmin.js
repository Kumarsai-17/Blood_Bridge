const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function createSimpleAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if simple admin already exists
    const existing = await User.findOne({ email: 'admin@bloodbridge.com' });
    if (existing) {
      console.log('ℹ️ Simple admin already exists');
      console.log('Email: admin@bloodbridge.com');
      console.log('Password: admin123');
      process.exit(0);
      return;
    }

    // Create simple admin
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@bloodbridge.com',
      phone: '1234567890',
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      emailVerified: true,
      mustChangePassword: false,
      location: { lat: null, lng: null }
    });

    console.log('✅ Created simple admin:');
    console.log('Email: admin@bloodbridge.com');
    console.log('Password: admin123');
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createSimpleAdmin();