const express = require("express");
const router = express.Router();

const hospitalController = require("../controllers/hospitalController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const approvalCheck = require("../middleware/approvalCheck");

router.post(
  "/create-request",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.createBloodRequest
);

router.get(
  "/dashboard",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.getHospitalDashboardStats
);

router.get(
  "/requests",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.getHospitalRequests
);

router.get(
  "/requests/:requestId/responses",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.getRequestResponses
);

router.post(
  "/request/:requestId/cancel",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.cancelBloodRequest
);

router.post(
  "/requests/:requestId/cancel-donor",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.cancelDonor
);

router.post(
  "/fulfill-donation",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.fulfillDonation
);

router.get(
  "/history",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.getHospitalHistory
);

router.post(
  "/contact-support",
  auth,
  roleCheck("hospital"),
  hospitalController.contactSupport
);

router.put(
  "/disaster-toggle",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.toggleDisasterMode
);

router.get(
  "/disaster-status",
  auth,
  roleCheck("hospital"),
  approvalCheck,
  hospitalController.getDisasterStatus
);

module.exports = router;
