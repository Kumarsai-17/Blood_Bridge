const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const calculateDistance = require("../utils/calculateDistance");
const isInsideGeoFence = require("../utils/isInsideGeoFence");
const compatibility = require("../utils/bloodCompatibility");
const rules = require("../config/rules");
const disaster = require("../config/disaster");
const cacheService = require("../services/cacheService");
const dataSeedingService = require("../services/dataSeedingService");
const overpassService = require("../services/overpassService");

/**
 * GET REQUEST DETAILS (POPUP DATA)
 */
exports.getRequestDetails = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId)
      .populate("hospital", "name location");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const donor = await User.findById(req.user.id).select("location");

    if (!donor || !donor.location) {
      return res.status(400).json({ message: "Donor location not found" });
    }

    const distance = calculateDistance(
      donor.location.lat,
      donor.location.lng,
      request.hospital.location.lat,
      request.hospital.location.lng
    );

    res.json({
      success: true,
      data: {
        requestId: request._id,
        bloodGroup: request.bloodGroup,
        urgency: request.urgency,
        hospital: {
          name: request.hospital.name,
          location: request.hospital.location
        },
        distanceKm: distance.toFixed(2)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ACCEPT / DECLINE REQUEST
 */
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, response } = req.body;

    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({ message: "Invalid response" });
    }

    const donor = await User.findById(req.user.id);

    // Check if donor already has an active accepted request
    if (response === "accepted") {
      const existingAcceptedRequest = await BloodRequest.findOne({
        "responses.donor": req.user.id,
        "responses.status": "accepted",
        status: { $in: ["pending", "fulfilled"] } // Active requests
      });

      if (existingAcceptedRequest) {
        return res.status(400).json({
          message: "You already have an active accepted request. Please complete or cancel it first."
        });
      }
    }

    // Cooldown check
    if (response === "accepted" && donor.lastDonationDate) {
      const days =
        (Date.now() - new Date(donor.lastDonationDate)) /
        (1000 * 60 * 60 * 24);

      if (days < rules.DONATION_COOLDOWN_DAYS) {
        return res.status(403).json({
          message: "You are in donation cooldown period"
        });
      }
    }

    // Use atomic operation to prevent race condition
    const updateQuery = {
      _id: requestId,
      status: "pending",
      "responses.donor": { $ne: req.user.id } // Ensure donor hasn't already responded
    };

    const updateOperation = {
      $push: {
        responses: {
          donor: req.user.id,
          status: response,
          respondedAt: new Date()
        }
      }
    };

    // If this is the first acceptance, set timeline
    if (response === "accepted") {
      updateOperation.$setOnInsert = {
        "timeline.firstAcceptedAt": new Date()
      };
    }

    const request = await BloodRequest.findOneAndUpdate(
      updateQuery,
      updateOperation,
      { new: true }
    ).populate("hospital", "name location phone");

    if (!request) {
      return res.status(400).json({
        message: "Request not available or you have already responded"
      });
    }

    // If accepted, return hospital info for the popup
    if (response === "accepted") {
      const hospitalInfo = {
        name: request.hospital.name,
        phone: request.hospital.phone,
        location: request.hospital.location,
        address: request.hospital.hospitalDetails?.address
      };

      const requestInfo = {
        _id: request._id,
        bloodGroup: request.bloodGroup,
        units: request.units,
        urgency: request.urgency,
        distance: donor.location && request.hospital.location ?
          calculateDistance(
            donor.location.lat,
            donor.location.lng,
            request.hospital.location.lat,
            request.hospital.location.lng
          ).toFixed(2) : null
      };

      return res.json({
        message: `Request ${response}`,
        hospital: hospitalInfo,
        request: requestInfo
      });
    }

    res.json({ message: `Request ${response}` });
  } catch (err) {
    console.error("RESPOND TO REQUEST ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * CHECK ARRIVAL (GEOFENCE)
 */
exports.checkArrival = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id);
    const request = await BloodRequest.findById(req.params.requestId)
      .populate("hospital", "location geoFence");

    if (!donor || !donor.location) {
      return res.status(400).json({ message: "Location not available" });
    }

    const inside = isInsideGeoFence(
      donor.location,
      request.hospital.location,
      request.hospital.geoFence?.radius || 300
    );

    if (!inside) {
      return res.status(403).json({
        message: "You are outside the allowed area"
      });
    }

    res.json({ arrived: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DONOR DASHBOARD
 */
exports.getDonorDashboard = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id)
      .select("name bloodGroup donationHistory lastDonationDate location");

    // Check if donor has any active accepted requests
    const activeAcceptedRequest = await BloodRequest.findOne({
      "responses.donor": req.user.id,
      "responses.status": "accepted",
      status: { $in: ["pending", "fulfilled"] }
    });

    // Get nearby requests
    const nearbyRequests = await BloodRequest.find({
      status: "pending",
      bloodGroup: { $in: compatibility.getCompatibleRequests(donor.bloodGroup) }
    })
      .populate("hospital", "name location")
      .limit(5);

    // Calculate distances and filter
    const requestsWithDistance = nearbyRequests
      .filter(request => request.hospital.location)
      .map(request => {
        const distance = calculateDistance(
          donor.location.lat,
          donor.location.lng,
          request.hospital.location.lat,
          request.hospital.location.lng
        );
        return {
          ...request.toObject(),
          distance: distance.toFixed(2)
        };
      })
      .filter(request => request.distance <= 15)
      .sort((a, b) => a.distance - b.distance);

    // Get donor stats
    const myResponses = await BloodRequest.countDocuments({
      "responses.donor": req.user.id
    });

    const completedDonations = await BloodRequest.countDocuments({
      "responses.donor": req.user.id,
      "responses.status": "completed"
    });

    // Check eligibility
    const eligibleToDonate = !donor.lastDonationDate ||
      (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24) >= rules.DONATION_COOLDOWN_DAYS;

    // Can accept new requests if eligible and no active accepted request
    const canAcceptRequests = eligibleToDonate && !activeAcceptedRequest;

    res.json({
      success: true,
      data: {
        availableRequests: requestsWithDistance.length,
        myResponses,
        completedDonations,
        livesSaved: completedDonations * 3, // Estimate
        bloodType: donor.bloodGroup,
        lastDonation: donor.lastDonationDate,
        eligibleToDonate,
        canAcceptRequests,
        hasActiveRequest: !!activeAcceptedRequest,
        activeRequestId: activeAcceptedRequest?._id,
        cooldownRemainingDays: !eligibleToDonate && donor.lastDonationDate ?
          Math.ceil(rules.DONATION_COOLDOWN_DAYS - (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)) : 0,
        nearbyRequests: requestsWithDistance
      }
    });

  } catch (err) {
    console.error("DONOR DASHBOARD ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * DONOR PROFILE
 */
exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id)
      .select("name email phone bloodGroup donationHistory lastDonationDate location state city");

    let eligibleToDonate = true;
    let cooldownRemainingDays = 0;

    if (donor.lastDonationDate) {
      const days =
        (Date.now() - new Date(donor.lastDonationDate)) /
        (1000 * 60 * 60 * 24);

      if (days < rules.DONATION_COOLDOWN_DAYS) {
        eligibleToDonate = false;
        cooldownRemainingDays = Math.ceil(
          rules.DONATION_COOLDOWN_DAYS - days
        );
      }
    }

    res.json({
      success: true,
      data: {
        name: donor.name,
        email: donor.email,
        phone: donor.phone,
        bloodGroup: donor.bloodGroup,
        location: donor.location,
        state: donor.state,
        district: donor.city,
        totalDonations: donor.donationHistory.length,
        lastDonationDate: donor.lastDonationDate,
        eligibleToDonate,
        cooldownRemainingDays,
        donationHistory: donor.donationHistory
      }
    });
  } catch (err) {
    console.error("GET DONOR PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * UPDATE DONOR PROFILE
 */
exports.updateDonorProfile = async (req, res) => {
  try {
    const { name, phone, bloodGroup, location } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (location) updateData.location = location;

    const donor = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("name email phone bloodGroup location");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: donor
    });
  } catch (err) {
    console.error("UPDATE DONOR PROFILE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET NEARBY HOSPITALS (Enhanced with caching and security)
 */
exports.getNearbyHospitals = async (req, res) => {
  try {
    // Use validated coordinates from middleware
    const { lat, lng, maxDistance } = req.validatedCoords;

    console.log(`🔍 Searching for hospitals near ${lat}, ${lng} within ${maxDistance}m`);

    // Generate cache key
    const cacheKey = cacheService.generateGeoKey(lat, lng, maxDistance, 'hospitals');

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        method: 'cached',
        cached: true
      });
    }

    // Execute geospatial aggregation with caching
    const nearbyHospitals = await cacheService.cacheAggregationResult(cacheKey, async () => {
      try {
        const results = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat] // GeoJSON uses [lng, lat]
              },
              distanceField: "distance",
              maxDistance: maxDistance,
              spherical: true,
              query: {
                role: "hospital",
                isApproved: true,
                geo: { $exists: true, $ne: null }
              }
            }
          },
          {
            $addFields: {
              distanceKm: { $divide: ["$distance", 1000] }
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              location: 1,
              hospitalDetails: 1,
              distance: "$distanceKm",
              rating: "$hospitalDetails.rating",
              hospitalType: "$hospitalDetails.hospitalType",
              address: "$hospitalDetails.address"
            }
          },
          {
            $sort: { distance: 1 }
          },
          {
            $limit: 20
          }
        ]);

        console.log(`✅ GeoNear found ${results.length} hospitals`);
        return results;
      } catch (geoError) {
        console.log(`⚠️ GeoNear failed: ${geoError.message}`);

        // Fallback to manual calculation
        const hospitals = await User.find({
          role: "hospital",
          isApproved: true,
          location: { $exists: true, $ne: null }
        }).select("name email phone location hospitalDetails").limit(100);

        if (hospitals.length === 0) {
          return [];
        }

        const hospitalsWithDistance = hospitals
          .map(hospital => {
            const distance = calculateDistance(lat, lng, hospital.location.lat, hospital.location.lng);
            return {
              ...hospital.toObject(),
              distance: parseFloat(distance.toFixed(2))
            };
          })
          .filter(hospital => hospital.distance <= maxDistance / 1000)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20);

        console.log(`✅ Fallback found ${hospitalsWithDistance.length} hospitals`);
        return hospitalsWithDistance;
      }
    });

    res.json({
      success: true,
      data: nearbyHospitals.map(h => ({
        ...h,
        distance: typeof h.distance === 'number' ? h.distance.toFixed(2) : h.distance
      })),
      method: nearbyHospitals.length > 0 ? 'geoNear' : 'fallback',
      cached: false,
      total: nearbyHospitals.length
    });

  } catch (err) {
    console.error("GET NEARBY HOSPITALS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * GET BLOOD REQUESTS (FOR DONOR)
 */
exports.getBloodRequests = async (req, res) => {
  try {
    console.log('🩸 GET BLOOD REQUESTS for donor:', req.user.id);

    const donor = await User.findById(req.user.id).select("bloodGroup location");

    if (!donor || !donor.location) {
      console.log('❌ Donor location not found');
      return res.status(400).json({
        success: false,
        message: "Donor location not found"
      });
    }

    console.log('✅ Donor found:', {
      bloodGroup: donor.bloodGroup,
      location: donor.location
    });

    // Find compatible blood requests - requests that this donor can fulfill
    const compatibleBloodGroups = compatibility.getCompatibleRequests(donor.bloodGroup);
    console.log('🔍 Compatible blood groups for donor:', donor.bloodGroup, '→', compatibleBloodGroups);

    const requests = await BloodRequest.find({
      status: "pending",
      bloodGroup: { $in: compatibleBloodGroups }
    })
      .populate("hospital", "name location phone")
      .sort({ createdAt: -1 });

    console.log(`📋 Found ${requests.length} pending requests`);

    // Filter out requests where this donor has already responded (and hasn't cancelled)
    const availableRequests = requests.filter(request => {
      const donorResponse = request.responses.find(
        r => r.donor.toString() === req.user.id
      );
      // Include request if donor hasn't responded, or if they cancelled (response was removed)
      return !donorResponse;
    });

    console.log(`🔍 After filtering donor responses: ${availableRequests.length} requests`);

    // Calculate distances and filter by radius
    const maxRadius = disaster.isEnabled() ? 30 : 20;


    const requestsWithDistance = availableRequests
      .filter(request => request.hospital && request.hospital.location)
      .map(request => {
        const distance = calculateDistance(
          donor.location.lat,
          donor.location.lng,
          request.hospital.location.lat,
          request.hospital.location.lng
        );
        return {
          _id: request._id,
          bloodGroup: request.bloodGroup,
          units: request.units,
          urgency: request.urgency,
          notes: request.notes,
          createdAt: request.createdAt,
          hospitalName: request.hospital.name,
          hospitalPhone: request.hospital.phone,
          location: request.hospital.location,
          distance: parseFloat(distance.toFixed(2))
        };
      })
      .filter(request => request.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);

    console.log(`✅ Returning ${requestsWithDistance.length} requests within ${maxRadius}km`);

    res.json({
      success: true,
      requests: requestsWithDistance
    });
  } catch (err) {
    console.error("❌ GET BLOOD REQUESTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET ACCEPTED REQUESTS
 */
exports.getAcceptedRequests = async (req, res) => {
  try {
    console.log('🔍 GET ACCEPTED REQUESTS for donor:', req.user.id);

    const donor = await User.findById(req.user.id).select("location");

    // Find all requests where this donor has accepted
    const acceptedRequests = await BloodRequest.find({
      "responses.donor": req.user.id,
      "responses.status": "accepted"
    })
      .populate("hospital", "name location phone hospitalDetails")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${acceptedRequests.length} accepted requests`);

    const formattedRequests = acceptedRequests.map(request => {
      // Find this donor's response
      const donorResponse = request.responses.find(
        r => r.donor.toString() === req.user.id && r.status === "accepted"
      );

      let distance = null;
      if (donor.location && request.hospital.location) {
        distance = calculateDistance(
          donor.location.lat,
          donor.location.lng,
          request.hospital.location.lat,
          request.hospital.location.lng
        ).toFixed(2);
      }

      return {
        _id: request._id,
        bloodGroup: request.bloodGroup,
        units: request.units,
        urgency: request.urgency,
        hospitalName: request.hospital.name,
        hospitalPhone: request.hospital.phone,
        location: request.hospital.location,
        distance: distance,
        acceptedAt: donorResponse?.respondedAt || donorResponse?.createdAt || request.createdAt,
        status: request.status
      };
    });

    res.json({
      success: true,
      requests: formattedRequests
    });
  } catch (err) {
    console.error("❌ GET ACCEPTED REQUESTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * CANCEL ACCEPTED REQUEST
 */
exports.cancelAcceptedRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    console.log('🚫 CANCEL ACCEPTED REQUEST:', {
      requestId,
      donorId: req.user.id
    });

    const request = await BloodRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Find donor's response
    const donorResponseIndex = request.responses.findIndex(
      r => r.donor.toString() === req.user.id && r.status === "accepted"
    );

    if (donorResponseIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You haven't accepted this request"
      });
    }

    const donorResponse = request.responses[donorResponseIndex];

    // Check if within 5 minute cancellation window
    const now = new Date();
    const acceptedTime = new Date(donorResponse.respondedAt || donorResponse.createdAt);
    const diffInMinutes = (now - acceptedTime) / (1000 * 60);

    if (diffInMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: "Cancellation period expired. You can only cancel within 5 minutes of acceptance."
      });
    }

    // Mark the response as cancelled instead of removing it
    request.responses[donorResponseIndex].status = "cancelled";
    request.responses[donorResponseIndex].cancelledAt = new Date();
    request.responses[donorResponseIndex].cancelledBy = "donor";
    
    await request.save();

    console.log('✅ Request cancelled successfully by donor');

    res.json({
      success: true,
      message: "Request cancelled successfully"
    });
  } catch (err) {
    console.error("❌ CANCEL ACCEPTED REQUEST ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
exports.getDonationHistory = async (req, res) => {
  try {
    const donor = await User.findById(req.user.id)
      .select("donationHistory")
      .populate({
        path: "donationHistory.request",
        populate: {
          path: "hospital",
          select: "name"
        }
      });

    const history = donor.donationHistory.map(donation => ({
      _id: donation._id,
      date: donation.date,
      bloodGroup: donation.bloodGroup,
      units: donation.units || null,
      hospitalName: donation.request?.hospital?.name || "Unknown Hospital",
      notes: donation.notes
    }));

    res.json({
      success: true,
      history: history.reverse() // Most recent first
    });
  } catch (err) {
    console.error("GET DONATION HISTORY ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};





/**
 * GET NEARBY BLOOD BANKS (Enhanced with caching and security)
 */
exports.getNearbyBloodBanks = async (req, res) => {
  try {
    // Use validated coordinates from middleware
    const { lat, lng, maxDistance } = req.validatedCoords;

    console.log(`🔍 Searching for blood banks near ${lat}, ${lng} within ${maxDistance}m`);

    // Generate cache key
    const cacheKey = cacheService.generateGeoKey(lat, lng, maxDistance, 'bloodbanks');

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        method: 'cached',
        cached: true
      });
    }

    // Execute geospatial aggregation with caching
    const nearbyBloodBanks = await cacheService.cacheAggregationResult(cacheKey, async () => {
      try {
        const results = await User.aggregate([
          {
            $geoNear: {
              near: {
                type: "Point",
                coordinates: [lng, lat] // GeoJSON uses [lng, lat]
              },
              distanceField: "distance",
              maxDistance: maxDistance,
              spherical: true,
              query: {
                role: "bloodbank",
                isApproved: true,
                geo: { $exists: true, $ne: null }
              }
            }
          },
          {
            $addFields: {
              distanceKm: { $divide: ["$distance", 1000] }
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
              location: 1,
              bloodBankDetails: 1,
              distance: "$distanceKm",
              registrationId: "$bloodBankDetails.registrationId",
              address: "$bloodBankDetails.address"
            }
          },
          {
            $sort: { distance: 1 }
          },
          {
            $limit: 20
          }
        ]);

        console.log(`✅ GeoNear found ${results.length} blood banks`);
        return results;
      } catch (geoError) {
        console.log(`⚠️ GeoNear failed: ${geoError.message}`);

        // Fallback to manual calculation
        const bloodBanks = await User.find({
          role: "bloodbank",
          isApproved: true,
          location: { $exists: true, $ne: null }
        }).select("name email phone location bloodBankDetails").limit(100);

        if (bloodBanks.length === 0) {
          return [];
        }

        const bloodBanksWithDistance = bloodBanks
          .map(bloodBank => {
            const distance = calculateDistance(lat, lng, bloodBank.location.lat, bloodBank.location.lng);
            return {
              ...bloodBank.toObject(),
              distance: parseFloat(distance.toFixed(2))
            };
          })
          .filter(bb => bb.distance <= maxDistance / 1000)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 20);

        console.log(`✅ Fallback found ${bloodBanksWithDistance.length} blood banks`);
        return bloodBanksWithDistance;
      }
    });

    res.json({
      success: true,
      data: nearbyBloodBanks.map(bb => ({
        ...bb,
        distance: typeof bb.distance === 'number' ? bb.distance.toFixed(2) : bb.distance
      })),
      method: nearbyBloodBanks.length > 0 ? 'geoNear' : 'fallback',
      cached: false,
      total: nearbyBloodBanks.length
    });

  } catch (err) {
    console.error("GET NEARBY BLOOD BANKS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
/**
 * GET NOTIFICATIONS
 */
exports.getNotifications = async (req, res) => {
  try {
    // Return empty array - no demo notifications
    // In a real app, you'd query from a Notifications collection
    const notifications = [];

    res.json(notifications);
  } catch (error) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * MARK NOTIFICATION AS READ
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, you'd update the notification in the database
    // For now, just return success

    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("MARK NOTIFICATION AS READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * MARK ALL NOTIFICATIONS AS READ
 */
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    // In a real app, you'd update all notifications for the user

    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error("MARK ALL NOTIFICATIONS AS READ ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * DELETE NOTIFICATION
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, you'd delete the notification from the database

    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * SEED REAL HOSPITAL AND BLOOD BANK DATA
 */
exports.seedRealData = async (req, res) => {
  try {
    console.log('🌱 Starting data seeding process...');

    const result = await dataSeedingService.seedRealData();

    // Clear cache after seeding new data
    cacheService.clear();

    res.json({
      success: true,
      message: result.message,
      data: {
        hospitalsCreated: result.hospitalsCreated,
        bloodBanksCreated: result.bloodBanksCreated,
        totalCreated: result.hospitalsCreated + result.bloodBanksCreated
      }
    });

  } catch (error) {
    console.error("SEED REAL DATA ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed data",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * SEED DATA FROM GOOGLE PLACES API
 */
exports.seedFromGooglePlaces = async (req, res) => {
  try {
    console.log('🌱 Starting Google Places data seeding...');

    const hospitalsCreated = await dataSeedingService.seedHospitalsFromGooglePlaces();

    // Clear cache after seeding new data
    cacheService.clear();

    res.json({
      success: true,
      message: `Seeded ${hospitalsCreated} hospitals from Google Places API`,
      data: {
        hospitalsCreated,
        bloodBanksCreated: 0,
        totalCreated: hospitalsCreated
      }
    });

  } catch (error) {
    console.error("SEED GOOGLE PLACES DATA ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed data from Google Places",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET CACHE STATISTICS
 */
exports.getCacheStats = async (req, res) => {
  try {
    const stats = cacheService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("GET CACHE STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * CLEAR CACHE
 */
exports.clearCache = async (req, res) => {
  try {
    cacheService.clear();

    res.json({
      success: true,
      message: "Cache cleared successfully"
    });
  } catch (error) {
    console.error("CLEAR CACHE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET NEARBY HOSPITALS FROM OPENSTREETMAP (FREE)
 */
exports.getNearbyHospitalsOSM = async (req, res) => {
  try {
    // Use validated coordinates from middleware
    const { lat, lng, maxDistance } = req.validatedCoords;
    const radiusKm = maxDistance / 1000; // Convert meters to kilometers
    const includeClinics = req.query.includeClinics === 'true';

    console.log(`🔍 Searching OSM for hospitals near ${lat}, ${lng} within ${radiusKm}km`);

    // Generate cache key for OSM data
    const cacheKey = cacheService.generateGeoKey(lat, lng, maxDistance, `osm-hospitals-${includeClinics}`);

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        source: 'openstreetmap',
        cached: true,
        total: cachedResult.length
      });
    }

    // Fetch from Overpass API with caching
    const osmHospitals = await cacheService.cacheAggregationResult(cacheKey, async () => {
      return await overpassService.getNearbyHospitals(lat, lng, radiusKm, includeClinics);
    });

    // Filter by distance if needed (Overpass might return slightly outside radius)
    const filteredHospitals = osmHospitals.filter(hospital => hospital.distance <= radiusKm);

    res.json({
      success: true,
      data: filteredHospitals,
      source: 'openstreetmap',
      cached: false,
      total: filteredHospitals.length,
      message: filteredHospitals.length === 0
        ? 'No hospitals found in the specified area. Try increasing the search radius.'
        : `Found ${filteredHospitals.length} hospitals from OpenStreetMap`
    });

  } catch (error) {
    console.error("GET OSM HOSPITALS ERROR:", error);

    // Provide helpful error messages
    let errorMessage = "Failed to fetch hospitals from OpenStreetMap";
    if (error.message.includes('timeout')) {
      errorMessage = "Request timeout - OpenStreetMap API is slow, please try again";
    } else if (error.message.includes('Rate limited')) {
      errorMessage = "Too many requests - please wait a moment and try again";
    } else if (error.message.includes('server error')) {
      errorMessage = "OpenStreetMap API is temporarily unavailable";
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      source: 'openstreetmap',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET HOSPITAL DETAILS FROM OSM
 */
exports.getHospitalDetailsOSM = async (req, res) => {
  try {
    const { hospitalId, type = 'node' } = req.params;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: "Hospital ID is required"
      });
    }

    console.log(`🔍 Getting OSM hospital details for ${type}/${hospitalId}`);

    const hospitalDetails = await overpassService.getHospitalDetails(hospitalId, type);

    if (!hospitalDetails) {
      return res.status(404).json({
        success: false,
        message: "Hospital not found"
      });
    }

    res.json({
      success: true,
      data: hospitalDetails,
      source: 'openstreetmap'
    });

  } catch (error) {
    console.error("GET OSM HOSPITAL DETAILS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get hospital details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * COMBINED HOSPITALS ENDPOINT (Database + OSM)
 */
exports.getAllNearbyHospitals = async (req, res) => {
  try {
    // Use validated coordinates from middleware
    const { lat, lng, maxDistance } = req.validatedCoords;
    const radiusKm = maxDistance / 1000;

    console.log(`🔍 Searching ALL sources for hospitals near ${lat}, ${lng} within ${radiusKm}km`);

    // Generate cache key for combined data
    const cacheKey = cacheService.generateGeoKey(lat, lng, maxDistance, 'all-hospitals');

    // Try to get from cache first
    const cachedResult = cacheService.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult.hospitals,
        sources: cachedResult.sources,
        cached: true,
        total: cachedResult.hospitals.length
      });
    }

    // Fetch from both sources in parallel
    const [dbHospitals, osmHospitals] = await Promise.allSettled([
      // Database hospitals
      (async () => {
        try {
          const results = await User.aggregate([
            {
              $geoNear: {
                near: { type: "Point", coordinates: [lng, lat] },
                distanceField: "distance",
                maxDistance: maxDistance,
                spherical: true,
                query: { role: "hospital", isApproved: true, geo: { $exists: true, $ne: null } }
              }
            },
            {
              $addFields: { distanceKm: { $divide: ["$distance", 1000] } }
            },
            {
              $project: {
                name: 1, email: 1, phone: 1, location: 1, hospitalDetails: 1,
                distance: "$distanceKm", source: { $literal: "database" }
              }
            },
            { $sort: { distance: 1 } },
            { $limit: 20 }
          ]);
          return results;
        } catch (error) {
          console.log(`⚠️ Database query failed: ${error.message}`);
          return [];
        }
      })(),

      // OSM hospitals
      overpassService.getNearbyHospitals(lat, lng, radiusKm, false)
    ]);

    // Process results
    const dbResults = dbHospitals.status === 'fulfilled' ? dbHospitals.value : [];
    const osmResults = osmHospitals.status === 'fulfilled' ? osmHospitals.value : [];

    // Combine and deduplicate
    const allHospitals = [...dbResults, ...osmResults];
    const uniqueHospitals = deduplicateHospitals(allHospitals);

    // Sort by distance
    uniqueHospitals.sort((a, b) => a.distance - b.distance);

    const result = {
      hospitals: uniqueHospitals.slice(0, 30), // Limit to 30 results
      sources: {
        database: dbResults.length,
        openstreetmap: osmResults.length,
        total: uniqueHospitals.length
      }
    };

    // Cache the result
    cacheService.set(cacheKey, result, 300); // Cache for 5 minutes

    res.json({
      success: true,
      data: result.hospitals,
      sources: result.sources,
      cached: false,
      total: result.hospitals.length
    });

  } catch (error) {
    console.error("GET ALL HOSPITALS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch hospitals from all sources",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to deduplicate hospitals from different sources
 */
function deduplicateHospitals(hospitals) {
  const seen = new Map();
  const unique = [];

  for (const hospital of hospitals) {
    // Create a key based on name and approximate location
    const key = `${hospital.name?.toLowerCase().trim()}_${Math.round(hospital.location?.lat * 1000)}_${Math.round(hospital.location?.lng * 1000)}`;

    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(hospital);
    }
  }

  return unique;
}

/**
 * SEED REAL HOSPITALS AND BLOOD BANKS
 */
exports.seedRealLocations = async (req, res) => {
  try {
    // Check if real data already exists
    const existingHospital = await User.findOne({
      role: "hospital",
      name: "All India Institute of Medical Sciences (AIIMS)"
    });

    if (existingHospital) {
      return res.json({
        success: true,
        message: "Real hospital and blood bank data already exists",
        data: {
          hospitals: await User.countDocuments({ role: "hospital", isApproved: true }),
          bloodBanks: await User.countDocuments({ role: "bloodbank", isApproved: true })
        }
      });
    }

    // Real hospitals across India
    const realHospitals = [
      // Delhi
      {
        name: "All India Institute of Medical Sciences (AIIMS)",
        email: "info@aiims.edu",
        phone: "+91-11-26588500",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.5672, lng: 77.2100 },
        hospitalDetails: {
          registrationNumber: "AIIMS-DEL-001",
          hospitalType: "Government Medical College & Hospital",
          licenseAuthority: "Ministry of Health and Family Welfare",
          address: "Ansari Nagar, New Delhi - 110029"
        }
      },
      {
        name: "Safdarjung Hospital",
        email: "info@safdarjung.gov.in",
        phone: "+91-11-26165060",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.5738, lng: 77.2073 },
        hospitalDetails: {
          registrationNumber: "SJH-DEL-002",
          hospitalType: "Government Hospital",
          licenseAuthority: "Delhi Government",
          address: "Ring Road, New Delhi - 110029"
        }
      },
      {
        name: "Apollo Hospital Delhi",
        email: "info@apollodelhi.com",
        phone: "+91-11-26925858",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.5403, lng: 77.2663 },
        hospitalDetails: {
          registrationNumber: "APL-DEL-003",
          hospitalType: "Private Multi-specialty",
          licenseAuthority: "Delhi Medical Council",
          address: "Sarita Vihar, New Delhi - 110076"
        }
      },
      // Mumbai
      {
        name: "King Edward Memorial Hospital",
        email: "info@kemhospital.org",
        phone: "+91-22-24136051",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 18.9894, lng: 72.8313 },
        hospitalDetails: {
          registrationNumber: "KEM-MUM-004",
          hospitalType: "Government Medical College & Hospital",
          licenseAuthority: "Maharashtra Medical Council",
          address: "Parel, Mumbai - 400012"
        }
      },
      {
        name: "Tata Memorial Hospital",
        email: "info@tmc.gov.in",
        phone: "+91-22-24177000",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 19.0107, lng: 72.8595 },
        hospitalDetails: {
          registrationNumber: "TMH-MUM-005",
          hospitalType: "Specialized Cancer Hospital",
          licenseAuthority: "Department of Atomic Energy",
          address: "Dr. E Borges Road, Parel, Mumbai - 400012"
        }
      },
      // Bangalore
      {
        name: "Nimhans Hospital",
        email: "info@nimhans.ac.in",
        phone: "+91-80-26995000",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 12.9431, lng: 77.5957 },
        hospitalDetails: {
          registrationNumber: "NIM-BLR-006",
          hospitalType: "Government Institute of Mental Health",
          licenseAuthority: "Karnataka Medical Council",
          address: "Hosur Road, Bangalore - 560029"
        }
      },
      {
        name: "Manipal Hospital Bangalore",
        email: "info@manipalhospitals.com",
        phone: "+91-80-25023200",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 12.9698, lng: 77.7500 },
        hospitalDetails: {
          registrationNumber: "MAN-BLR-007",
          hospitalType: "Private Multi-specialty",
          licenseAuthority: "Karnataka Medical Council",
          address: "HAL Airport Road, Bangalore - 560017"
        }
      },
      // Chennai
      {
        name: "Apollo Hospital Chennai",
        email: "info@apollochennai.com",
        phone: "+91-44-28296000",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 13.0358, lng: 80.2297 },
        hospitalDetails: {
          registrationNumber: "APL-CHE-008",
          hospitalType: "Private Multi-specialty",
          licenseAuthority: "Tamil Nadu Medical Council",
          address: "Greams Lane, Chennai - 600006"
        }
      },
      // Hyderabad
      {
        name: "Nizam's Institute of Medical Sciences",
        email: "info@nims.edu.in",
        phone: "+91-40-23489000",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 17.4126, lng: 78.4071 },
        hospitalDetails: {
          registrationNumber: "NIM-HYD-009",
          hospitalType: "Government Medical College & Hospital",
          licenseAuthority: "Telangana Medical Council",
          address: "Punjagutta, Hyderabad - 500082"
        }
      },
      // Kolkata
      {
        name: "Medical College and Hospital Kolkata",
        email: "info@mckolkata.ac.in",
        phone: "+91-33-22441000",
        role: "hospital",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 22.5726, lng: 88.3639 },
        hospitalDetails: {
          registrationNumber: "MCH-KOL-010",
          hospitalType: "Government Medical College & Hospital",
          licenseAuthority: "West Bengal Medical Council",
          address: "88, College Street, Kolkata - 700073"
        }
      }
    ];

    // Real blood banks across India
    const realBloodBanks = [
      // Delhi
      {
        name: "Indian Red Cross Society Blood Bank",
        email: "info@indianredcross.org",
        phone: "+91-11-23711551",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.6139, lng: 77.2090 },
        bloodBankDetails: {
          registrationId: "IRC-DEL-BB-001",
          licenseAuthority: "Central Drugs Standard Control Organization",
          address: "Red Cross Road, New Delhi - 110001"
        }
      },
      {
        name: "Rotary Blood Bank Delhi",
        email: "info@rotarybloodbank.org",
        phone: "+91-11-23654321",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 28.6304, lng: 77.2177 },
        bloodBankDetails: {
          registrationId: "ROT-DEL-BB-002",
          licenseAuthority: "Delhi State Blood Transfusion Council",
          address: "Connaught Place, New Delhi - 110001"
        }
      },
      // Mumbai
      {
        name: "Tata Memorial Hospital Blood Bank",
        email: "bloodbank@tmc.gov.in",
        phone: "+91-22-24177100",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 19.0107, lng: 72.8595 },
        bloodBankDetails: {
          registrationId: "TMH-MUM-BB-003",
          licenseAuthority: "Maharashtra FDA",
          address: "Dr. E Borges Road, Parel, Mumbai - 400012"
        }
      },
      {
        name: "KEM Hospital Blood Bank",
        email: "bloodbank@kemhospital.org",
        phone: "+91-22-24136100",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 18.9894, lng: 72.8313 },
        bloodBankDetails: {
          registrationId: "KEM-MUM-BB-004",
          licenseAuthority: "Maharashtra FDA",
          address: "Parel, Mumbai - 400012"
        }
      },
      // Bangalore
      {
        name: "Bangalore Medical College Blood Bank",
        email: "bloodbank@bmcri.edu.in",
        phone: "+91-80-26700001",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 12.9716, lng: 77.5946 },
        bloodBankDetails: {
          registrationId: "BMC-BLR-BB-005",
          licenseAuthority: "Karnataka FDA",
          address: "Fort, Bangalore - 560002"
        }
      },
      // Chennai
      {
        name: "Voluntary Health Services Blood Bank",
        email: "bloodbank@vhsindia.org",
        phone: "+91-44-24471000",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 13.0827, lng: 80.2707 },
        bloodBankDetails: {
          registrationId: "VHS-CHE-BB-006",
          licenseAuthority: "Tamil Nadu FDA",
          address: "Taramani, Chennai - 600113"
        }
      },
      // Hyderabad
      {
        name: "Lions Blood Bank Hyderabad",
        email: "info@lionsbloodbank.org",
        phone: "+91-40-27613333",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 17.3850, lng: 78.4867 },
        bloodBankDetails: {
          registrationId: "LBB-HYD-BB-007",
          licenseAuthority: "Telangana FDA",
          address: "Somajiguda, Hyderabad - 500082"
        }
      },
      // Kolkata
      {
        name: "Medical College Hospital Blood Bank",
        email: "bloodbank@mckolkata.ac.in",
        phone: "+91-33-22441100",
        role: "bloodbank",
        isApproved: true,
        emergencyAvailable: true,
        location: { lat: 22.5726, lng: 88.3639 },
        bloodBankDetails: {
          registrationId: "MCH-KOL-BB-008",
          licenseAuthority: "West Bengal FDA",
          address: "88, College Street, Kolkata - 700073"
        }
      }
    ];

    // Create real hospitals and blood banks
    const createdHospitals = await User.insertMany(realHospitals);
    const createdBloodBanks = await User.insertMany(realBloodBanks);

    console.log(`✅ Created ${createdHospitals.length} real hospitals and ${createdBloodBanks.length} real blood banks`);

    res.json({
      success: true,
      message: "Real hospitals and blood banks created successfully",
      data: {
        hospitalsCreated: createdHospitals.length,
        bloodBanksCreated: createdBloodBanks.length,
        totalCreated: createdHospitals.length + createdBloodBanks.length
      }
    });

  } catch (error) {
    console.error("SEED REAL LOCATIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



