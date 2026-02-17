const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateOtp = require("../utils/generateOtp");
const sendEmail = require("../utils/sendEmail");
const { validatePassword } = require("../utils/passwordValidator");

/**
 * REGISTER
 * Used by: Donor, Hospital, Blood Bank
 */
exports.register = async (req, res) => {
  try {
    console.log('📝 REGISTER REQUEST:', {
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
      hasPassword: !!req.body.password,
      hasLocation: !!req.body.location,
      bloodGroup: req.body.bloodGroup
    });

    const { name, email, password, phone, role, location, address, hospitalDetails, bloodBankDetails, bloodGroup, state, city } = req.body;

    // Basic validation
    if (!name || !email || !phone || !role) {
      console.log('❌ Missing required fields');
      return res.status(400).json({ message: "name, email, phone and role are required" });
    }

    // location required for all roles per your requirement
    if (!location || location.lat == null || location.lng == null) {
      return res.status(400).json({ message: "Please allow location access and provide your current location." });
    }

    // role-specific validation
    if (role === "hospital" && (!hospitalDetails || !hospitalDetails.registrationNumber)) {
      return res.status(400).json({ message: "Hospital details required for hospital registration." });
    }

    if (role === "bloodbank" && (!bloodBankDetails || !bloodBankDetails.registrationId)) {
      return res.status(400).json({ message: "Blood bank details required for blood bank registration." });
    }

    // optional: donors must provide bloodGroup
    if (role === "donor" && !bloodGroup) {
      return res.status(400).json({ message: "Donors must provide bloodGroup." });
    }

    // check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      // If user exists but email not verified, allow re-registration (resend OTP)
      if (!existing.emailVerified) {
        // Generate new OTP
        const otp = generateOtp();
        const hashedOtp = await bcrypt.hash(otp, 10);

        existing.emailVerificationOtp = hashedOtp;
        existing.emailVerificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        await existing.save();

        // Resend verification email
        await sendEmail(
          existing.email,
          "Verify Your BloodBridge Account",
          `Hello ${existing.name},

Welcome back to BloodBridge! Please verify your email address to complete your registration.

Your verification code is: ${otp}

⏱ This code will expire in 10 minutes.

If you didn't create this account, please ignore this email.

Best regards,
BloodBridge Team`
        );

        return res.status(200).json({
          success: true,
          message: "Account exists but not verified. New verification code sent to your email.",
          requiresVerification: true,
          email: existing.email
        });
      }
      
      // Email already registered and verified
      return res.status(400).json({ 
        message: "Email already registered. Please login instead." 
      });
    }

    // Password handling: All roles can provide password during registration
    let hashed = null;
    if (password) {
      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          message: "Password does not meet requirements",
          errors: passwordValidation.errors
        });
      }

      hashed = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed for:', role);
    } else if (role === "donor") {
      // Donors MUST provide password
      return res.status(400).json({ message: "Password is required for donor registration" });
    } else {
      // Hospitals and blood banks can register without password (admin will set it during approval)
      console.log('ℹ️ No password provided for:', role, '- Admin will set password during approval');
      hashed = null;
    }

    const user = new User({
      name,
      email,
      password: hashed,
      phone,
      role,
      location,
      state,
      city,
      address,
      hospitalDetails: hospitalDetails || undefined,
      bloodBankDetails: bloodBankDetails || undefined,
      bloodGroup: bloodGroup || null
    });

    // Generate OTP for email verification
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.emailVerificationOtp = hashedOtp;
    user.emailVerificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send verification email
    const emailResult = await sendEmail(
      user.email,
      "Verify Your BloodBridge Account",
      `Hello ${user.name},

Welcome to BloodBridge! Please verify your email address to complete your registration.

Your verification code is: ${otp}

⏱ This code will expire in 10 minutes.

If you didn't create this account, please ignore this email.

Best regards,
BloodBridge Team`
    );

    if (!emailResult.success) {
      // Delete the user if email fails to send
      await User.findByIdAndDelete(user._id);
      
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try registering again or contact support."
      });
    }

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
      requiresVerification: true,
      email: user.email
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * LOGIN
 */
