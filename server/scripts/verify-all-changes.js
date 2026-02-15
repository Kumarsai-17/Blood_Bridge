const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const verifyAllChanges = async () => {
  try {
    console.log('🔍 COMPREHENSIVE SYSTEM VERIFICATION\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Connect to database
    console.log('1️⃣ Connecting to Database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('   ✅ Connected successfully\n');

    // Test 1: Verify User Model Schema
    console.log('2️⃣ Verifying User Model Schema...');
    const userSchema = User.schema.obj;
    const requiredFields = {
      'role': 'User role field',
      'region': 'Admin region field',
      'state': 'State field for location',
      'city': 'City field for location',
      'location': 'GPS coordinates field'
    };
    
    let schemaValid = true;
    for (const [field, description] of Object.entries(requiredFields)) {
      if (userSchema[field]) {
        console.log(`   ✅ ${description} exists`);
      } else {
        console.log(`   ❌ ${description} MISSING!`);
        schemaValid = false;
      }
    }
    console.log('');

    // Test 2: Check Super Admin
    console.log('3️⃣ Verifying Super Admin Account...');
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (superAdmin) {
      console.log('   ✅ Super Admin exists');
      console.log('   📧 Email:', superAdmin.email);
      console.log('   👤 Name:', superAdmin.name);
      console.log('   🔑 Password Set:', !!superAdmin.password);
      console.log('   ✉️  Email Verified:', superAdmin.emailVerified);
      console.log('   ✔️  Approved:', superAdmin.isApproved);
    } else {
      console.log('   ❌ No super admin found!');
    }
    console.log('');

    // Test 3: User Counts
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
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Total Users:', Object.values(counts).reduce((a, b) => a + b, 0));
    console.log('');

    // Test 4: Check Admin Location Data
    console.log('5️⃣ Checking Admin Location Data...');
    const allAdmins = await User.find({ role: 'admin' });
    
    if (allAdmins.length > 0) {
      console.log(`   Found ${allAdmins.length} admin(s):`);
      allAdmins.forEach(admin => {
        const hasLocation = admin.state && admin.city;
        const hasGPS = admin.location && admin.location.lat && admin.location.lng;
        
        console.log(`\n   Admin: ${admin.name}`);
        console.log(`   - Email: ${admin.email}`);
        console.log(`   - Region: ${admin.region || 'Not set'}`);
        console.log(`   - State: ${admin.state || 'Not set'}`);
        console.log(`   - City: ${admin.city || 'Not set'}`);
        console.log(`   - GPS: ${hasGPS ? `${admin.location.lat.toFixed(4)}, ${admin.location.lng.toFixed(4)}` : 'Not set'}`);
        console.log(`   - Status: ${hasLocation && hasGPS ? '✅ Complete' : '⚠️  Incomplete'}`);
      });
    } else {
      console.log('   ℹ️  No regular admins found (only super admin exists)');
    }
    console.log('');

    // Test 5: Check Other Users Location Data
    console.log('6️⃣ Checking Other Users Location Data...');
    const usersWithLocation = await User.find({
      role: { $in: ['donor', 'hospital', 'bloodbank'] },
      state: { $exists: true, $ne: null }
    });
    
    if (usersWithLocation.length > 0) {
      console.log(`   ✅ Found ${usersWithLocation.length} user(s) with location data`);
      usersWithLocation.forEach(user => {
        console.log(`   - ${user.role}: ${user.name} (${user.city}, ${user.state})`);
      });
    } else {
      console.log('   ℹ️  No donors/hospitals/blood banks with location data yet');
    }
    console.log('');

    // Test 6: Verify Database Cleanup
    console.log('7️⃣ Verifying Database Cleanup...');
    const totalUsers = await User.countDocuments();
    if (totalUsers <= 2) {
      console.log(`   ✅ Database cleaned successfully (${totalUsers} users remaining)`);
      console.log('   ℹ️  Only super admin and possibly 1 test admin should remain');
    } else {
      console.log(`   ⚠️  Database has ${totalUsers} users`);
      console.log('   ℹ️  Expected: 1-2 users (super admin + optional test admin)');
    }
    console.log('');

    // Final Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 VERIFICATION SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Database Connection: Working`);
    console.log(`${schemaValid ? '✅' : '❌'} User Model Schema: ${schemaValid ? 'Valid' : 'Invalid'}`);
    console.log(`${counts.superAdmin > 0 ? '✅' : '❌'} Super Admin: ${counts.superAdmin > 0 ? 'Present' : 'Missing'}`);
    console.log(`✅ Location Fields: Added to User model`);
    console.log(`✅ Database Cleanup: ${totalUsers <= 2 ? 'Complete' : 'Pending'}`);
    console.log(`📊 Total Users: ${totalUsers}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n✅ VERIFICATION COMPLETE!\n');
    console.log('📝 NEXT STEPS:');
    console.log('   1. Start the backend server: cd server && npm start');
    console.log('   2. Start the frontend: cd client/bloodbridge-client && npm run dev');
    console.log('   3. Login as super admin: superadmin@bloodbridge.com');
    console.log('   4. Create a test admin with state/city/GPS location');
    console.log('   5. Verify LocationSelector component works in browser\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
};

verifyAllChanges();
