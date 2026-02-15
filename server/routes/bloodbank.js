const express = require("express");
const router = express.Router();

const bloodBankController = require("../controllers/bloodBankController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const approvalCheck = require("../middleware/approvalCheck");

// Inventory
router.post(
  "/inventory",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.updateInventory
);

router.get(
  "/inventory",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getInventory
);

// Requests
router.get(
  "/requests",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getBloodRequests
);

router.get(
  "/requests/history",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getRequestHistory
);

router.post(
  "/fulfill",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.fulfillRequest
);

router.get(
  "/dashboard",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getBloodBankDashboard
);

router.get(
  "/reports",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getBloodBankReports
);

router.get(
  "/nearby",
  auth,
  roleCheck("bloodbank"),
  approvalCheck,
  bloodBankController.getNearbyBloodBanks
);

module.exports = router;