exports.login = async (req, res) => {
  try {
    console.log('🔐 LOGIN REQUEST:', { email: req.body.email, hasPassword: !!req.body.password });

    const { email, password } = req.body;

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log('✅ User found:', { email: user.email, role: user.role, emailVerified: user.emailVerified, isApproved: user.isApproved });

    if (!user.password) {
      console.log('❌ User has no password set');
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // email verification check
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address first",
        requiresVerification: true,
        email: user.email
      });
    }

    // approval check
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Account pending admin approval"
      });
    }

    // Super admin bypasses OTP verification
    if (user.role === 'super_admin') {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      console.log('✅ Super admin login successful:', email);

      return res.json({
        success: true,
        token,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      });
    }

    // For all other users, send OTP for login verification
    const otp = generateOtp();
    const otpString = String(otp).trim();
    const hashedOtp = await bcrypt.hash(otpString, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log('📧 Attempting to send OTP email to:', user.email);

    // Send OTP email
    const emailResult = await sendEmail(
      user.email,
      "Login Verification - BloodBridge",
      `Hello ${user.name},

We received a login request for your BloodBridge account.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

If you did not attempt to login, please ignore this email and change your password immediately.

Best regards,
BloodBridge Team`
    );

    console.log('📧 Email send result:', emailResult);

    if (!emailResult.success) {
      // Clear the OTP from database if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      
      console.error('❌ Email send failed:', emailResult.error);
      
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again or contact support.",
        error: emailResult.error || 'Email service error'
      });
    }

    console.log('✅ OTP sent successfully to:', user.email);

    res.json({
      success: true,
      requiresOTP: true,
      message: "OTP sent to your email. Please verify to complete login.",
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('❌ LOGIN ERROR:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * VERIFY LOGIN OTP
 */
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp, location } = req.body;

    console.log('🔍 VERIFY LOGIN OTP REQUEST:', { email, otp, hasLocation: !!location });

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid. Please login again."
      });
    }

    const otpString = String(otp).trim();
    const isOtpValid = await bcrypt.compare(otpString, user.otp);
    
    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Clear OTP after successful verification
    user.otp = null;
    user.otpExpiry = null;

    // Update donor location on every login
    if (user.role === 'donor' && location && location.lat && location.lng) {
      console.log('📍 Updating donor location:', location);
      user.location = {
        lat: location.lat,
        lng: location.lng
      };
    }

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      message: "Login successful"
    });
  } catch (error) {
    console.error("VERIFY LOGIN OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * RESEND LOGIN OTP
 */
exports.resendLoginOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: "If an account exists with this email, a new OTP has been sent."
      });
    }

    // Don't send OTP to super_admin
    if (user.role === 'super_admin') {
      return res.status(400).json({
        success: false,
        message: "Super admin does not require OTP verification"
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const otpString = String(otp).trim();
    const hashedOtp = await bcrypt.hash(otpString, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP email
    const emailResult = await sendEmail(
      user.email,
      "Login Verification - BloodBridge",
      `Hello ${user.name},

Here's your new One-Time Password (OTP) for login verification: ${otp}

⏱ This code will expire in 10 minutes.

If you did not request this, please ignore this email and change your password immediately.

Best regards,
BloodBridge Team`
    );

    if (!emailResult.success) {
      // Clear the OTP from database if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again or contact support."
      });
    }

    res.json({
      success: true,
      message: "New verification code sent to your email"
    });
  } catch (error) {
    console.error("RESEND LOGIN OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * CHANGE PASSWORD
 * Used after first admin login
 */
exports.changePassword = async (req, res) => {
  try {
    // SAFETY CHECK
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password required" });
    }

    // Get user to check current password
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has existing password, verify current password
    if (user.password && currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
    }

    // ALWAYS check if new password is same as current password (if user has a password)
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ 
          message: "New password must be different from current password",
          code: "SAME_PASSWORD"
        });
      }
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet requirements",
        errors: passwordValidation.errors
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword,
      mustChangePassword: false
    });

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * FORGOT PASSWORD – SEND OTP (All Roles)
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email address" });
    }

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Different messages based on role
    let emailSubject = "Password Reset OTP - BloodBridge";
    let emailBody = "";

    if (user.role === "donor") {
      emailBody = `Hello ${user.name},

We received a request to reset your BloodBridge donor account password.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

As a valued blood donor, your account security is important to us. If you did not request this reset, please ignore this email and your password will remain unchanged.

Thank you for saving lives!

Best regards,
BloodBridge Team`;
    } else if (user.role === "hospital") {
      emailBody = `Hello ${user.name},

We received a request to reset your BloodBridge hospital account password.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

For security reasons, please ensure you're the authorized personnel for this hospital account. If you did not request this reset, please contact our support team immediately.

Best regards,
BloodBridge Team`;
    } else if (user.role === "bloodbank") {
      emailBody = `Hello ${user.name},

We received a request to reset your BloodBridge blood bank account password.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

As a blood bank administrator, maintaining account security is crucial. If you did not request this reset, please contact our support team immediately.

Best regards,
BloodBridge Team`;
    } else if (user.role === "admin" || user.role === "super_admin") {
      emailBody = `Hello ${user.name},

We received a request to reset your BloodBridge ${user.role === 'super_admin' ? 'Super Admin' : 'Admin'} account password.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

⚠️ SECURITY ALERT: This is an administrative account. If you did not request this reset, please contact the system administrator immediately.

Best regards,
BloodBridge Team`;
    } else {
      emailBody = `Hello ${user.name},

We received a request to reset your BloodBridge account password.

Your One-Time Password (OTP) is: ${otp}

⏱ This code will expire in 10 minutes.

If you did not request this reset, please ignore this email.

Best regards,
BloodBridge Team`;
    }

    const emailResult = await sendEmail(user.email, emailSubject, emailBody);

    if (!emailResult.success) {
      // Clear the OTP from database if email fails
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again or contact support."
      });
    }

    res.json({
      success: true,
      message: "OTP sent successfully to your email",
      role: user.role
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * VERIFY EMAIL WITH OTP
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('🔍 VERIFY EMAIL REQUEST:', { 
      email, 
      otp, 
      otpType: typeof otp, 
      otpLength: otp?.length 
    });

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.emailVerified) {
      console.log('⚠️ Email already verified:', email);
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    if (!user.emailVerificationOtp || !user.emailVerificationExpiry || user.emailVerificationExpiry < Date.now()) {
      console.log('❌ OTP expired or missing:', {
        hasOtp: !!user.emailVerificationOtp,
        hasExpiry: !!user.emailVerificationExpiry,
        expiryTime: user.emailVerificationExpiry,
        currentTime: Date.now(),
        expired: user.emailVerificationExpiry < Date.now()
      });
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid"
      });
    }

    const isOtpValid = await bcrypt.compare(otp.toString().trim(), user.emailVerificationOtp);
    console.log('🔐 OTP Validation:', { 
      isValid: isOtpValid,
      providedOtp: otp,
      trimmedOtp: otp.toString().trim()
    });
    
    if (!isOtpValid) {
      console.log('❌ Invalid OTP for:', email);
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    user.emailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationExpiry = null;
    
    // Auto-approve donors after email verification
    if (user.role === 'donor') {
      user.isApproved = true;
    }
    
    await user.save();

    console.log('✅ Email verified successfully:', email);

    res.json({
      success: true,
      message: "Email verified successfully",
      role: user.role,
      isApproved: user.isApproved
    });
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * RESEND EMAIL VERIFICATION OTP
 */
exports.resendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    const otp = generateOtp();
    const otpString = String(otp).trim();
    const hashedOtp = await bcrypt.hash(otpString, 10);

    user.emailVerificationOtp = hashedOtp;
    user.emailVerificationExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const emailResult = await sendEmail(
      user.email,
      "BloodBridge - New Verification Code",
      `Hello ${user.name},

Here's your new verification code: ${otp}

⏱ This code will expire in 10 minutes.

Best regards,
BloodBridge Team`
    );

    if (!emailResult.success) {
      // Clear the OTP from database if email fails
      user.emailVerificationOtp = null;
      user.emailVerificationExpiry = null;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again or contact support."
      });
    }

    res.json({
      success: true,
      message: "New verification code sent to your email"
    });
  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * RESET PASSWORD USING OTP (All Roles)
 */
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "No account found with this email address" });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired or invalid. Please request a new one." });
    }

    const isOtpValid = await bcrypt.compare(otp, user.otp);
    if (!isOtpValid) {
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });
    }

    // Validate new password
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Check if new password is same as current password
    if (user.password) {
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ 
          message: "New password must be different from your current password",
          code: "SAME_PASSWORD"
        });
      }
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: "Password does not meet requirements",
        errors: passwordValidation.errors
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;

    // Reset mustChangePassword flag if it was set
    if (user.mustChangePassword) {
      user.mustChangePassword = false;
    }

    await user.save();

    console.log(`✅ PASSWORD RESET SUCCESSFUL for ${user.role}: ${user.email}`);

    res.json({
      success: true,
      message: "Password reset successful. You can now login with your new password.",
      role: user.role
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
