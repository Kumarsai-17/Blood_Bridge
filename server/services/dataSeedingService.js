const User = require('../models/User');
const googlePlacesService = require('./googlePlacesService');

class DataSeedingService {
  constructor() {
    // Major Indian cities with coordinates
    this.indianCities = [
      { name: 'New Delhi', state: 'Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
      { name: 'Mumbai', state: 'Maharashtra', country: 'India', lat: 19.0760, lng: 72.8777 },
      { name: 'Bangalore', state: 'Karnataka', country: 'India', lat: 12.9716, lng: 77.5946 },
      { name: 'Chennai', state: 'Tamil Nadu', country: 'India', lat: 13.0827, lng: 80.2707 },
      { name: 'Hyderabad', state: 'Telangana', country: 'India', lat: 17.3850, lng: 78.4867 },
      { name: 'Kolkata', state: 'West Bengal', country: 'India', lat: 22.5726, lng: 88.3639 },
      { name: 'Pune', state: 'Maharashtra', country: 'India', lat: 18.5204, lng: 73.8567 },
      { name: 'Ahmedabad', state: 'Gujarat', country: 'India', lat: 23.0225, lng: 72.5714 },
      { name: 'Jaipur', state: 'Rajasthan', country: 'India', lat: 26.9124, lng: 75.7873 },
      { name: 'Lucknow', state: 'Uttar Pradesh', country: 'India', lat: 26.8467, lng: 80.9462 }
    ];

    // Real hospital data for major cities
    this.realHospitals = [
      // Delhi
      {
        name: 'All India Institute of Medical Sciences (AIIMS)',
        email: 'info@aiims.edu',
        phone: '+91-11-26588500',
        location: { lat: 28.5672, lng: 77.2100 },
        address: 'Ansari Nagar, New Delhi - 110029',
        city: 'New Delhi',
        state: 'Delhi',
        registrationNumber: 'AIIMS-DEL-001',
        hospitalType: 'Government Medical College & Hospital',
        licenseAuthority: 'Ministry of Health and Family Welfare'
      },
      {
        name: 'Safdarjung Hospital',
        email: 'info@safdarjung.gov.in',
        phone: '+91-11-26165060',
        location: { lat: 28.5738, lng: 77.2073 },
        address: 'Ring Road, New Delhi - 110029',
        city: 'New Delhi',
        state: 'Delhi',
        registrationNumber: 'SJH-DEL-002',
        hospitalType: 'Government Hospital',
        licenseAuthority: 'Delhi Government'
      },
      {
        name: 'Apollo Hospital Delhi',
        email: 'info@apollodelhi.com',
        phone: '+91-11-26925858',
        location: { lat: 28.5403, lng: 77.2663 },
        address: 'Sarita Vihar, New Delhi - 110076',
        city: 'New Delhi',
        state: 'Delhi',
        registrationNumber: 'APL-DEL-003',
        hospitalType: 'Private Multi-specialty',
        licenseAuthority: 'Delhi Medical Council'
      },
      // Mumbai
      {
        name: 'King Edward Memorial Hospital',
        email: 'info@kemhospital.org',
        phone: '+91-22-24136051',
        location: { lat: 18.9894, lng: 72.8313 },
        address: 'Parel, Mumbai - 400012',
        city: 'Mumbai',
        state: 'Maharashtra',
        registrationNumber: 'KEM-MUM-004',
        hospitalType: 'Government Medical College & Hospital',
        licenseAuthority: 'Maharashtra Medical Council'
      },
      {
        name: 'Tata Memorial Hospital',
        email: 'info@tmc.gov.in',
        phone: '+91-22-24177000',
        location: { lat: 19.0107, lng: 72.8595 },
        address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
        city: 'Mumbai',
        state: 'Maharashtra',
        registrationNumber: 'TMH-MUM-005',
        hospitalType: 'Specialized Cancer Hospital',
        licenseAuthority: 'Department of Atomic Energy'
      },
      // Bangalore
      {
        name: 'Nimhans Hospital',
        email: 'info@nimhans.ac.in',
        phone: '+91-80-26995000',
        location: { lat: 12.9431, lng: 77.5957 },
        address: 'Hosur Road, Bangalore - 560029',
        city: 'Bangalore',
        state: 'Karnataka',
        registrationNumber: 'NIM-BLR-006',
        hospitalType: 'Government Institute of Mental Health',
        licenseAuthority: 'Karnataka Medical Council'
      },
      {
        name: 'Manipal Hospital Bangalore',
        email: 'info@manipalhospitals.com',
        phone: '+91-80-25023200',
        location: { lat: 12.9698, lng: 77.7500 },
        address: 'HAL Airport Road, Bangalore - 560017',
        city: 'Bangalore',
        state: 'Karnataka',
        registrationNumber: 'MAN-BLR-007',
        hospitalType: 'Private Multi-specialty',
        licenseAuthority: 'Karnataka Medical Council'
      }
    ];

    // Real blood bank data
    this.realBloodBanks = [
      // Delhi
      {
        name: 'Indian Red Cross Society Blood Bank',
        email: 'info@indianredcross.org',
        phone: '+91-11-23711551',
        location: { lat: 28.6139, lng: 77.2090 },
        address: 'Red Cross Road, New Delhi - 110001',
        city: 'New Delhi',
        state: 'Delhi',
        registrationId: 'IRC-DEL-BB-001',
        licenseAuthority: 'Central Drugs Standard Control Organization'
      },
      {
        name: 'Rotary Blood Bank Delhi',
        email: 'info@rotarybloodbank.org',
        phone: '+91-11-23654321',
        location: { lat: 28.6304, lng: 77.2177 },
        address: 'Connaught Place, New Delhi - 110001',
        city: 'New Delhi',
        state: 'Delhi',
        registrationId: 'ROT-DEL-BB-002',
        licenseAuthority: 'Delhi State Blood Transfusion Council'
      },
      // Mumbai
      {
        name: 'Tata Memorial Hospital Blood Bank',
        email: 'bloodbank@tmc.gov.in',
        phone: '+91-22-24177100',
        location: { lat: 19.0107, lng: 72.8595 },
        address: 'Dr. E Borges Road, Parel, Mumbai - 400012',
        city: 'Mumbai',
        state: 'Maharashtra',
        registrationId: 'TMH-MUM-BB-003',
        licenseAuthority: 'Maharashtra FDA'
      },
      {
        name: 'KEM Hospital Blood Bank',
        email: 'bloodbank@kemhospital.org',
        phone: '+91-22-24136100',
        location: { lat: 18.9894, lng: 72.8313 },
        address: 'Parel, Mumbai - 400012',
        city: 'Mumbai',
        state: 'Maharashtra',
        registrationId: 'KEM-MUM-BB-004',
        licenseAuthority: 'Maharashtra FDA'
      }
    ];
  }

  /**
   * Seed hospitals from Google Places API
   */
  async seedHospitalsFromGooglePlaces() {
    try {
      console.log('🏥 Starting hospital seeding from Google Places API...');
      
      const places = await googlePlacesService.searchMultipleCities(
        this.indianCities.slice(0, 5), // Limit to first 5 cities to avoid API limits
        'hospital'
      );

      const hospitals = [];
      
      for (const place of places) {
        // Get detailed information
        const details = await googlePlacesService.getPlaceDetails(place.placeId);
        
        hospitals.push({
          name: place.name,
          email: `info@${place.name.toLowerCase().replace(/\s+/g, '')}.com`,
          phone: details?.formatted_phone_number || '+91-11-00000000',
          role: 'hospital',
          isApproved: true,
          emergencyAvailable: true,
          location: place.location,
          hospitalDetails: {
            registrationNumber: `GP-${place.placeId.substring(0, 8)}`,
            hospitalType: this.getHospitalType(place.types),
            licenseAuthority: `${place.state} Medical Council`,
            address: details?.formatted_address || place.address,
            website: details?.website,
            rating: place.rating,
            googlePlaceId: place.placeId
          }
        });

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (hospitals.length > 0) {
        await User.insertMany(hospitals);
        console.log(`✅ Seeded ${hospitals.length} hospitals from Google Places`);
      }

      return hospitals.length;
    } catch (error) {
      console.error('❌ Error seeding hospitals from Google Places:', error);
      return 0;
    }
  }

  /**
   * Seed real hospitals and blood banks
   */
  async seedRealData() {
    try {
      console.log('🏥 Starting real data seeding...');

      // Check if data already exists
      const existingHospitals = await User.countDocuments({ role: 'hospital' });
      const existingBloodBanks = await User.countDocuments({ role: 'bloodbank' });

      if (existingHospitals > 0 || existingBloodBanks > 0) {
        console.log(`ℹ️ Data already exists: ${existingHospitals} hospitals, ${existingBloodBanks} blood banks`);
        return {
          hospitalsCreated: 0,
          bloodBanksCreated: 0,
          message: 'Data already exists'
        };
      }

      // Prepare hospital data
      const hospitalData = this.realHospitals.map(hospital => ({
        name: hospital.name,
        email: hospital.email,
        phone: hospital.phone,
        role: 'hospital',
        isApproved: true,
        emergencyAvailable: true,
        location: hospital.location,
        hospitalDetails: {
          registrationNumber: hospital.registrationNumber,
          hospitalType: hospital.hospitalType,
          licenseAuthority: hospital.licenseAuthority,
          address: hospital.address
        }
      }));

      // Prepare blood bank data
      const bloodBankData = this.realBloodBanks.map(bloodBank => ({
        name: bloodBank.name,
        email: bloodBank.email,
        phone: bloodBank.phone,
        role: 'bloodbank',
        isApproved: true,
        emergencyAvailable: true,
        location: bloodBank.location,
        bloodBankDetails: {
          registrationId: bloodBank.registrationId,
          licenseAuthority: bloodBank.licenseAuthority,
          address: bloodBank.address
        }
      }));

      // Insert data
      const createdHospitals = await User.insertMany(hospitalData);
      const createdBloodBanks = await User.insertMany(bloodBankData);

      console.log(`✅ Seeded ${createdHospitals.length} hospitals and ${createdBloodBanks.length} blood banks`);

      return {
        hospitalsCreated: createdHospitals.length,
        bloodBanksCreated: createdBloodBanks.length,
        message: 'Real data seeded successfully'
      };

    } catch (error) {
      console.error('❌ Error seeding real data:', error);
      throw error;
    }
  }

  /**
   * Determine hospital type from Google Places types
   */
  getHospitalType(types) {
    if (types.includes('hospital')) return 'General Hospital';
    if (types.includes('doctor')) return 'Clinic';
    if (types.includes('health')) return 'Health Center';
    return 'Medical Facility';
  }

  /**
   * Seed data from government datasets (placeholder)
   */
  async seedFromGovernmentData() {
    // This would integrate with government APIs like:
    // - National Health Portal API
    // - State Health Department APIs
    // - Hospital Registration databases
    console.log('🏛️ Government data seeding not implemented yet');
    return { message: 'Government data seeding not available' };
  }
}

module.exports = new DataSeedingService();