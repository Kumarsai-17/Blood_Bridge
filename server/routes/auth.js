const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Public routes (rate limiting removed)
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/verify-login-otp", authController.verifyLoginOTP);
router.post("/resend-login-otp", authController.resendLoginOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPasswordWithOtp);
router.post("/verify-email", authController.verifyEmail);
router.post("/verify-otp", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationOtp);
router.post("/resend-otp", authController.resendVerificationOtp);

// Test endpoint (can be removed in production)
router.post("/test-email", authController.testEmail);

// Protected routes
router.post("/change-password", auth, authController.changePassword);

module.exports = router;
