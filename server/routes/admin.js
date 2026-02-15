const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const reportsController = require("../controllers/reportsController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔧 Admin route accessed: ${req.method} ${req.path}`);
  next();
});

router.post(
  "/create-admin",
  auth,
  roleCheck("super_admin"),
  adminController.createAdmin
);

router.get(
  "/dashboard",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getAdminDashboard
);

router.get(
  "/pending-approvals",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getPendingUsers
);

router.put(
  "/approve/:userId",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.approveUser
);

router.delete(
  "/reject/:userId",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.rejectUser
);

router.put(
  "/disaster-toggle",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.toggleDisasterMode
);

router.get(
  "/disaster-status",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getDisasterStatus
);

router.get(
  "/disaster-history",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getDisasterHistory
);

// User Management Routes
router.get(
  "/users",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getAllUsers
);

router.get(
  "/users/:userId",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getUserDetails
);

router.put(
  "/users/:userId/status",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.updateUserStatus
);

router.delete(
  "/users/:userId",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.deleteUser
);

router.get(
  "/emergency-stats",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getEmergencyStats
);

router.get(
  "/reports",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getReportsData
);

// New detailed reports routes
router.get(
  "/donors-list",
  auth,
  roleCheck("admin", "super_admin"),
  reportsController.getDonorsList
);

router.get(
  "/request-stats",
  auth,
  roleCheck("admin", "super_admin"),
  reportsController.getRequestStatistics
);

router.get(
  "/export/donors",
  auth,
  roleCheck("admin", "super_admin"),
  reportsController.exportDonors
);

router.get(
  "/settings",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.getSystemSettings
);

router.put(
  "/settings",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.updateSystemSettings
);

router.post(
  "/test-email",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.testEmailSettings
);

router.post(
  "/users/:userId/resend-credentials",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.resendCredentials
);

router.post(
  "/seed-donors",
  auth,
  roleCheck("admin", "super_admin"),
  adminController.seedSampleDonors
);

module.exports = router;