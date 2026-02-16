require('dotenv').config();
const mongoose = require('mongoose');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User'); // Need to load User model for populate

async function removeDuplicateRequests() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected\n');

    console.log('🔍 Finding duplicate requests from same hospital...');
    
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('hospital', 'name')
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${requests.length} pending requests\n`);

    // Group by hospital
    const hospitalGroups = {};
    requests.forEach(req => {
      const hospitalId = req.hospital._id.toString();
      if (!hospitalGroups[hospitalId]) {
        hospitalGroups[hospitalId] = [];
      }
      hospitalGroups[hospitalId].push(req);
    });

    // Find duplicates
    let duplicatesRemoved = 0;
    for (const [hospitalId, reqs] of Object.entries(hospitalGroups)) {
      if (reqs.length > 1) {
        console.log(`\n🏥 Hospital: ${reqs[0].hospital.name}`);
        console.log(`   Found ${reqs.length} requests`);
        
        // Keep the most recent one, delete others
        const toKeep = reqs[0]; // Most recent (sorted by createdAt desc)
        const toDelete = reqs.slice(1);
        
        console.log(`   ✅ Keeping: ${toKeep._id} (${toKeep.bloodGroup}, ${toKeep.units} units, ${toKeep.urgency})`);
        
        for (const req of toDelete) {
          console.log(`   ❌ Deleting: ${req._id} (${req.bloodGroup}, ${req.units} units, ${req.urgency})`);
          await BloodRequest.findByIdAndDelete(req._id);
          duplicatesRemoved++;
        }
      }
    }

    console.log(`\n✅ Removed ${duplicatesRemoved} duplicate requests`);
    console.log('✅ Database cleaned successfully');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

removeDuplicateRequests();
