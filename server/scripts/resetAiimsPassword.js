const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function resetAiimsPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'info@aiims.edu';
    const newPassword = 'aiims123';

    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found with email:', email);
      process.exit(1);
      return;
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.emailVerified = true; // Set email as verified
    user.isApproved = true; // Ensure approved
    await user.save();

    console.log('✅ Password reset successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 New Password:', newPassword);
    console.log('👤 Role:', user.role);
    console.log('✓ Email Verified:', user.emailVerified);
    console.log('✓ Approved:', user.isApproved);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAiimsPassword();
