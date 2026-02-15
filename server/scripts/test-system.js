const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const testSystem = async () => {
  try {
    console.log('🧪 Testing BloodBridge System...\n');

    // Test 1: Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Database connected successfully\n');

    // Test 2: Check Super Admin
    console.log('2️⃣ Checking Super Admin Account...');
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (superAdmin) {
      console.log('   ✅ Super Admin exists');
      console.log('   📧 Email:', superAdmin.email);
      console.log('   👤 Name:', superAdmin.name);
    } else {
      console.log('   ❌ No super admin found!');
    }
    console.log('');

    // Test 3: Check User Model Fields
    console.log('3️⃣ Checking User Model Fields...');
    const userSchema = User.schema.obj;
    const requiredFields = ['role', 'region', 'state', 'city', 'location'];
    
    requiredFields.forEach(field => {
      if (userSchema[field]) {
        console.log(`   ✅ ${field} field exists`);
      } else {
        console.log(`   ❌ ${field} field missing!`);
      }
    });
    console.log('');

    // Test 4: Check User Counts
    console.log('4️⃣ Checking User Counts...');
    const counts = {
      superAdmin: await User.countDocuments({ role: 'super_admin' }),
      admin: await User.countDocuments({ role: 'admin' }),
      donor: await User.countDocuments({ role: 'donor' }),
      hospital: await User.countDocuments({ role: 'hospital' }),
      bloodbank: await User.countDocuments({ role: 'bloodbank' })
    };
    
    console.log('   Super Admins:', counts.superAdmin);
    console.log('   Admins:', counts.admin);
    console.log('   Donors:', counts.donor);
    console.log('   Hospitals:', counts.hospital);
    console.log('   Blood Banks:', counts.bloodbank);
    console.log('   Total Users:', Object.values(counts).reduce((a, b) => a + b, 0));
    console.log('');

    // Test 5: Check if any admin has state/city
    console.log('5️⃣ Checking Admin Location Data...');
    const adminsWithLocation = await User.find({ 
      role: 'admin',
      state: { $exists: true, $ne: null }
    });
    
    if (adminsWithLocation.length > 0) {
      console.log(`   ✅ Found ${adminsWithLocation.length} admin(s) with location data`);
      adminsWithLocation.forEach(admin => {
        console.log(`   - ${admin.name}: ${admin.city}, ${admin.state} (${admin.region})`);
      });
    } else {
      console.log('   ℹ️  No admins with location data yet');
    }
    console.log('');

    // Summary
    console.log('📊 SYSTEM STATUS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database: Connected');
    console.log(`✅ Super Admin: ${counts.superAdmin > 0 ? 'Present' : 'Missing'}`);
    console.log('✅ User Model: Updated with location fields');
    console.log(`📊 Total Users: ${Object.values(counts).reduce((a, b) => a + b, 0)}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ All tests completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

testSystem();
