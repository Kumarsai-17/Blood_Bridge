require('dotenv').config();
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

async function deleteCityHospitalRequest() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    console.log('🔍 Finding City Hospital request...');
    
    const request = await BloodRequest.findById('6942ef6c1a8afd4fb3f437ea')
      .populate('hospital', 'name');

    if (request) {
      console.log(`\n🏥 Found: ${request.hospital.name}`);
      console.log(`   Blood Type: ${request.bloodGroup}`);
      console.log(`   Units: ${request.units}`);
      console.log(`   Urgency: ${request.urgency}`);
      
      await BloodRequest.findByIdAndDelete('6942ef6c1a8afd4fb3f437ea');
      console.log('\n✅ City Hospital request deleted successfully');
    } else {
      console.log('❌ Request not found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

deleteCityHospitalRequest();
