const User = require("../models/User");
const BloodRequest = require("../models/BloodRequest");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMs = now - new Date(date);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

/**
 * CREATE ADMIN
 * Only SUPER ADMIN can do this
 */
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, phone, password, region, state, city } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Region, state, and city are required for regular admins
    if (!region) {
      return res.status(400).json({ message: "Region is required for admin" });
    }

    if (!state) {
      return res.status(400).json({ message: "State is required for admin" });
    }

    if (!city) {
      return res.status(400).json({ message: "City is required for admin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "admin",
      region, // Assign region to admin
      state, // Assign state
      city, // Assign city
      isApproved: true,
      emailVerified: true,
      mustChangePassword: false
    });

    await admin.save();

    // Send email with credentials
    const sendEmail = require("../utils/sendEmail");
    
    const emailResult = await sendEmail(
      email,
      "🎉 Your Admin Account Has Been Created - BloodBridge",
      `Hello ${name},

Welcome to BloodBridge! Your administrator account has been created by the Super Admin.

🔐 Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}
Password: ${password}
Assigned Region: ${region}
State: ${state}
City: ${city}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login here: http://localhost:5173/login

⚠️ IMPORTANT: Please keep your credentials secure and do not share them with anyone.

As a regional administrator for ${city}, ${state} (${region} region), you can:
• Approve/reject hospital and blood bank registrations in your region
• View and manage users in your region
• Access admin dashboard and reports for your region
• Monitor blood donation activities in your region

Note: You can only access data for your assigned region.

If you have any questions or need assistance, please contact the Super Admin.

Welcome to the team!

Best regards,
BloodBridge Team`
    );

    console.log("✅ ADMIN CREATED");
    console.log("Email:", email);
    console.log("Region:", region);
    console.log("State:", state);
    console.log("City:", city);

    if (emailResult.success) {
      console.log("📧 Credentials sent via email");
      res.status(201).json({
        success: true,
        message: "Admin created successfully. Credentials sent via email."
      });
    } else {
      console.log("⚠️ Email failed:", emailResult.error);
      // Admin was created but email failed
      res.status(201).json({
        success: true,
        message: "Admin created successfully, but failed to send email. Please share credentials manually.",
        credentials: {
          email: email,
          password: password,
          region: region,
          state: state,
          city: city
        }
      });
    }
  } catch (error) {
    console.error(error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "An account with this email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    let query = {
      role: { $in: ["hospital", "bloodbank"] },
      isApproved: false
    };

    // If regular admin, filter by state and city
    if (req.user.role === 'admin') {
      if (req.user.state && req.user.city) {
        query.state = req.user.state;
        query.city = req.user.city;
      }
    }
    // Super admin sees all pending users (no filter)

    const pending = await User.find(query).select("-password");

    res.json({
      success: true,
      data: pending
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ADMIN DASHBOARD
 * Super Admin sees all data
 * Regular Admin sees only their state and city's data
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Build query filter based on admin role
    let userFilter = {};
    let requestFilter = {};
    
    // If regular admin, filter by state and city
    if (req.user.role === 'admin') {
      if (req.user.state && req.user.city) {
        userFilter.state = req.user.state;
        userFilter.city = req.user.city;
        
        // For requests, we need to filter by hospital's state and city
        const regionalHospitals = await User.find({ 
          role: 'hospital', 
          state: req.user.state,
          city: req.user.city
        }).select('_id');
        const hospitalIds = regionalHospitals.map(h => h._id);
        requestFilter.hospital = { $in: hospitalIds };
      }
    }
    // Super admin sees all data (no filter)

    // Fetch all three metrics from database
    const totalRequests = await BloodRequest.countDocuments(requestFilter);
    const activeRequests = await BloodRequest.countDocuments({ ...requestFilter, status: "pending" });
    const totalDonations = await BloodRequest.countDocuments({ ...requestFilter, status: "fulfilled" });

    // Calculate date ranges - Using current date
    const now = new Date();
    
    // This month: from 1st of current month to now
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    
    // Last month: from 1st of last month to last day of last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);

    // This month and last month requests
    const thisMonthRequests = await BloodRequest.countDocuments({
      ...requestFilter,
      createdAt: { $gte: thisMonthStart }
    });
    
    const lastMonthRequests = await BloodRequest.countDocuments({
      ...requestFilter,
      createdAt: { 
        $gte: lastMonthStart, 
        $lt: thisMonthStart
      }
    });

    // Calculate growth
    let growth = 0;
    if (lastMonthRequests > 0) {
      growth = Math.round(((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100);
    } else if (thisMonthRequests > 0) {
      growth = 100;
    }

    // Active requests by urgency
    const highPriority = await BloodRequest.countDocuments({ ...requestFilter, status: "pending", urgency: "high" });
    const mediumPriority = await BloodRequest.countDocuments({ ...requestFilter, status: "pending", urgency: "medium" });
    const lowPriority = await BloodRequest.countDocuments({ ...requestFilter, status: "pending", urgency: "low" });

    // Total units donated
    const totalUnitsResult = await BloodRequest.aggregate([
      { $match: { ...requestFilter, status: "fulfilled" } },
      { $group: { _id: null, totalUnits: { $sum: "$units" } } }
    ]);
    const totalUnits = totalUnitsResult[0]?.totalUnits || 0;

    // Success rate (fulfilled vs total)
    const successRate = totalRequests > 0 
      ? Math.round((totalDonations / totalRequests) * 100)
      : 0;

    // Average response time
    const fulfilledRequestsWithTime = await BloodRequest.find({
      ...requestFilter,
      status: "fulfilled",
      "timeline.fulfilledAt": { $exists: true }
    }).select("createdAt timeline.fulfilledAt").limit(50);

    let totalResponseTime = 0;
    let responseCount = 0;

    fulfilledRequestsWithTime.forEach(req => {
      if (req.timeline.fulfilledAt) {
        const responseTime = req.timeline.fulfilledAt - req.createdAt;
        totalResponseTime += responseTime;
        responseCount++;
      }
    });

    const avgResponseHours = responseCount > 0 
      ? (totalResponseTime / responseCount / (1000 * 60 * 60)).toFixed(1)
      : 0;

    // Get regional user counts
    const totalDonors = await User.countDocuments({ ...userFilter, role: "donor", isApproved: true });
    const totalHospitals = await User.countDocuments({ ...userFilter, role: "hospital", isApproved: true });
    const totalBloodBanks = await User.countDocuments({ ...userFilter, role: "bloodbank", isApproved: true });

    const responseData = {
      totalRequests,
      activeRequests,
      totalDonations,
      // Detailed insights
      thisMonthRequests,
      lastMonthRequests,
      growth,
      highPriority,
      mediumPriority,
      lowPriority,
      totalUnits,
      successRate,
      avgResponseHours,
      // Regional stats
      totalDonors,
      totalHospitals,
      totalBloodBanks,
      // Admin info
      adminLocation: req.user.role === 'admin' ? `${req.user.city}, ${req.user.state}` : 'All Locations',
      isRegionalAdmin: req.user.role === 'admin'
    };

    console.log('Admin Dashboard - Location:', req.user.role === 'admin' ? `${req.user.city}, ${req.user.state}` : 'All');
    console.log('Sending response:', responseData);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * APPROVE HOSPITAL / BLOOD BANK
 * Admin only
 */
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isApproved) {
      return res.status(400).json({ message: "User already approved" });
    }

    // Only generate temporary password if user doesn't have one
    let tempPassword = null;
    if (!user.password) {
      tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user.password = hashedPassword;
      user.mustChangePassword = true;
      console.log('✅ Generated temporary password for user without password');
    } else {
      console.log('ℹ️ User already has password, skipping password generation');
    }

    user.isApproved = true;

    await user.save();

    // Send email with credentials
    const sendEmail = require("../utils/sendEmail");
    const roleLabel = user.role === 'hospital' ? 'Hospital' : 'Blood Bank';
    
    let emailBody;
    if (tempPassword) {
      // User didn't have password, we generated one
      emailBody = `Hello ${user.name},

Great news! Your ${roleLabel} registration has been approved by our admin team.

🔐 Your Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${user.email}
Temporary Password: ${tempPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login here: http://localhost:5173/login

⚠️ IMPORTANT: For security reasons, you will be required to change your password on first login.

📍 Your registered location: ${user.location.lat.toFixed(4)}, ${user.location.lng.toFixed(4)}

You can now:
${user.role === 'hospital' ? '• Create blood requests\n• View nearby donors\n• Track donation responses' : '• Manage blood inventory\n• View blood requests\n• Connect with donors'}

If you have any questions or need assistance, please contact our support team.

Welcome to BloodBridge!

Best regards,
BloodBridge Team`;
    } else {
      // User already had password from registration
      emailBody = `Hello ${user.name},

Great news! Your ${roleLabel} registration has been approved by our admin team.

🔐 Login Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${user.email}
Password: Use the password you provided during registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login here: http://localhost:5173/login

📍 Your registered location: ${user.location.lat.toFixed(4)}, ${user.location.lng.toFixed(4)}

You can now:
${user.role === 'hospital' ? '• Create blood requests\n• View nearby donors\n• Track donation responses' : '• Manage blood inventory\n• View blood requests\n• Connect with donors'}

If you have any questions or need assistance, please contact our support team.

Welcome to BloodBridge!

Best regards,
BloodBridge Team`;
    }
    
    await sendEmail(
      user.email,
      `🎉 Your ${roleLabel} Account Has Been Approved - BloodBridge`,
      emailBody
    );

    console.log("✅ USER APPROVED");
    console.log("Email:", user.email);
    if (tempPassword) {
      console.log("Temporary Password:", tempPassword);
    } else {
      console.log("Using password from registration");
    }
    console.log("📧 Approval notification sent via email");

    res.json({
      success: true,
      message: "User approved successfully. " + (tempPassword ? "Credentials sent via email." : "User can login with their registration password."),
      email: user.email
    });
  } catch (error) {
    console.error("APPROVE USER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const disaster = require("../config/disaster");

exports.toggleDisasterMode = async (req, res) => {
  try {
    const { enable } = req.body;

    if (enable === true) {
      disaster.enable();
      return res.json({ 
        success: true, 
        message: "Disaster mode ENABLED",
        data: { disasterMode: true }
      });
    }

    disaster.disable();
    res.json({ 
      success: true, 
      message: "Disaster mode DISABLED",
      data: { disasterMode: false }
    });
  } catch (error) {
    console.error("DISASTER TOGGLE ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to toggle disaster mode" 
    });
  }
};

exports.getDisasterStatus = (req, res) => {
  const disaster = require("../config/disaster");
  res.json({ 
    success: true, 
    data: { disasterMode: disaster.isEnabled() } 
  });
};

/**
 * GET EMERGENCY STATISTICS
 * Real statistics for disaster mode dashboard
 */
exports.getEmergencyStats = async (req, res) => {
  try {
    // Total approved donors
    const totalDonors = await User.countDocuments({ 
      role: "donor", 
      isApproved: true,
      isActive: { $ne: false } // Not explicitly disabled
    });

    // Emergency available donors (those who marked themselves as emergency available)
    const emergencyDonors = await User.countDocuments({ 
      role: "donor", 
      isApproved: true,
      isActive: { $ne: false },
      $or: [
        { emergencyAvailable: true },
        { availability: "emergency" }
      ]
    });

    // Active hospitals (approved and not disabled)
    const activeHospitals = await User.countDocuments({ 
      role: "hospital", 
      isApproved: true,
      isActive: { $ne: false }
    });

    // Active blood banks
    const activeBloodBanks = await User.countDocuments({ 
      role: "bloodbank", 
      isApproved: true,
      isActive: { $ne: false }
    });

    // Recent requests (last 24 hours)
    const recentRequests = await BloodRequest.countDocuments({
      status: "pending",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    // All pending requests
    const totalPendingRequests = await BloodRequest.countDocuments({
      status: "pending"
    });

    res.json({
      success: true,
      data: {
        totalDonors,
        emergencyDonors,
        activeHospitals,
        activeBloodBanks,
        recentRequests,
        totalPendingRequests
      }
    });

  } catch (error) {
    console.error("GET EMERGENCY STATS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * REJECT USER
 */
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.isApproved) {
      return res.status(400).json({ 
        success: false, 
        message: "User already approved" 
      });
    }

    // Log rejection before deleting
    const AuditLog = require('../models/AuditLog');
    const auditEntry = await AuditLog.create({
      action: 'rejected',
      targetUserId: user._id.toString(),
      targetUserName: user.name,
      targetUserRole: user.role,
      performedBy: req.user._id,
      details: `${user.role} registration rejected`
    });

    console.log('✅ Rejection logged to audit:', auditEntry);

    // Delete the user
    await User.findByIdAndDelete(userId);

    console.log('🗑️ User deleted:', user.name);

    res.json({
      success: true,
      message: "User rejected and removed from system"
    });

  } catch (error) {
    console.error("REJECT USER ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET ALL USERS
 * Super Admin can view all users
 * Regular Admin can only view users in their region
 */
exports.getAllUsers = async (req, res) => {
  try {
    let query = {};
    
    // If regular admin, filter by state and city
    if (req.user.role === 'admin') {
      if (req.user.state && req.user.city) {
        query.state = req.user.state;
        query.city = req.user.city;
      }
    }
    // Super admin sees all users (no filter)

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      adminLocation: req.user.role === 'admin' ? { state: req.user.state, city: req.user.city } : null
    });
  } catch (error) {
    console.error("GET ALL USERS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET USER DETAILS BY ID
 * Admin can view detailed information about any user
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId)
      .select("-password -otp -otpExpiry -emailVerificationOtp -emailVerificationExpiry");

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const profile = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      state: user.state,
      city: user.city,
      region: user.region,
      isApproved: user.isApproved,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Donor profile
    if (user.role === "donor") {
      profile.bloodGroup = user.bloodGroup;
      profile.totalDonations = user.donationHistory?.length || 0;
      profile.lastDonationDate = user.lastDonationDate;
      profile.donationHistory = user.donationHistory;
    }

    // Hospital profile
    if (user.role === "hospital") {
      profile.hospitalDetails = user.hospitalDetails;
    }

    // Blood bank profile
    if (user.role === "bloodbank") {
      profile.bloodBankDetails = user.bloodBankDetails;
    }

    // Admin & Super Admin profile
    if (user.role === "admin" || user.role === "super_admin") {
      profile.mustChangePassword = user.mustChangePassword;
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error("GET USER DETAILS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * UPDATE USER STATUS (Enable/Disable)
 * Admin can enable/disable users
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: "isActive must be a boolean value" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Prevent disabling super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot modify super admin status" 
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'enabled' : 'disabled'} successfully`,
      data: {
        userId: user._id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error("UPDATE USER STATUS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * DELETE USER
 * Admin can delete users (except super_admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Prevent deleting super_admin
    if (user.role === 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        message: "Cannot delete super admin" 
      });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
/**
 * RESEND CREDENTIALS
 * Admin can resend credentials to hospital/bloodbank users
 */
exports.resendCredentials = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Only allow for hospital and bloodbank users
    if (user.role !== 'hospital' && user.role !== 'bloodbank') {
      return res.status(400).json({ 
        success: false, 
        message: "Credentials can only be resent to hospitals and blood banks" 
      });
    }

    // Generate new temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = true;
    await user.save();

    // Send email with new credentials
    const sendEmail = require("../utils/sendEmail");
    const roleLabel = user.role === 'hospital' ? 'Hospital' : 'Blood Bank';
    
    const emailResult = await sendEmail(
      user.email,
      `🔄 Your ${roleLabel} Credentials Have Been Reset - BloodBridge`,
      `Hello ${user.name},

Your ${roleLabel} account credentials have been reset by an administrator.

🔐 Your New Login Credentials:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${user.email}
New Temporary Password: ${tempPassword}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Login here: http://localhost:5173/login

⚠️ IMPORTANT: For security reasons, you will be required to change your password on first login.

If you did not request this password reset, please contact our support team immediately.

Best regards,
BloodBridge Team`
    );

    console.log("🔄 CREDENTIALS RESENT");
    console.log("Email:", user.email);
    console.log("New Temporary Password:", tempPassword);

    if (emailResult.success) {
      console.log("📧 New credentials sent via email");
      res.json({
        success: true,
        message: "New credentials sent successfully via email"
      });
    } else {
      console.log("⚠️ Email failed:", emailResult.error);
      res.json({
        success: true,
        message: "Credentials reset successfully, but failed to send email. Please share credentials manually.",
        credentials: {
          email: user.email,
          password: tempPassword
        }
      });
    }

  } catch (error) {
    console.error("RESEND CREDENTIALS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET COMPREHENSIVE REPORTS DATA
 * Admin can get detailed analytics and reports
 */
exports.getReportsData = async (req, res) => {
  try {
    const { dateRange = 'last30days' } = req.query;
    
    // Build filter for regional admin
    let userFilter = {};
    let requestFilter = {};
    
    if (req.user.role === 'admin') {
      if (req.user.state && req.user.city) {
        userFilter.state = req.user.state;
        userFilter.city = req.user.city;
        
        // For requests, filter by hospital's state and city
        const regionalHospitals = await User.find({ 
          role: 'hospital', 
          state: req.user.state,
          city: req.user.city
        }).select('_id');
        const hospitalIds = regionalHospitals.map(h => h._id);
        requestFilter.hospital = { $in: hospitalIds };
      }
    }
    // Super admin sees all data (no filter)
    
    // Calculate date range
    let startDate = new Date();
    switch(dateRange) {
      case 'last7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'last30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'thisYear':
        startDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      case 'last3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'last6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case 'lastyear':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    console.log(`📅 Date Range: ${dateRange}, Start Date: ${startDate.toISOString()}`);

    // Get user statistics (filtered by date range and location)
    const totalUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: startDate }
    });
    const totalDonors = await User.countDocuments({ 
      ...userFilter,
      role: "donor",
      createdAt: { $gte: startDate }
    });
    const totalHospitals = await User.countDocuments({ 
      ...userFilter,
      role: "hospital",
      createdAt: { $gte: startDate }
    });
    const totalBloodBanks = await User.countDocuments({ 
      ...userFilter,
      role: "bloodbank",
      createdAt: { $gte: startDate }
    });
    const totalAdmins = await User.countDocuments({ 
      ...userFilter,
      role: { $in: ["admin", "super_admin"] },
      createdAt: { $gte: startDate }
    });

    // Get approval statistics (filtered by date range and location)
    const approvedUsers = await User.countDocuments({ 
      ...userFilter,
      isApproved: true,
      createdAt: { $gte: startDate }
    });
    const pendingApprovals = await User.countDocuments({ 
      ...userFilter,
      role: { $in: ["hospital", "bloodbank"] }, 
      isApproved: false,
      createdAt: { $gte: startDate }
    });

    // Get blood request statistics (filtered by date range and location)
    const totalRequests = await BloodRequest.countDocuments({
      ...requestFilter,
      createdAt: { $gte: startDate }
    });
    const pendingRequests = await BloodRequest.countDocuments({ 
      ...requestFilter,
      status: "pending",
      createdAt: { $gte: startDate }
    });
    const fulfilledRequests = await BloodRequest.countDocuments({ 
      ...requestFilter,
      status: "fulfilled",
      createdAt: { $gte: startDate }
    });
    const expiredRequests = await BloodRequest.countDocuments({ 
      ...requestFilter,
      status: "expired",
      createdAt: { $gte: startDate }
    });

    // Get recent activity (within selected date range and location)
    const recentUsers = await User.countDocuments({
      ...userFilter,
      createdAt: { $gte: startDate }
    });
    const recentRequests = await BloodRequest.countDocuments({
      ...requestFilter,
      createdAt: { $gte: startDate }
    });

    console.log(`📊 Filtered Stats - Total Requests: ${totalRequests}, Fulfilled: ${fulfilledRequests}`);

    // Get monthly user registration trends (last 6 months)
    const monthlyStats = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthUsers = await User.countDocuments({
        ...userFilter,
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });
      
      const monthRequests = await BloodRequest.countDocuments({
        ...requestFilter,
        createdAt: { $gte: monthStart, $lt: monthEnd }
      });

      const monthFulfilled = await BloodRequest.countDocuments({
        ...requestFilter,
        createdAt: { $gte: monthStart, $lt: monthEnd },
        status: 'fulfilled'
      });

      console.log(`📊 ${monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}: Requests=${monthRequests}, Fulfilled=${monthFulfilled}`);

      monthlyStats.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        users: monthUsers,
        requests: monthRequests,
        fulfilled: monthFulfilled
      });
    }

    // Get blood group distribution (filtered by location)
    const bloodGroupStats = await User.aggregate([
      { $match: { ...userFilter, role: "donor", bloodGroup: { $exists: true } } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get recent system activity - approvals and rejections (filtered by location)
    const recentActivity = [];

    // Recent approvals - get all approved users (hospitals and blood banks)
    const recentApprovals = await User.find({
      ...userFilter,
      isApproved: true,
      role: { $in: ['hospital', 'bloodbank'] }
    }).select('name role updatedAt createdAt').sort({ updatedAt: -1 }).limit(10);

    recentApprovals.forEach(user => {
      recentActivity.push({
        userId: user._id,
        action: `Approved`,
        user: user.name,
        role: user.role,
        timestamp: user.updatedAt,
        time: getTimeAgo(user.updatedAt),
        type: 'approved'
      });
    });

    // Get rejections from audit log (filtered by location if needed)
    try {
      const AuditLog = require('../models/AuditLog');
      
      const totalAuditLogs = await AuditLog.countDocuments();
      console.log('📊 Total audit logs in database:', totalAuditLogs);
      
      const recentRejections = await AuditLog.find({
        action: 'rejected'
      }).select('targetUserName targetUserRole createdAt').sort({ createdAt: -1 }).limit(10);

      console.log('📋 Found rejections:', recentRejections.length);
      
      if (recentRejections.length > 0) {
        console.log('📋 Sample rejection:', recentRejections[0]);
      }

      recentRejections.forEach(log => {
        recentActivity.push({
          userId: null,
          action: `Rejected`,
          user: log.targetUserName,
          role: log.targetUserRole,
          timestamp: log.createdAt,
          time: getTimeAgo(log.createdAt),
          type: 'rejected'
        });
      });
    } catch (auditError) {
      console.error('❌ Error fetching audit logs:', auditError.message);
    }

    // Sort by timestamp
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalDonors,
          totalHospitals,
          totalBloodBanks,
          totalAdmins,
          approvedUsers,
          pendingApprovals,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          expiredRequests,
          recentUsers,
          recentRequests
        },
        monthlyStats,
        bloodGroupStats,
        recentActivity: recentActivity.slice(0, 10),
        userDistribution: {
          donors: totalDonors,
          hospitals: totalHospitals,
          bloodBanks: totalBloodBanks,
          admins: totalAdmins
        },
        requestStats: {
          pending: pendingRequests,
          fulfilled: fulfilledRequests,
          expired: expiredRequests
        },
        adminLocation: req.user.role === 'admin' ? `${req.user.city}, ${req.user.state}` : 'All Locations'
      }
    });

  } catch (error) {
    console.error("GET REPORTS DATA ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * GET SYSTEM SETTINGS
 * Admin can get current system settings
 */
exports.getSystemSettings = async (req, res) => {
  try {
    // In a real application, these would be stored in a settings collection
    // For now, we'll return default settings
    const settings = {
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        emergencyAlerts: true
      },
      system: {
        maintenanceMode: false,
        autoBackup: true,
        debugMode: false,
        apiRateLimit: 1000
      },
      security: {
        passwordExpiry: 90,
        maxLoginAttempts: 5,
        sessionTimeout: 30,
        twoFactorAuth: false
      },
      email: {
        smtpServer: process.env.SMTP_HOST || 'smtp.gmail.com',
        smtpPort: parseInt(process.env.SMTP_PORT) || 587,
        smtpUsername: process.env.SMTP_USER || '',
        fromEmail: process.env.FROM_EMAIL || 'noreply@bloodbridge.com'
      }
    };

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error("GET SYSTEM SETTINGS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * UPDATE SYSTEM SETTINGS
 * Admin can update system settings
 */
exports.updateSystemSettings = async (req, res) => {
  try {
    const { section, settings } = req.body;

    if (!section || !settings) {
      return res.status(400).json({ 
        success: false, 
        message: "Section and settings are required" 
      });
    }

    // Validate section
    const validSections = ['notifications', 'system', 'security', 'email'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid settings section" 
      });
    }

    // In a real application, you would save these to a database
    // For now, we'll just validate and return success
    
    // Validate settings based on section
    if (section === 'system' && settings.maintenanceMode === true) {
      console.log("⚠️ MAINTENANCE MODE ENABLED");
    }

    if (section === 'security') {
      if (settings.passwordExpiry < 30) {
        return res.status(400).json({ 
          success: false, 
          message: "Password expiry must be at least 30 days" 
        });
      }
      if (settings.maxLoginAttempts < 3) {
        return res.status(400).json({ 
          success: false, 
          message: "Max login attempts must be at least 3" 
        });
      }
    }

    console.log(`✅ ${section.toUpperCase()} SETTINGS UPDATED:`, settings);

    res.json({
      success: true,
      message: `${section} settings updated successfully`,
      data: { section, settings }
    });

  } catch (error) {
    console.error("UPDATE SYSTEM SETTINGS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * TEST EMAIL CONFIGURATION
 * Admin can test email settings
 */
exports.testEmailSettings = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ 
        success: false, 
        message: "Test email address is required" 
      });
    }

    // Send test email
    const sendEmail = require("../utils/sendEmail");
    
    const emailResult = await sendEmail(
      testEmail,
      "🧪 BloodBridge Email Configuration Test",
      `Hello,

This is a test email to verify that your BloodBridge email configuration is working correctly.

If you received this email, your SMTP settings are properly configured.

Test Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Sent at: ${new Date().toLocaleString()}
• From: BloodBridge System
• Configuration: SMTP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Best regards,
BloodBridge Team`
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: "Test email sent successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to send test email",
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error("TEST EMAIL SETTINGS ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

/**
 * SEED SAMPLE DONORS
 * Create sample donors for testing blood requests
 */
exports.seedSampleDonors = async (req, res) => {
  try {
    console.log('🌱 Starting donor seeding process...');

    // Check if donors already exist
    const existingDonors = await User.countDocuments({ role: "donor" });
    if (existingDonors > 0) {
      return res.json({
        success: true,
        message: `${existingDonors} donors already exist in the system`,
        data: { donorsCreated: 0, existingDonors }
      });
    }

    // Sample donors with different blood groups and locations
    const sampleDonors = [
      // Delhi area donors
      {
        name: "Rahul Sharma",
        email: "rahul.donor@example.com",
        phone: "+91-9876543210",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "O+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 28.6139, lng: 77.2090 }, // Delhi
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Priya Singh",
        email: "priya.donor@example.com",
        phone: "+91-9876543211",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "A+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 28.5672, lng: 77.2100 }, // Near AIIMS Delhi
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Amit Kumar",
        email: "amit.donor@example.com",
        phone: "+91-9876543212",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "B+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 28.5738, lng: 77.2073 }, // Near Safdarjung Hospital
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Sneha Patel",
        email: "sneha.donor@example.com",
        phone: "+91-9876543213",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "AB+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 28.5403, lng: 77.2663 }, // Near Apollo Delhi
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Vikash Gupta",
        email: "vikash.donor@example.com",
        phone: "+91-9876543214",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "O-",
        isApproved: true,
        emailVerified: true,
        location: { lat: 28.6304, lng: 77.2177 }, // Central Delhi
        availability: "always",
        emergencyAvailable: true
      },
      // Mumbai area donors
      {
        name: "Arjun Mehta",
        email: "arjun.donor@example.com",
        phone: "+91-9876543215",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "A-",
        isApproved: true,
        emailVerified: true,
        location: { lat: 18.9894, lng: 72.8313 }, // Near KEM Hospital Mumbai
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Kavya Nair",
        email: "kavya.donor@example.com",
        phone: "+91-9876543216",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "B-",
        isApproved: true,
        emailVerified: true,
        location: { lat: 19.0107, lng: 72.8595 }, // Near Tata Memorial
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Rohit Joshi",
        email: "rohit.donor@example.com",
        phone: "+91-9876543217",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "AB-",
        isApproved: true,
        emailVerified: true,
        location: { lat: 19.0760, lng: 72.8777 }, // Mumbai Central
        availability: "always",
        emergencyAvailable: true
      },
      // Bangalore area donors
      {
        name: "Deepika Reddy",
        email: "deepika.donor@example.com",
        phone: "+91-9876543218",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "O+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 12.9431, lng: 77.5957 }, // Near Nimhans
        availability: "always",
        emergencyAvailable: true
      },
      {
        name: "Karthik Rao",
        email: "karthik.donor@example.com",
        phone: "+91-9876543219",
        password: await bcrypt.hash("donor123", 10),
        role: "donor",
        bloodGroup: "A+",
        isApproved: true,
        emailVerified: true,
        location: { lat: 12.9698, lng: 77.7500 }, // Near Manipal Hospital
        availability: "always",
        emergencyAvailable: true
      }
    ];

    // Create donors
    const createdDonors = await User.insertMany(sampleDonors);
    
    console.log(`✅ Created ${createdDonors.length} sample donors`);

    res.json({
      success: true,
      message: `Successfully created ${createdDonors.length} sample donors`,
      data: {
        donorsCreated: createdDonors.length,
        existingDonors: 0,
        donors: createdDonors.map(donor => ({
          name: donor.name,
          email: donor.email,
          bloodGroup: donor.bloodGroup,
          location: donor.location
        }))
      }
    });

  } catch (error) {
    console.error("SEED DONORS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed donors",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * GET DISASTER MODE HISTORY
 * Admin can view disaster mode activation/deactivation history
 */
exports.getDisasterHistory = async (req, res) => {
  try {
    // For now, return empty array since we don't have a history collection yet
    // In a production system, you would store disaster mode toggles in a history collection
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error("GET DISASTER HISTORY ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
