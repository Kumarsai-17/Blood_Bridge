const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const DonorResponse = require('../models/DonorResponse');
const AuditLog = require('../models/AuditLog');

const cleanupAllData = async () => {
  try {
    console.log('🧹 Starting comprehensive cleanup process...\n');

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

    // Count all data before deletion
    const counts = {
      users: await User.countDocuments({ role: { $ne: 'super_admin' } }),
      bloodRequests: await BloodRequest.countDocuments(),
      bloodInventory: await BloodInventory.countDocuments(),
      donorResponses: await DonorResponse.countDocuments(),
      auditLogs: await AuditLog.countDocuments()
    };

    console.log('📊 Current Data:');
    console.log('   Users (excluding super admin):', counts.users);
    console.log('   Blood Requests:', counts.bloodRequests);
    console.log('   Blood Inventory:', counts.bloodInventory);
    console.log('   Donor Responses:', counts.donorResponses);
    console.log('   Audit Logs:', counts.auditLogs);
    console.log('');

    if (counts.users === 0 && counts.bloodRequests === 0 && counts.bloodInventory === 0 && counts.donorResponses === 0) {
      console.log('ℹ️  No data to delete. Database is already clean.');
      process.exit(0);
    }

    // Delete all data except super admin
    console.log('🗑️  Deleting all data...\n');

    const results = {
      users: await User.deleteMany({ role: { $ne: 'super_admin' } }),
      bloodRequests: await BloodRequest.deleteMany({}),
      bloodInventory: await BloodInventory.deleteMany({}),
      donorResponses: await DonorResponse.deleteMany({}),
      auditLogs: await AuditLog.deleteMany({})
    };

    console.log('✅ Deletion complete!');
    console.log('   Users deleted:', results.users.deletedCount);
    console.log('   Blood Requests deleted:', results.bloodRequests.deletedCount);
    console.log('   Blood Inventory deleted:', results.bloodInventory.deletedCount);
    console.log('   Donor Responses deleted:', results.donorResponses.deletedCount);
    console.log('   Audit Logs deleted:', results.auditLogs.deletedCount);
    console.log('');

    // Verify final counts
    const finalCounts = {
      users: await User.countDocuments(),
      bloodRequests: await BloodRequest.countDocuments(),
      bloodInventory: await BloodInventory.countDocuments(),
      donorResponses: await DonorResponse.countDocuments(),
      auditLogs: await AuditLog.countDocuments()
    };

    console.log('📊 Final Status:');
    console.log('   Total Users:', finalCounts.users, '(1 super admin)');
    console.log('   Blood Requests:', finalCounts.bloodRequests);
    console.log('   Blood Inventory:', finalCounts.bloodInventory);
    console.log('   Donor Responses:', finalCounts.donorResponses);
    console.log('   Audit Logs:', finalCounts.auditLogs);
    console.log('');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ CLEANUP SUCCESSFUL!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('All data has been reset. Only super admin account remains.');
    console.log('All statistics should now show 0.');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

cleanupAllData();
