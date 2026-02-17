const { findEligibleDonors } = require("../services/matchingService");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");
const BloodRequest = require("../models/BloodRequest");
const calculateDistance = require("../utils/calculateDistance");
const disaster = require("../config/disaster");
const sendEmail = require("../utils/sendEmail");
const { bloodRequestTemplate, supportRequestTemplate } = require("../templates/emailTemplates");

// Add donation cancelled template
const donationCancelledTemplate = (data) => {
  const { donorName, bloodGroup, units, hospitalName } = data;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { background: #fff; padding: 20px; }
    .info-box { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩸 BloodBridge</h1>
    </div>
    <div class="content">
      <h2>Hello ${donorName},</h2>
      <div class="info-box">
        <p>The blood donation request you accepted has been cancelled by <strong>${hospitalName}</strong>.</p>
      </div>
      <p><strong>Blood Group:</strong> ${bloodGroup}</p>
      <p><strong>Units:</strong> ${units}</p>
      <p>The hospital may have found another donor or the requirement has been fulfilled. We appreciate your willingness to donate!</p>
      <p>Thank you for being a part of BloodBridge!</p>
    </div>
  </div>
</body>
</html>
  `;
};

// Escalation steps ONLY (default radius comes from rules.js)
const SEARCH_RADII = [20, 30, 40, 50];


/**
 * CREATE BLOOD REQUEST
 */
exports.createBloodRequest = async (req, res) => {
  try {
    console.log('🩸 CREATE BLOOD REQUEST:', {
      bloodGroup: req.body.bloodGroup,
      units: req.body.units,
      urgency: req.body.urgency,
      hospitalId: req.user.id
    });

    const { bloodGroup, units, urgency, notes } = req.body;

    if (!bloodGroup || !units) {
      return res.status(400).json({ message: "Blood group and units required" });
    }

    const request = await BloodRequest.create({
      hospital: req.user.id,
      bloodGroup,
      units,
      urgency,
      notes: notes || ''
    });

    const hospital = await User.findById(req.user.id).select("name location");
    console.log('🏥 Hospital:', hospital.name, 'Location:', hospital.location);

    // Always use 30km radius for email notifications
    const EMAIL_RADIUS_KM = 30;
    console.log(`📧 Sending emails to donors within ${EMAIL_RADIUS_KM}km radius`);

    const donors = await findEligibleDonors(
      bloodGroup,
      hospital.location,
      EMAIL_RADIUS_KM
    );

    console.log(`👥 Found ${donors.length} eligible donors for ${bloodGroup} within ${EMAIL_RADIUS_KM}km`);
    console.log('🔍 Donor details:', donors.map(d => ({
      name: d.name,
      bloodGroup: d.bloodGroup,
      location: d.location,
      email: d.email
    })));

    if (donors.length === 0) {
      console.log('❌ No donors found. Debugging info:');
      console.log('🏥 Hospital location:', hospital.location);
      console.log('🩸 Requested blood group:', bloodGroup);
      console.log('📍 Email radius:', EMAIL_RADIUS_KM, 'km');
      
      // Check if there are any donors at all
      const allDonors = await User.countDocuments({ role: "donor", isApproved: true });
      console.log('👥 Total approved donors in system:', allDonors);
      
      // Check donors with location
      const donorsWithLocation = await User.countDocuments({ 
        role: "donor", 
        isApproved: true,
        "location.lat": { $ne: null },
        "location.lng": { $ne: null }
      });
      console.log('📍 Donors with location:', donorsWithLocation);
    }

    const subject = disaster.isEnabled()
      ? "🚨 EMERGENCY BLOOD ALERT – DISASTER MODE"
      : "🩸 Urgent Blood Request – BloodBridge";

    let emailsSent = 0;
    for (const donor of donors) {
      if (request.notifiedDonors.includes(donor._id)) continue;

      // Calculate distance for this donor
      let donorDistance = null;
      if (donor.location && donor.location.lat && donor.location.lng) {
        donorDistance = calculateDistance(
          hospital.location.lat,
          hospital.location.lng,
          donor.location.lat,
          donor.location.lng
        ).toFixed(1);
      }

      // Generate HTML email using template
      const htmlContent = bloodRequestTemplate({
        donorName: donor.name,
        bloodGroup: bloodGroup,
        units: units,
        urgency: urgency,
        hospitalName: hospital.name,
        hospitalPhone: hospital.phone || null,
        hospitalAddress: hospital.hospitalDetails?.address || hospital.address || null,
        hospitalLocation: hospital.location || null,
        distance: donorDistance,
        notes: notes || null,
        requestUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/requests`,
        isDisaster: disaster.isEnabled()
      });

      try {
        await sendNotification(
          donor.email,
          subject,
          `Blood request from ${hospital.name}`,
          htmlContent,
          'general'
        );
        emailsSent++;
        console.log(`📧 Email sent to: ${donor.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${donor.email}:`, emailError.message);
      }

      request.notifiedDonors.push(donor._id);
    }

    await request.save();

    console.log(`✅ Blood request created. Emails sent: ${emailsSent}/${donors.length}`);

    res.status(201).json({ 
      success: true,
      message: `Request created successfully. ${emailsSent} donors notified within ${EMAIL_RADIUS_KM}km radius.`,
      request,
      donorsNotified: emailsSent
    });
  } catch (err) {
    console.error('❌ CREATE BLOOD REQUEST ERROR:', err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ESCALATE SEARCH RADIUS
 */
exports.escalateBloodRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId);

    if (request.searchStage >= 3) {
      return res.status(400).json({ message: "Max radius reached" });
    }

    request.searchStage += 1;
    request.searchRadiusKm = SEARCH_RADII[request.searchStage - 1];

    const hospital = await User.findById(request.hospital).select("name location");

    const donors = await findEligibleDonors(
      request.bloodGroup,
      hospital.location,
      request.searchRadiusKm
    );

    for (const donor of donors) {
      if (request.notifiedDonors.includes(donor._id)) continue;

      await sendNotification(
        donor.email,
        "🩸 Blood Request Radius Expanded – BloodBridge",
        `Search radius expanded to ${request.searchRadiusKm} km`
      );

      request.notifiedDonors.push(donor._id);
    }

    await request.save();

    res.json({ message: "Radius escalated", radius: request.searchRadiusKm });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DASHBOARD STATS
 */
exports.getHospitalDashboardStats = async (req, res) => {
  try {
    const hospitalId = req.user.id;

    const totalRequests = await BloodRequest.countDocuments({ hospital: hospitalId });
    const pendingRequests = await BloodRequest.countDocuments({ hospital: hospitalId, status: "pending" });
    const fulfilledRequests = await BloodRequest.countDocuments({ hospital: hospitalId, status: "fulfilled" });

    const acceptedRequests = await BloodRequest.aggregate([
      { $match: { hospital: hospitalId } },
      { $unwind: "$responses" },
      { $match: { "responses.status": "accepted" } },
      { $count: "acceptedCount" }
    ]);

    const completedDonations = await BloodRequest.aggregate([
      { $match: { hospital: hospitalId } },
      { $unwind: "$responses" },
      { $match: { "responses.status": "completed" } },
      { $count: "completedCount" }
    ]);

   const completedCount = completedDonations.length > 0
      ? completedDonations[0].completedCount
      : 0;

    console.log('📊 DASHBOARD STATS FOR HOSPITAL:', hospitalId);
    console.log('Total Requests:', totalRequests);
    console.log('Pending:', pendingRequests);
    console.log('Fulfilled:', fulfilledRequests);
    console.log('Accepted Requests:', acceptedRequests[0]?.acceptedCount || 0);
    console.log('Completed Donations:', completedCount);

    res.json({
      success: true,
      data: {
        totalRequests,
        pendingRequests,
        fulfilledRequests,
        acceptedRequests: acceptedRequests[0]?.acceptedCount || 0,
        completedDonations: completedCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VIEW DONOR RESPONSES
 */
exports.getRequestResponses = async (req, res) => {
  try {
    console.log('🔍 GET REQUEST RESPONSES:', {
      requestId: req.params.requestId,
      hospitalId: req.user.id
    });

    const request = await BloodRequest.findById(req.params.requestId)
      .populate("responses.donor", "name bloodGroup location phone email");

    if (!request) {
      console.log('❌ Request not found:', req.params.requestId);
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    if (request.hospital.toString() !== req.user.id.toString()) {
      console.log('❌ Access denied. Request hospital:', request.hospital.toString(), 'User:', req.user.id.toString());
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    console.log('✅ Request found:', {
      id: request._id,
      bloodGroup: request.bloodGroup,
      responsesCount: request.responses?.length || 0
    });

    const hospital = await User.findById(req.user.id).select("location");

    const responses = request.responses.map(r => {
      // Donor info for accepted, completed, or cancelled
      if (r.status === "accepted" || r.status === "completed" || r.status === "cancelled") {
        let distance = null;

        if (r.donor.location) {
          distance = calculateDistance(
            hospital.location.lat,
            hospital.location.lng,
            r.donor.location.lat,
            r.donor.location.lng
          ).toFixed(2);
        }

        return {
          status: r.status,
          donorId: r.donor._id,
          donorName: r.donor.name,
          donorPhone: r.donor.phone,
          donorEmail: r.donor.email,
          bloodGroup: r.donor.bloodGroup,
          donorLocation: r.donor.location,
          distanceKm: distance,
          respondedAt: r.respondedAt,
          cancelledBy: r.cancelledBy || null,
          cancelledAt: r.cancelledAt || null
        };
      }

      // For declined / pending: hide donor identity
      return {
        status: r.status,
        donorName: "Hidden",
        bloodGroup: null,
        distanceKm: null,
        respondedAt: r.respondedAt
      };
    });

    console.log('✅ Returning responses:', responses.length);
    res.json(responses);
  } catch (err) {
    console.error('❌ GET REQUEST RESPONSES ERROR:', err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBloodRequest = async (req, res) => {
  try {
    console.log('🚫 CANCEL REQUEST:', {
      requestId: req.params.requestId,
      hospitalId: req.user.id
    });

    const request = await BloodRequest.findById(req.params.requestId);

    if (!request) {
      console.log('❌ Request not found:', req.params.requestId);
      return res.status(404).json({ 
        success: false, 
        message: "Request not found" 
      });
    }

    // Only owning hospital can cancel
    if (request.hospital.toString() !== req.user.id.toString()) {
      console.log('❌ Access denied. Request hospital:', request.hospital.toString(), 'User:', req.user.id.toString());
      return res.status(403).json({ 
        success: false, 
        message: "Access denied" 
      });
    }

    // Cannot cancel already cancelled request
    if (request.status === "cancelled") {
      console.log('❌ Request already cancelled');
      return res.status(400).json({
        success: false,
        message: "Request already cancelled"
      });
    }

    // Check if any donor has accepted or had accepted this request (even if they later cancelled)
    const hasAcceptedDonor = request.responses.some(r => 
      r.status === "accepted" || 
      (r.status === "cancelled" && r.cancelledBy === "donor")
    );

    request.status = "cancelled";
    request.cancelledAt = new Date();
    request.cancelledAfterApproval = hasAcceptedDonor; // Track if cancelled after donor approval

    await request.save();

    console.log('✅ Request cancelled successfully:', req.params.requestId, 'After approval:', hasAcceptedDonor);

    res.json({
      success: true,
      message: "Blood request cancelled successfully"
    });

  } catch (error) {
    console.error("❌ CANCEL REQUEST ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * MARK DONATION AS FULFILLED
 */
exports.fulfillDonation = async (req, res) => {
  try {
    const { requestId, donorId, unitsCollected } = req.body;
    
    console.log('✅ FULFILL DONATION:', {
      requestId,
      donorId,
      unitsCollected,
      hospitalId: req.user.id
    });

    const request = await BloodRequest.findById(requestId)
      .populate("hospital", "name")
      .populate("responses.donor", "name email bloodGroup");

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only owning hospital can fulfill
    if (request.hospital._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    // Find the donor's response
    const donorResponseIndex = request.responses.findIndex(
      r => r.donor._id.toString() === donorId && r.status === "accepted"
    );

    if (donorResponseIndex === -1) {
      return res.status(400).json({ 
        success: false,
        message: "Donor response not found or not accepted" 
      });
    }

    const donorResponse = request.responses[donorResponseIndex];
    const donor = donorResponse.donor;

    // Update the response status to completed
    request.responses[donorResponseIndex].status = "completed";
    request.responses[donorResponseIndex].completedAt = new Date();
    request.responses[donorResponseIndex].unitsCollected = unitsCollected || request.units;

    // Update request status to fulfilled
    request.status = "fulfilled";
    request.fulfilledAt = new Date();

    console.log('💾 SAVING REQUEST WITH COMPLETED STATUS');
    console.log('Response status:', request.responses[donorResponseIndex].status);
    console.log('Request status:', request.status);

    await request.save();

    console.log('✅ REQUEST SAVED SUCCESSFULLY');

    // Verify the save
    const verifyRequest = await BloodRequest.findById(requestId);
    console.log('🔍 VERIFICATION - Response status after save:', verifyRequest.responses[donorResponseIndex]?.status);

    // Add to donor's donation history
    const donorUser = await User.findById(donorId);
    donorUser.donationHistory.push({
      date: new Date(),
      bloodGroup: request.bloodGroup,
      units: unitsCollected || request.units,
      request: requestId,
      notes: `Donated at ${request.hospital.name}`
    });
    donorUser.lastDonationDate = new Date();
    await donorUser.save();

    // Add to hospital's history (if hospital has donation history field)
    const hospital = await User.findById(req.user.id);
    if (!hospital.donationHistory) {
      hospital.donationHistory = [];
    }
    hospital.donationHistory.push({
      date: new Date(),
      bloodGroup: request.bloodGroup,
      units: unitsCollected || request.units,
      donorName: donor.name,
      donorId: donorId,
      request: requestId,
      notes: `Blood collected from ${donor.name}`
    });
    await hospital.save();

    console.log('✅ Donation fulfilled successfully');

    res.json({
      success: true,
      message: "Donation marked as fulfilled successfully",
      data: {
        request: request,
        donorName: donor.name,
        unitsCollected: unitsCollected || request.units
      }
    });

  } catch (error) {
    console.error("❌ FULFILL DONATION ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * CANCEL DONOR (Hospital can cancel an accepted donor if taking too long)
 */
exports.cancelDonor = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { donorId } = req.body;
    
    console.log('🚫 CANCEL DONOR:', {
      requestId,
      donorId,
      hospitalId: req.user.id
    });

    const request = await BloodRequest.findById(requestId)
      .populate('hospital', 'name email phone')
      .populate('responses.donor', 'name email');

    if (!request) {
      return res.status(404).json({ 
        success: false,
        message: "Request not found" 
      });
    }

    // Only owning hospital can cancel donor
    if (request.hospital._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied" 
      });
    }

    // Check if request is already fulfilled
    if (request.status === "fulfilled") {
      return res.status(400).json({ 
        success: false,
        message: "Cannot cancel donor for fulfilled request" 
      });
    }

    // Find the donor's response
    const donorResponseIndex = request.responses.findIndex(
      r => r.donor._id.toString() === donorId && r.status === "accepted"
    );

    if (donorResponseIndex === -1) {
      return res.status(400).json({ 
        success: false,
        message: "Donor response not found or not accepted" 
      });
    }

    const donor = request.responses[donorResponseIndex].donor;

    // Update the response status to cancelled
    request.responses[donorResponseIndex].status = "cancelled";
    request.responses[donorResponseIndex].cancelledAt = new Date();
    request.responses[donorResponseIndex].cancelledBy = "hospital";

    await request.save();

    // Send email notification to donor
    try {
      const htmlContent = donationCancelledTemplate({
        donorName: donor.name,
        bloodGroup: request.bloodGroup,
        units: request.units,
        hospitalName: request.hospital.name
      });

      await sendEmail(
        donor.email,
        "Blood Donation Request Cancelled - BloodBridge",
        `Your accepted blood donation request has been cancelled by ${request.hospital.name}`,
        htmlContent,
        'general'
      );
      console.log('✅ Cancellation email sent to donor');
    } catch (emailError) {
      console.error('❌ Failed to send cancellation email:', emailError);
      // Don't fail the request if email fails
    }

    console.log('✅ Donor cancelled successfully');

    res.json({
      success: true,
      message: "Donor cancelled successfully. You can now accept another donor."
    });

  } catch (error) {
    console.error("❌ CANCEL DONOR ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET HOSPITAL DONATION HISTORY
 */
exports.getHospitalHistory = async (req, res) => {
  try {
    console.log('📋 GET HOSPITAL HISTORY for hospital:', req.user.id);

    const hospital = await User.findById(req.user.id)
      .select("donationHistory")
      .populate({
        path: "donationHistory.request",
        select: "bloodGroup units createdAt"
      });

    const history = hospital.donationHistory || [];

    // Sort by date (most recent first)
    const sortedHistory = history
      .map(donation => ({
        _id: donation._id,
        date: donation.date,
        bloodGroup: donation.bloodGroup,
        units: donation.units,
        donorName: donation.donorName,
        donorId: donation.donorId,
        notes: donation.notes,
        requestId: donation.request?._id
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    console.log(`✅ Found ${sortedHistory.length} donation records`);

    res.json({
      success: true,
      history: sortedHistory
    });

  } catch (error) {
    console.error("❌ GET HOSPITAL HISTORY ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET HOSPITAL'S OWN REQUESTS
 */
exports.getHospitalRequests = async (req, res) => {
  try {
    console.log('📋 GET HOSPITAL REQUESTS for hospital:', req.user.id);

    const requests = await BloodRequest.find({ 
      hospital: req.user.id 
    })
    .populate("responses.donor", "name bloodGroup")
    .sort({ createdAt: -1 });

    console.log(`✅ Found ${requests.length} requests for hospital`);

    // Add debugging for each request
    requests.forEach((request, index) => {
      console.log(`Request ${index + 1}:`, {
        id: request._id,
        bloodGroup: request.bloodGroup,
        status: request.status,
        responsesCount: request.responses?.length || 0
      });
    });

    res.json({
      success: true,
      data: requests
    });

  } catch (error) {
    console.error("❌ GET HOSPITAL REQUESTS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * CONTACT SUPPORT - Send message to nearby admin
 */
exports.contactSupport = async (req, res) => {
  try {
    const { message } = req.body;
    const hospitalId = req.user.id;

    console.log('📞 CONTACT SUPPORT:', {
      hospitalId,
      message: message?.substring(0, 50) + '...'
    });

    if (!message || !message.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Message is required" 
      });
    }

    // Get hospital details
    const hospital = await User.findById(hospitalId).select("name email location phone");

    if (!hospital) {
      return res.status(404).json({ 
        success: false,
        message: "Hospital not found" 
      });
    }

    // Find nearest admin (within 100km radius)
    let nearestAdmin = null;
    let minDistance = Infinity;

    if (hospital.location && hospital.location.lat && hospital.location.lng) {
      const admins = await User.find({ 
        role: "admin",
        isApproved: true,
        "location.lat": { $ne: null },
        "location.lng": { $ne: null }
      }).select("name email location");

      for (const admin of admins) {
        const distance = calculateDistance(
          hospital.location.lat,
          hospital.location.lng,
          admin.location.lat,
          admin.location.lng
        );

        if (distance < minDistance && distance <= 100) {
          minDistance = distance;
          nearestAdmin = admin;
        }
      }
    }

    // If no nearby admin found, get any admin
    if (!nearestAdmin) {
      nearestAdmin = await User.findOne({ 
        role: "admin",
        isApproved: true 
      }).select("name email");
    }

    if (!nearestAdmin) {
      return res.status(404).json({ 
        success: false,
        message: "No admin available to handle your request" 
      });
    }

    // Generate HTML email using template
    const htmlContent = supportRequestTemplate({
      adminName: nearestAdmin.name,
      hospitalName: hospital.name,
      hospitalEmail: hospital.email,
      hospitalPhone: hospital.phone || null,
      distance: minDistance !== Infinity ? minDistance.toFixed(1) : null,
      message: message
    });

    const emailSubject = `🏥 Support Request from ${hospital.name}`;

    // TEST MODE: Log to console instead of sending email
    const TEST_MODE = process.env.SUPPORT_TEST_MODE === 'true' || true; // Set to true for testing
    
    if (TEST_MODE) {
      console.log('\n' + '='.repeat(80));
      console.log('📧 TEST MODE: Support Email (NOT SENT)');
      console.log('='.repeat(80));
      console.log('To:', nearestAdmin.email);
      console.log('Admin Name:', nearestAdmin.name);
      console.log('Subject:', emailSubject);
      console.log('-'.repeat(80));
      console.log('HTML Content Generated: Yes');
      console.log('='.repeat(80) + '\n');
    } else {
      // Production mode: Actually send the email
      await sendNotification(
        nearestAdmin.email,
        emailSubject,
        `Support request from ${hospital.name}`,
        htmlContent,
        'general'
      );
    }

    console.log(`✅ Support request ${TEST_MODE ? 'logged (TEST MODE)' : 'sent'} to admin: ${nearestAdmin.email}`);

    res.json({
      success: true,
      message: `Support request sent successfully${TEST_MODE ? ' (TEST MODE - Check server console)' : ''}. An admin will contact you soon.`,
      data: {
        adminName: nearestAdmin.name,
        distance: minDistance !== Infinity ? minDistance.toFixed(2) : null,
        testMode: TEST_MODE
      }
    });

  } catch (error) {
    console.error("❌ CONTACT SUPPORT ERROR:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send support request" 
    });
  }
};


/**
 * TOGGLE DISASTER MODE (Hospital)
 */
exports.toggleDisasterMode = async (req, res) => {
  try {
    const { enable } = req.body;
    
    console.log('🚨 TOGGLE DISASTER MODE REQUEST:', {
      enable,
      currentMode: disaster.disasterMode,
      hospitalId: req.user.id,
      hospitalEmail: req.user.email
    });
    
    if (enable === undefined || enable === null) {
      return res.status(400).json({
        success: false,
        message: "Enable parameter is required"
      });
    }
    
    disaster.disasterMode = enable;
    
    console.log('🚨 Disaster Mode', enable ? 'ACTIVATED' : 'DEACTIVATED', 'by hospital:', req.user.email);
    console.log('🚨 New disaster mode state:', disaster.disasterMode);
    console.log('🚨 Verification - isEnabled():', disaster.isEnabled());
    
    res.json({
      success: true,
      message: `Disaster mode ${enable ? 'activated' : 'deactivated'} successfully`,
      data: { disasterMode: disaster.disasterMode }
    });
  } catch (error) {
    console.error("❌ TOGGLE DISASTER MODE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET DISASTER STATUS (Hospital)
 */
exports.getDisasterStatus = (req, res) => {
  console.log('📊 GET DISASTER STATUS:', {
    disasterMode: disaster.disasterMode,
    isEnabled: disaster.isEnabled()
  });
  
  res.json({ 
    success: true,
    data: { 
      disasterMode: disaster.disasterMode 
    }
  });
};
