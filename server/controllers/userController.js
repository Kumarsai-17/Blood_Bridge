const User = require("../models/User");

/**
 * GET OWN PROFILE (ALL ROLES)
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
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
      district: user.city,
      isApproved: user.isApproved,
      createdAt: user.createdAt
    };

    // Donor profile
    if (user.role === "donor") {
      profile.bloodGroup = user.bloodGroup;
      profile.totalDonations = user.donationHistory.length;
      profile.lastDonationDate = user.lastDonationDate;
      profile.donationHistory = user.donationHistory;
    }

    // Hospital profile
    if (user.role === "hospital") {
      profile.hospitalDetails = user.hospitalDetails;
    }

    // Blood bank profile
    if (user.role === "bloodbank") {
      profile.inventoryManaged = true;
    }

    // Admin & Super Admin profile
    if (user.role === "admin" || user.role === "super_admin") {
      profile.mustChangePassword = user.mustChangePassword;
    }

    res.json(profile);

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * UPDATE OWN PROFILE (SAFE FIELDS ONLY)
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, phone, location, hospitalDetails, state, city } = req.body;

    // Common editable fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    if (location && location.lat != null && location.lng != null) {
      user.location = location;
    }

    // Allow admins to update their state and city
    if (user.role === 'admin' || user.role === 'super_admin') {
      if (state !== undefined) user.state = state;
      if (city !== undefined) user.city = city;
    }

    // Hospital-specific editable fields
    if (user.role === "hospital" && hospitalDetails) {
      user.hospitalDetails = {
        ...user.hospitalDetails,
        ...hospitalDetails
      };
    }

    // 🚫 Restricted (INTENTIONALLY BLOCKED)
    // email
    // role
    // bloodGroup
    // isApproved
    // donationHistory

    await user.save();

    res.json({ message: "Profile updated successfully" });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET ALL USERS (ADMIN ONLY)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -otp -otpExpiry -emailVerificationOtp -emailVerificationExpiry")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
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
 * GET USER BY ID (ADMIN ONLY)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
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
      district: user.city,
      isApproved: user.isApproved,
      emailVerified: user.emailVerified,
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
      user: profile
    });

  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};
