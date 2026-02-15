const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bloodbridge');

async function createLocalDonors() {
  try {
    console.log('🌱 Creating local donors with real email addresses...');

    // Get the hospital location (from your test results)
    const hospitalLocation = { lat: 16.542470471208, lng: 81.49650144557906 };
    
    // Create donors within 5km of your hospital with REAL email addresses
    const localDonors = [
      {
        name: "Local Donor 1",
        email: "tbate811+donor1@gmail.com", // Using your email with + addressing
        phone: "+91-9876543220",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "O+",
        isApproved: true,
        emailVerified: true,
        location: { 
          lat: hospitalLocation.lat + 0.01, // ~1km away
          lng: hospitalLocation.lng + 0.01 
        },
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Local Donor 2",
        email: "tbate811+donor2@gmail.com",
        phone: "+91-9876543221",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "A+",
        isApproved: true,
        emailVerified: true,
        location: { 
          lat: hospitalLocation.lat - 0.01, // ~1km away
          lng: hospitalLocation.lng - 0.01 
        },
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Local Donor 3",
        email: "tbate811+donor3@gmail.com",
        phone: "+91-9876543222",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "B+",
        isApproved: true,
        emailVerified: true,
        location: { 
          lat: hospitalLocation.lat + 0.02, // ~2km away
          lng: hospitalLocation.lng - 0.01 
        },
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Local Donor 4",
        email: "tbate811+donor4@gmail.com",
        phone: "+91-9876543223",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "O-",
        isApproved: true,
        emailVerified: true,
        location: { 
          lat: hospitalLocation.lat - 0.02, // ~2km away
          lng: hospitalLocation.lng + 0.02 
        },
        availability: "always",
        emergencyAvailable: true
      }
    ];

    // Delete existing test donors with your email pattern to avoid duplicates
    await User.deleteMany({ 
      email: { $regex: /tbate811\+donor\d+@gmail\.com/ }
    });

    // Create new donors
    const createdDonors = await User.insertMany(localDonors);
    
    console.log(`✅ Created ${createdDonors.length} local donors with real email addresses:`);
    createdDonors.forEach(donor => {
      console.log(`   - ${donor.name} (${donor.bloodGroup}) - ${donor.email}`);
    });

    console.log('\n📧 These donors will receive emails at your Gmail address using + addressing');
    console.log('   Check your Gmail inbox for: tbate811+donor1@gmail.com, etc.');

  } catch (error) {
    console.error('❌ Error creating local donors:', error);
  } finally {
    mongoose.connection.close();
  }
}

createLocalDonors();