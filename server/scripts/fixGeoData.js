const mongoose = require('mongoose');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bloodbridge');

async function fixGeoData() {
  try {
    console.log('🔧 Fixing Geo Data...\n');

    // First, fix existing users with location but no geo
    const usersToFix = await User.find({
      $and: [
        { 'location.lat': { $exists: true, $ne: null } },
        { 'location.lng': { $exists: true, $ne: null } },
        { $or: [{ geo: { $exists: false } }, { 'geo.coordinates': { $exists: false } }] }
      ]
    });

    console.log(`🔍 Found ${usersToFix.length} users to fix`);

    for (const user of usersToFix) {
      user.geo = {
        type: "Point",
        coordinates: [user.location.lng, user.location.lat]
      };
      await user.save();
      console.log(`✅ Fixed geo for ${user.name}`);
    }

    // Add real hospitals with proper geo data
    const realHospitals = [
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        email: 'info@aiims.edu',
        phone: '+91-11-26588500',
        role: 'hospital',
        isApproved: true,
        location: { lat: 28.5672, lng: 77.2100 },
        hospitalDetails: {
          registrationNumber: 'AIIMS-DEL-001',
          hospitalType: 'Government Medical College & Hospital',
          licenseAuthority: 'Ministry of Health and Family Welfare',
          address: 'Ansari Nagar, New Delhi - 110029'
        }
      },
      {
        name: 'Safdarjung Hospital',
        email: 'info@safdarjung.gov.in',
        phone: '+91-11-26165060',
        role: 'hospital',
        isApproved: true,
        location: { lat: 28.5738, lng: 77.2073 },
        hospitalDetails: {
          registrationNumber: 'SJH-DEL-002',
          hospitalType: 'Government Hospital',
          licenseAuthority: 'Delhi Government',
          address: 'Ring Road, New Delhi - 110029'
        }
      },
      {
        name: 'Apollo Hospital Delhi',
        email: 'info@apollodelhi.com',
        phone: '+91-11-26925858',
        role: 'hospital',
        isApproved: true,
        location: { lat: 28.5403, lng: 77.2663 },
        hospitalDetails: {
          registrationNumber: 'APL-DEL-003',
          hospitalType: 'Private Multi-specialty',
          licenseAuthority: 'Delhi Medical Council',
          address: 'Sarita Vihar, New Delhi - 110076'
        }
      },
      {
        name: 'King Edward Memorial Hospital',
        email: 'info@kemhospital.org',
        phone: '+91-22-24136051',
        role: 'hospital',
        isApproved: true,
        location: { lat: 18.9894, lng: 72.8313 },
        hospitalDetails: {
          registrationNumber: 'KEM-MUM-004',
          hospitalType: 'Government Medical College & Hospital',
          licenseAuthority: 'Maharashtra Medical Council',
          address: 'Parel, Mumbai - 400012'
        }
      },
      {
        name: 'Tata Memorial Hospital',
        email: 'info@tmc.gov.in',
        phone: '+91-22-24177000',
        role: 'hospital',
        isApproved: true,
        location: { lat: 19.0107, lng: 72.8595 },
        hospitalDetails: {
          registrationNumber: 'TMH-MUM-005',
          hospitalType: 'Specialized Cancer Hospital',
          licenseAuthority: 'Department of Atomic Energy',
          address: 'Dr. E Borges Road, Parel, Mumbai - 400012'
        }
      }
    ];

    // Add blood banks
    const realBloodBanks = [
      {
        name: 'Indian Red Cross Society Blood Bank',
        email: 'info@indianredcross.org',
        phone: '+91-11-23711551',
        role: 'bloodbank',
        isApproved: true,
        location: { lat: 28.6139, lng: 77.2090 },
        bloodBankDetails: {
          registrationId: 'IRC-DEL-BB-001',
          licenseAuthority: 'Central Drugs Standard Control Organization',
          address: 'Red Cross Road, New Delhi - 110001'
        }
      },
      {
        name: 'Rotary Blood Bank Delhi',
        email: 'info@rotarybloodbank.org',
        phone: '+91-11-23654321',
        role: 'bloodbank',
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.6304, lng: 77.2177 },
        bloodBankDetails: {
          registrationId: 'ROT-DEL-BB-002',
          licenseAuthority: 'Delhi State Blood Transfusion Council',
          address: 'Connaught Place, New Delhi - 110001'
        }
      },
      {
        name: 'Tata Memorial Hospital Blood Bank',
        email: 'bloodbank@tmc.gov.in',
        phone: '+91-22-24177100',
        role: 'bloodbank',
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 19.0107, lng: 72.8595 },
        bloodBankDetails: {
          registrationId: 'TMH-MUM-BB-003',
          licenseAuthority: 'Maharashtra FDA',
          address: 'Dr. E Borges Road, Parel, Mumbai - 400012'
        }
      }
    ];

    // Check if hospitals already exist
    for (const hospitalData of realHospitals) {
      const existing = await User.findOne({ email: hospitalData.email });
      if (!existing) {
        const hospital = new User(hospitalData);
        await hospital.save();
        console.log(`✅ Added hospital: ${hospital.name}`);
      } else {
        console.log(`ℹ️ Hospital already exists: ${hospitalData.name}`);
      }
    }

    // Check if blood banks already exist
    for (const bloodBankData of realBloodBanks) {
      const existing = await User.findOne({ email: bloodBankData.email });
      if (!existing) {
        const bloodBank = new User(bloodBankData);
        await bloodBank.save();
        console.log(`✅ Added blood bank: ${bloodBank.name}`);
      } else {
        console.log(`ℹ️ Blood bank already exists: ${bloodBankData.name}`);
      }
    }

    // Test the geospatial query
    console.log('\n🔍 Testing geospatial query...');
    const testLat = 28.6139;
    const testLng = 77.2090;

    const nearbyHospitals = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [testLng, testLat]
          },
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true,
          query: {
            role: "hospital",
            isApproved: true,
            geo: { $exists: true, $ne: null }
          }
        }
      },
      {
        $limit: 10
      }
    ]);

    console.log(`✅ Found ${nearbyHospitals.length} hospitals near Delhi:`);
    nearbyHospitals.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.name} - ${(h.distance / 1000).toFixed(2)}km`);
    });

    const nearbyBloodBanks = await User.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [testLng, testLat]
          },
          distanceField: "distance",
          maxDistance: 30000,
          spherical: true,
          query: {
            role: "bloodbank",
            isApproved: true,
            geo: { $exists: true, $ne: null }
          }
        }
      },
      {
        $limit: 10
      }
    ]);

    console.log(`✅ Found ${nearbyBloodBanks.length} blood banks near Delhi:`);
    nearbyBloodBanks.forEach((bb, i) => {
      console.log(`   ${i + 1}. ${bb.name} - ${(bb.distance / 1000).toFixed(2)}km`);
    });

    mongoose.connection.close();
    console.log('\n✅ Geo data fix completed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

fixGeoData();