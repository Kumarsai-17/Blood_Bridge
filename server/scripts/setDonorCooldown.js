require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bloodbridge');

async function setDonorCooldown() {
  try {
    console.log('🔄 Setting donation cooldown for test donors...');

    // Find a donor to set in cooldown
    const donor = await User.findOne({ 
      role: 'donor',
      name: 'Kumar Sai SAI PAIDI' // One of your local donors
    });

    if (!donor) {
      console.log('❌ Donor not found');
      return;
    }

    // Set last donation date to 30 days ago (still in 90-day cooldown)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    donor.lastDonationDate = thirtyDaysAgo;
    
    // Also add to donation history
    donor.donationHistory.push({
      date: thirtyDaysAgo,
      bloodGroup: donor.bloodGroup,
      units: 1,
      notes: 'Test donation for cooldown testing'
    });

    await donor.save();

    console.log(`✅ Set ${donor.name} in cooldown:`);
    console.log(`   Last donation: ${thirtyDaysAgo.toDateString()}`);
    console.log(`   Days since donation: 30`);
    console.log(`   Remaining cooldown: ${90 - 30} days`);

    // Test another donor - set them as recently donated (should be excluded)
    const donor2 = await User.findOne({ 
      role: 'donor',
      name: 'Mahitha'
    });

    if (donor2) {
      const fiveDaysAgo = new Date();
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

      donor2.lastDonationDate = fiveDaysAgo;
      donor2.donationHistory.push({
        date: fiveDaysAgo,
        bloodGroup: donor2.bloodGroup,
        units: 1,
        notes: 'Recent test donation'
      });

      await donor2.save();

      console.log(`✅ Set ${donor2.name} in recent cooldown:`);
      console.log(`   Last donation: ${fiveDaysAgo.toDateString()}`);
      console.log(`   Days since donation: 5`);
      console.log(`   Remaining cooldown: ${90 - 5} days`);
    }

    console.log('\n🧪 Now test creating a blood request to see cooldown filtering in action!');

  } catch (error) {
    console.error('❌ Error setting cooldown:', error);
  } finally {
    mongoose.connection.close();
  }
}

setDonorCooldown();