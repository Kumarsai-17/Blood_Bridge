const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Your location: 16.5424, 81.4965 (appears to be near Rajahmundry, Andhra Pradesh)

const hospitalsNearYou = [
  {
    name: "Government General Hospital Rajahmundry",
    email: "ggh.rajahmundry@ap.gov.in",
    password: "hospital123",
    phone: "+91-883-2473939",
    role: "hospital",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9891, lng: 81.7780 },
    geo: {
      type: "Point",
      coordinates: [81.7780, 16.9891]
    },
    hospitalDetails: {
      registrationNumber: "GGH-RJY-001",
      hospitalType: "Government Hospital",
      licenseAuthority: "Andhra Pradesh Medical Council",
      address: "Danavaipeta, Rajahmundry, Andhra Pradesh - 533103"
    }
  },
  {
    name: "GSL Medical College and Hospital",
    email: "info@gslmedicalcollege.com",
    password: "hospital123",
    phone: "+91-883-2555555",
    role: "hospital",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 17.0005, lng: 81.8040 },
    geo: {
      type: "Point",
      coordinates: [81.8040, 17.0005]
    },
    hospitalDetails: {
      registrationNumber: "GSL-RJY-002",
      hospitalType: "Private Medical College & Hospital",
      licenseAuthority: "Andhra Pradesh Medical Council",
      address: "NH-16, Rajahmundry, Andhra Pradesh - 533296"
    }
  },
  {
    name: "Sai Sudha Hospital",
    email: "info@saisudha.com",
    password: "hospital123",
    phone: "+91-883-2444444",
    role: "hospital",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9850, lng: 81.7650 },
    geo: {
      type: "Point",
      coordinates: [81.7650, 16.9850]
    },
    hospitalDetails: {
      registrationNumber: "SSH-RJY-003",
      hospitalType: "Private Multi-specialty",
      licenseAuthority: "Andhra Pradesh Medical Council",
      address: "T. Nagar, Rajahmundry, Andhra Pradesh - 533101"
    }
  },
  {
    name: "Vijaya Hospital",
    email: "info@vijayahospital.com",
    password: "hospital123",
    phone: "+91-883-2333333",
    role: "hospital",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9800, lng: 81.7700 },
    geo: {
      type: "Point",
      coordinates: [81.7700, 16.9800]
    },
    hospitalDetails: {
      registrationNumber: "VH-RJY-004",
      hospitalType: "Private Hospital",
      licenseAuthority: "Andhra Pradesh Medical Council",
      address: "Main Road, Rajahmundry, Andhra Pradesh - 533101"
    }
  },
  {
    name: "Apollo Clinic Rajahmundry",
    email: "rajahmundry@apolloclinic.com",
    password: "hospital123",
    phone: "+91-883-2222222",
    role: "hospital",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9920, lng: 81.7820 },
    geo: {
      type: "Point",
      coordinates: [81.7820, 16.9920]
    },
    hospitalDetails: {
      registrationNumber: "APL-RJY-005",
      hospitalType: "Private Clinic",
      licenseAuthority: "Andhra Pradesh Medical Council",
      address: "Danavaipeta, Rajahmundry, Andhra Pradesh - 533103"
    }
  }
];

const bloodBanksNearYou = [
  {
    name: "Government Blood Bank Rajahmundry",
    email: "bloodbank.rjy@ap.gov.in",
    password: "bloodbank123",
    phone: "+91-883-2473940",
    role: "bloodbank",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9891, lng: 81.7780 },
    geo: {
      type: "Point",
      coordinates: [81.7780, 16.9891]
    },
    bloodBankDetails: {
      registrationId: "GBB-RJY-001",
      licenseAuthority: "Andhra Pradesh FDA",
      address: "GGH Campus, Rajahmundry, Andhra Pradesh - 533103"
    }
  },
  {
    name: "Red Cross Blood Bank",
    email: "redcross.rjy@gmail.com",
    password: "bloodbank123",
    phone: "+91-883-2111111",
    role: "bloodbank",
    isApproved: true,
    emergencyAvailable: true,
    location: { lat: 16.9870, lng: 81.7750 },
    geo: {
      type: "Point",
      coordinates: [81.7750, 16.9870]
    },
    bloodBankDetails: {
      registrationId: "RC-RJY-002",
      licenseAuthority: "Andhra Pradesh FDA",
      address: "Main Road, Rajahmundry, Andhra Pradesh - 533101"
    }
  }
];

async function seedYourLocationData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if data already exists
    const existingHospital = await User.findOne({ 
      name: "Government General Hospital Rajahmundry" 
    });

    if (existingHospital) {
      console.log('ℹ️ Data already exists for your location');
      
      // Show existing hospitals
      const hospitals = await User.find({ 
        role: "hospital",
        "location.lat": { $gte: 16.5, $lte: 17.5 },
        "location.lng": { $gte: 81.0, $lte: 82.0 }
      });
      
      console.log(`📍 Found ${hospitals.length} hospitals near your location`);
      hospitals.forEach(h => {
        console.log(`   - ${h.name} at ${h.location.lat}, ${h.location.lng}`);
      });
      
      process.exit(0);
      return;
    }

    // Create hospitals
    console.log('🏥 Creating hospitals near your location...');
    const createdHospitals = await User.insertMany(hospitalsNearYou);
    console.log(`✅ Created ${createdHospitals.length} hospitals`);

    // Create blood banks
    console.log('🩸 Creating blood banks near your location...');
    const createdBloodBanks = await User.insertMany(bloodBanksNearYou);
    console.log(`✅ Created ${createdBloodBanks.length} blood banks`);

    console.log('\n🎉 Successfully seeded data for your location!');
    console.log(`📍 Location: 16.5424, 81.4965 (Rajahmundry area)`);
    console.log(`🏥 Total hospitals: ${createdHospitals.length}`);
    console.log(`🩸 Total blood banks: ${createdBloodBanks.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedYourLocationData();