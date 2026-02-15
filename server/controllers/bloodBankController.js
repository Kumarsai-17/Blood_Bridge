const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const BloodInventory = require("../models/BloodInventory");
const calculateDistance = require("../utils/calculateDistance");

/**
 * GET NEARBY BLOOD BANKS (Donor / Hospital)
 */
exports.getNearbyBloodBanks = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location required" });
    }

    const bloodBanks = await User.find({
      role: "bloodbank",
      isApproved: true
    }).select("name location");

    const nearbyBloodBanks = [];

    for (const bank of bloodBanks) {
      if (!bank.location) continue;

      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        bank.location.lat,
        bank.location.lng
      );

      if (distance <= 15) {
        const inventory = await BloodInventory.find({
          bloodBank: bank._id
        });

        nearbyBloodBanks.push({
          _id: bank._id,
          name: bank.name,
          distance: distance.toFixed(2),
          inventory
        });
      }
    }

    res.json(nearbyBloodBanks);
  } catch (error) {
    console.error("NEARBY BLOOD BANK ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADD / UPDATE INVENTORY
 */
exports.updateInventory = async (req, res) => {
  try {
    const { bloodGroup, unitsAvailable } = req.body;

    if (!bloodGroup || unitsAvailable === undefined) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const inventory = await BloodInventory.findOneAndUpdate(
      { bloodBank: req.user.id, bloodGroup },
      { unitsAvailable },
      { upsert: true, new: true }
    );

    res.json({
      message: "Inventory updated",
      inventory
    });
  } catch (error) {
    console.error("UPDATE INVENTORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VIEW ALL INVENTORY (Blood Bank)
 */
exports.getInventory = async (req, res) => {
  try {
    const inventory = await BloodInventory.find({
      bloodBank: req.user.id
    });

    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VIEW PENDING BLOOD REQUESTS
 */
exports.getBloodRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: "pending" })
      .populate("hospital", "name email phone");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET REQUEST HISTORY (ACCEPTED & CANCELLED)
 */
exports.getRequestHistory = async (req, res) => {
  try {
    const bloodBankId = req.user.id;

    // Find requests that were fulfilled by this blood bank or cancelled
    const requests = await BloodRequest.find({
      $or: [
        { fulfilledBy: bloodBankId, status: "fulfilled" },
        { status: "cancelled" }
      ]
    })
      .populate("hospital", "name location phone email")
      .sort({ updatedAt: -1 })
      .limit(100);

    // Map to frontend format
    const formattedRequests = requests.map(req => ({
      _id: req._id,
      hospital: {
        name: req.hospital?.name || "Unknown Hospital",
        location: req.hospital?.location?.address || "Unknown Location"
      },
      bloodGroup: req.bloodGroup,
      unitsNeeded: req.units,
      urgency: req.urgency,
      patientName: req.patientName,
      status: req.status === "fulfilled" ? "accepted" : "cancelled",
      createdAt: req.createdAt,
      updatedAt: req.updatedAt
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error("GET REQUEST HISTORY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * BLOOD BANK DASHBOARD
 */
exports.getBloodBankDashboard = async (req, res) => {
  try {
    const { getInventorySummary } = require("../services/inventoryService");
    const bloodBankId = req.user.id;

    const inventorySummary = await getInventorySummary(bloodBankId);

    // Pending requests
    const pendingRequests = await BloodRequest.countDocuments({
      status: "pending"
    });

    // Total fulfilled by this blood bank
    const totalFulfilled = await BloodRequest.countDocuments({
      fulfilledBy: bloodBankId,
      status: "fulfilled"
    });

    // Units distributed
    const unitsDistributed = await BloodRequest.aggregate([
      { $match: { fulfilledBy: bloodBankId, status: "fulfilled" } },
      { $group: { _id: null, total: { $sum: "$units" } } }
    ]);

    // Recent requests
    const recentRequests = await BloodRequest.find({ status: "pending" })
      .populate("hospital", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Total donors
    const totalDonors = await User.countDocuments({
      role: "donor",
      isApproved: true
    });

    // Donors by blood type
    const donorsByBloodType = await User.aggregate([
      { $match: { role: "donor", isApproved: true } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const donorStats = {};
    donorsByBloodType.forEach(item => {
      donorStats[item._id] = item.count;
    });

    // Recent donors
    const recentDonors = await User.find({
      role: "donor",
      isApproved: true
    })
      .select("name bloodGroup lastDonationDate location")
      .sort({ createdAt: -1 })
      .limit(10);

    // Fulfillment rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalRequestsLast30Days = await BloodRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const fulfilledLast30Days = await BloodRequest.countDocuments({
      fulfilledBy: bloodBankId,
      status: "fulfilled",
      "timeline.fulfilledAt": { $gte: thirtyDaysAgo }
    });

    const fulfillmentRate = totalRequestsLast30Days > 0 
      ? Math.round((fulfilledLast30Days / totalRequestsLast30Days) * 100)
      : 0;

    // Blood type distribution in fulfilled requests
    const bloodTypeDistribution = await BloodRequest.aggregate([
      { $match: { fulfilledBy: bloodBankId, status: "fulfilled" } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 }, totalUnits: { $sum: "$units" } } },
      { $sort: { count: -1 } }
    ]);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const fulfilled = await BloodRequest.countDocuments({
        fulfilledBy: bloodBankId,
        status: "fulfilled",
        "timeline.fulfilledAt": { $gte: monthStart, $lt: monthEnd }
      });
      
      monthlyTrends.push({
        month: months[monthStart.getMonth()],
        fulfilled
      });
    }

    // Average response time (time from request creation to fulfillment)
    const fulfilledRequests = await BloodRequest.find({
      fulfilledBy: bloodBankId,
      status: "fulfilled",
      "timeline.fulfilledAt": { $exists: true }
    }).select("createdAt timeline.fulfilledAt").limit(50);

    let totalResponseTime = 0;
    let responseCount = 0;

    fulfilledRequests.forEach(req => {
      if (req.timeline.fulfilledAt) {
        const responseTime = req.timeline.fulfilledAt - req.createdAt;
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const avgResponseHours = responseCount > 0 
      ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60))
      : 0;

    // Most requested blood types
    const mostRequested = await BloodRequest.aggregate([
      { $match: { status: "pending" } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Critical stock alerts
    const criticalStock = await BloodInventory.find({
      bloodBank: bloodBankId,
      unitsAvailable: { $lt: 5 }
    }).select("bloodGroup unitsAvailable");

    res.json({
      success: true,
      data: {
        // Basic stats
        totalUnits: inventorySummary.totalUnits,
        lowStockItems: inventorySummary.lowStockItems,
        pendingRequests,
        totalFulfilled,
        unitsDistributed: unitsDistributed[0]?.total || 0,
        fulfillmentRate,
        avgResponseHours,
        
        // Inventory
        inventory: inventorySummary.bloodTypes,
        criticalStock: criticalStock.map(item => ({
          bloodType: item.bloodGroup,
          units: item.unitsAvailable
        })),
        
        // Donors
        totalDonors,
        donorsByBloodType: donorStats,
        recentDonors: recentDonors.map(donor => ({
          id: donor._id,
          name: donor.name,
          bloodType: donor.bloodGroup,
          lastDonation: donor.lastDonationDate,
          location: donor.location
        })),
        
        // Requests
        recentRequests: recentRequests.map(req => ({
          id: req._id,
          bloodType: req.bloodGroup,
          hospitalName: req.hospital.name,
          unitsNeeded: req.units,
          urgency: req.urgency,
          status: req.status,
          createdAt: req.createdAt
        })),
        
        // Analytics
        bloodTypeDistribution: bloodTypeDistribution.map(item => ({
          bloodType: item._id,
          requests: item.count,
          totalUnits: item.totalUnits
        })),
        mostRequested: mostRequested.map(item => ({
          bloodType: item._id,
          count: item.count
        })),
        monthlyTrends
      }
    });

  } catch (error) {
    console.error("BLOOD BANK DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * FULFILL BLOOD REQUEST
 * ALSO UPDATE DONOR DONATION HISTORY
 */
exports.fulfillRequest = async (req, res) => {
  try {
    const { requestId, bloodTypesToUse } = req.body;

    const request = await BloodRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "Invalid request" });
    }

    // If blood types are manually selected by blood bank
    if (bloodTypesToUse && Array.isArray(bloodTypesToUse)) {
      // Validate total units
      const totalUnits = bloodTypesToUse.reduce((sum, bt) => sum + bt.units, 0);
      if (totalUnits !== request.units) {
        return res.status(400).json({ 
          message: `Total units must equal ${request.units}, got ${totalUnits}` 
        });
      }

      // Validate compatibility
      const { getCompatibleDonors } = require("../utils/bloodCompatibility");
      const compatibleTypes = getCompatibleDonors(request.bloodGroup);
      
      for (const bt of bloodTypesToUse) {
        if (!compatibleTypes.includes(bt.bloodGroup)) {
          return res.status(400).json({ 
            message: `${bt.bloodGroup} is not compatible with ${request.bloodGroup}` 
          });
        }

        // Check availability
        const inventory = await BloodInventory.findOne({
          bloodBank: req.user.id,
          bloodGroup: bt.bloodGroup
        });

        if (!inventory || inventory.unitsAvailable < bt.units) {
          return res.status(400).json({ 
            message: `Insufficient ${bt.bloodGroup} stock. Available: ${inventory?.unitsAvailable || 0}, Requested: ${bt.units}` 
          });
        }
      }

      // Deduct units from inventory
      const usedInventories = [];
      for (const bt of bloodTypesToUse) {
        const inventory = await BloodInventory.findOne({
          bloodBank: req.user.id,
          bloodGroup: bt.bloodGroup
        });

        inventory.unitsAvailable -= bt.units;
        await inventory.save();
        usedInventories.push({ bloodGroup: bt.bloodGroup, units: bt.units });
      }

      // Update request status
      request.status = "fulfilled";
      request.fulfilledBy = req.user.id;
      request.fulfilledWith = usedInventories;

      // Mark donor as completed (if donor-based fulfillment)
      if (request.responses && request.responses.length > 0) {
        const response = request.responses.find(
          r => r.status === "accepted"
        );

        if (response) {
          response.status = "completed";
        }
      }

      request.timeline.fulfilledAt = new Date();

      // Find accepted donor
      const acceptedResponse = request.responses.find(
        r => r.status === "accepted"
      );

      if (acceptedResponse) {
        const donor = await User.findById(acceptedResponse.donor);

        if (donor) {
          donor.donationHistory.push({
            request: request._id,
            hospital: request.hospital,
            bloodGroup: donor.bloodGroup,
            units: request.units,
            date: new Date()
          });

          donor.lastDonationDate = new Date();
          await donor.save();
        }
      }

      await request.save();

      return res.json({
        message: "Request fulfilled successfully",
        usedBloodTypes: usedInventories
      });
    }

    // Auto-select compatible blood types (fallback for old behavior)
    const { getCompatibleDonors } = require("../utils/bloodCompatibility");
    const compatibleTypes = getCompatibleDonors(request.bloodGroup);
    
    // Find available inventory from compatible blood types
    const inventories = await BloodInventory.find({
      bloodBank: req.user.id,
      bloodGroup: { $in: compatibleTypes },
      unitsAvailable: { $gt: 0 }
    }).sort({ bloodGroup: 1 }); // Prioritize exact match

    // Calculate total available units
    let totalAvailable = 0;
    inventories.forEach(inv => {
      totalAvailable += inv.unitsAvailable;
    });

    if (totalAvailable < request.units) {
      return res.status(400).json({ 
        message: `Insufficient stock. Need ${request.units} units, only ${totalAvailable} compatible units available`,
        available: totalAvailable,
        needed: request.units
      });
    }

    // Deduct units from inventory (prioritize exact match, then compatible types)
    let unitsToFulfill = request.units;
    const usedInventories = [];

    // First, try to use exact match
    const exactMatch = inventories.find(inv => inv.bloodGroup === request.bloodGroup);
    if (exactMatch && exactMatch.unitsAvailable > 0) {
      const unitsFromExact = Math.min(unitsToFulfill, exactMatch.unitsAvailable);
      exactMatch.unitsAvailable -= unitsFromExact;
      unitsToFulfill -= unitsFromExact;
      usedInventories.push({ bloodGroup: exactMatch.bloodGroup, units: unitsFromExact });
      await exactMatch.save();
    }

    // Then use compatible types if needed
    if (unitsToFulfill > 0) {
      for (const inventory of inventories) {
        if (inventory.bloodGroup === request.bloodGroup) continue; // Already used
        if (unitsToFulfill <= 0) break;
        
        const unitsFromThis = Math.min(unitsToFulfill, inventory.unitsAvailable);
        inventory.unitsAvailable -= unitsFromThis;
        unitsToFulfill -= unitsFromThis;
        usedInventories.push({ bloodGroup: inventory.bloodGroup, units: unitsFromThis });
        await inventory.save();
      }
    }

    // ✅ Update request status
    request.status = "fulfilled";
    request.fulfilledBy = req.user.id;
    request.fulfilledWith = usedInventories; // Track which blood types were used

    // ✅ Mark donor as completed (if donor-based fulfillment)
    if (request.responses && request.responses.length > 0) {
      const response = request.responses.find(
        r => r.status === "accepted"
      );

      if (response) {
        response.status = "completed";
      }
    }

    request.timeline.fulfilledAt = new Date();

    // ✅ FIND ACCEPTED DONOR (FIRST ONE)
    const acceptedResponse = request.responses.find(
      r => r.status === "accepted"
    );

    if (acceptedResponse) {
      const donor = await User.findById(acceptedResponse.donor);

      if (donor) {
        donor.donationHistory.push({
          request: request._id,
          hospital: request.hospital,
          bloodGroup: donor.bloodGroup,
          units: request.units,
          date: new Date()
        });

        donor.lastDonationDate = new Date();
        await donor.save();
      }
    }

    // ✅ Save changes
    await request.save();

    res.json({
      message: "Request fulfilled successfully",
      usedBloodTypes: usedInventories
    });

  } catch (error) {
    console.error("FULFILL REQUEST ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET BLOOD BANK REPORTS
 */
exports.getBloodBankReports = async (req, res) => {
  try {
    const { range } = req.query; // week, month, year, all
    const bloodBankId = req.user.id;

    // Get current inventory
    const inventory = await BloodInventory.find({ bloodBank: bloodBankId });
    const inventoryMap = {};
    let totalUnits = 0;
    
    inventory.forEach(item => {
      inventoryMap[item.bloodGroup] = item.unitsAvailable;
      totalUnits += item.unitsAvailable;
    });

    // Calculate date range
    let startDate = new Date();
    switch(range) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
    }

    // Get fulfilled requests
    const fulfilledRequests = await BloodRequest.find({
      fulfilledBy: bloodBankId,
      status: 'fulfilled',
      'timeline.fulfilledAt': { $gte: startDate }
    });

    // Get pending requests
    const pendingRequests = await BloodRequest.countDocuments({
      status: 'pending'
    });

    // Calculate fulfillment rate
    const totalRequests = await BloodRequest.countDocuments({
      createdAt: { $gte: startDate }
    });
    const fulfillmentRate = totalRequests > 0 
      ? Math.round((fulfilledRequests.length / totalRequests) * 100) 
      : 0;

    // Get most requested blood types
    const mostRequested = await BloodRequest.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { bloodType: '$_id', count: 1, _id: 0 } }
    ]);

    // Get low stock items
    const lowStock = inventory
      .filter(item => item.unitsAvailable < 10)
      .map(item => ({
        bloodType: item.bloodGroup,
        units: item.unitsAvailable
      }))
      .sort((a, b) => a.units - b.units);

    // Get monthly trends (last 6 months)
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const requests = await BloodRequest.countDocuments({
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      
      const fulfilled = await BloodRequest.countDocuments({
        fulfilledBy: bloodBankId,
        status: 'fulfilled',
        'timeline.fulfilledAt': { $gte: monthStart, $lt: monthEnd }
      });
      
      monthlyTrends.push({
        month: months[monthStart.getMonth()],
        requests,
        fulfilled
      });
    }

    // Calculate response time (time from request creation to fulfillment)
    const fulfilledRequestsWithTime = await BloodRequest.find({
      fulfilledBy: bloodBankId,
      status: 'fulfilled',
      'timeline.fulfilledAt': { $exists: true, $gte: startDate }
    }).select('createdAt timeline.fulfilledAt');

    let totalResponseTime = 0;
    let fastestResponse = Infinity;
    let responseCount = 0;

    fulfilledRequestsWithTime.forEach(req => {
      if (req.timeline.fulfilledAt && req.createdAt) {
        const responseTimeMs = new Date(req.timeline.fulfilledAt) - new Date(req.createdAt);
        const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
        
        totalResponseTime += responseTimeHours;
        if (responseTimeHours < fastestResponse) {
          fastestResponse = responseTimeHours;
        }
        responseCount++;
      }
    });

    // Calculate this month's response time
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const thisMonthRequests = await BloodRequest.find({
      fulfilledBy: bloodBankId,
      status: 'fulfilled',
      'timeline.fulfilledAt': { $exists: true, $gte: thisMonthStart }
    }).select('createdAt timeline.fulfilledAt');

    let thisMonthResponseTime = 0;
    let thisMonthCount = 0;

    thisMonthRequests.forEach(req => {
      if (req.timeline.fulfilledAt && req.createdAt) {
        const responseTimeMs = new Date(req.timeline.fulfilledAt) - new Date(req.createdAt);
        const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
        thisMonthResponseTime += responseTimeHours;
        thisMonthCount++;
      }
    });

    const formatResponseTime = (hours) => {
      if (hours < 1) {
        return `${Math.round(hours * 60)} mins`;
      } else if (hours < 24) {
        return `${Math.round(hours)} hrs`;
      } else {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.round(hours % 24);
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
      }
    };

    const responseTime = {
      average: responseCount > 0 ? formatResponseTime(totalResponseTime / responseCount) : 'N/A',
      fastest: fastestResponse !== Infinity ? formatResponseTime(fastestResponse) : 'N/A',
      thisMonth: thisMonthCount > 0 ? formatResponseTime(thisMonthResponseTime / thisMonthCount) : 'N/A'
    };

    res.json({
      success: true,
      data: {
        inventory: inventoryMap,
        totalUnits,
        requestsFulfilled: fulfilledRequests.length,
        pendingRequests,
        fulfillmentRate,
        monthlyTrends,
        mostRequested,
        lowStock,
        responseTime
      }
    });

  } catch (error) {
    console.error("GET BLOOD BANK REPORTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
