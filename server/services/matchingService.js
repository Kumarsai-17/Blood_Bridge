const User = require("../models/User");
const calculateDistance = require("../utils/calculateDistance");
const compatibility = require("../utils/bloodCompatibility");
const rules = require("../config/rules");
const disaster = require("../config/disaster");

/**
 * Find eligible donors for a blood request
 * PURE BUSINESS LOGIC (no req/res)
 */
exports.findEligibleDonors = async (requiredBloodGroup, hospitalLocation, radiusKm) => {
  try {
    console.log('🔍 MATCHING SERVICE DEBUG:');
    console.log('  Requested blood group:', requiredBloodGroup);
    console.log('  Hospital location:', hospitalLocation);
    console.log('  Search radius:', radiusKm, 'km');

    if (!hospitalLocation || hospitalLocation.lat == null || hospitalLocation.lng == null) {
      console.log('❌ Invalid hospital location');
      return [];
    }

    const effectiveRadius = disaster.isEnabled()
      ? Math.max(radiusKm, 30)
      : radiusKm;

    console.log('  Effective radius:', effectiveRadius, 'km');

    const donors = await User.find({
      role: "donor",
      isApproved: true,
      "location.lat": { $ne: null },
      "location.lng": { $ne: null }
    });

    console.log(`  Found ${donors.length} total donors with location`);

    // Get active blood requests to check for existing commitments
    const BloodRequest = require("../models/BloodRequest");
    const activeRequests = await BloodRequest.find({
      status: { $in: ["pending", "fulfilled"] },
      "responses.status": "accepted"
    });

    // Create a set of donor IDs who have active accepted requests
    const donorsWithActiveRequests = new Set();
    activeRequests.forEach(request => {
      request.responses.forEach(response => {
        if (response.status === "accepted") {
          donorsWithActiveRequests.add(response.donor.toString());
        }
      });
    });

    const now = Date.now();
    let compatibleCount = 0;
    let cooldownCount = 0;
    let availabilityCount = 0;
    let distanceCount = 0;
    let activeRequestCount = 0;

    const eligibleDonors = donors.filter(donor => {
      if (!donor.bloodGroup || !donor.location) {
        console.log(`  ❌ Donor ${donor.name}: Missing blood group or location`);
        return false;
      }

      // Blood compatibility - check if donor can give to the requested blood type
      const compatible = compatibility.canDonorGiveTo(donor.bloodGroup, requiredBloodGroup);
      if (!compatible) {
        console.log(`  ❌ Donor ${donor.name} (${donor.bloodGroup}): Not compatible with ${requiredBloodGroup}`);
        return false;
      }
      compatibleCount++;

      // Check if donor has an active accepted request
      if (donorsWithActiveRequests.has(donor._id.toString())) {
        console.log(`  ❌ Donor ${donor.name}: Already has an active accepted request`);
        activeRequestCount++;
        return false;
      }

      // Cooldown check (suspended during disaster mode)
      if (!disaster.isEnabled() && donor.lastDonationDate) {
        const daysSinceLastDonation =
          (now - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);

        if (daysSinceLastDonation < rules.DONATION_COOLDOWN_DAYS) {
          const remainingDays = Math.ceil(rules.DONATION_COOLDOWN_DAYS - daysSinceLastDonation);
          console.log(`  ❌ Donor ${donor.name}: In cooldown (${remainingDays} days remaining)`);
          cooldownCount++;
          return false;
        }
      }

      // Additional cooldown check from donation history
      if (!disaster.isEnabled() && donor.donationHistory && donor.donationHistory.length > 0) {
        const lastDonation = donor.donationHistory[donor.donationHistory.length - 1];
        if (lastDonation && lastDonation.date) {
          const daysSinceHistoryDonation = (now - new Date(lastDonation.date)) / (1000 * 60 * 60 * 24);
          if (daysSinceHistoryDonation < rules.DONATION_COOLDOWN_DAYS) {
            const remainingDays = Math.ceil(rules.DONATION_COOLDOWN_DAYS - daysSinceHistoryDonation);
            console.log(`  ❌ Donor ${donor.name}: In cooldown from donation history (${remainingDays} days remaining)`);
            cooldownCount++;
            return false;
          }
        }
      }

      // Availability logic (all donors available during disaster mode)
      if (!disaster.isEnabled() && donor.availability === "emergency" && !donor.emergencyAvailable) {
        console.log(`  ❌ Donor ${donor.name}: Not available (emergency only, not emergency available)`);
        availabilityCount++;
        return false;
      }

      // Distance check
      const distance = calculateDistance(
        hospitalLocation.lat,
        hospitalLocation.lng,
        donor.location.lat,
        donor.location.lng
      );

      if (distance > effectiveRadius) {
        console.log(`  ❌ Donor ${donor.name}: Too far (${distance.toFixed(2)}km > ${effectiveRadius}km)`);
        distanceCount++;
        return false;
      }

      console.log(`  ✅ Donor ${donor.name} (${donor.bloodGroup}): Eligible (${distance.toFixed(2)}km away)`);
      return true;
    });

    console.log('🔍 FILTERING RESULTS:');
    console.log(`  Compatible donors: ${compatibleCount}`);
    console.log(`  Excluded by active requests: ${activeRequestCount}`);
    console.log(`  Excluded by cooldown: ${cooldownCount}`);
    console.log(`  Excluded by availability: ${availabilityCount}`);
    console.log(`  Excluded by distance: ${distanceCount}`);
    console.log(`  Final eligible donors: ${eligibleDonors.length}`);

    return eligibleDonors;
  } catch (error) {
    console.error("FIND ELIGIBLE DONORS ERROR:", error);
    return [];
  }
};
