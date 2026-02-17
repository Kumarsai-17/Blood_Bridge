const express = require("express");
const router = express.Router();

const donorController = require("../controllers/donorController");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const { validateCoordinates, sanitizeLocationData } = require("../middleware/coordinateValidation");

router.post(
  "/respond",
  auth,
  roleCheck("donor"),
  donorController.respondToRequest
);

router.get(
  "/request/:requestId",
  auth,
  roleCheck("donor"),
  donorController.getRequestDetails
);

router.get(
  "/check-arrival/:requestId",
  auth,
  roleCheck("donor"),
  donorController.checkArrival
);

router.get(
  "/dashboard",
  auth,
  roleCheck("donor"),
  donorController.getDonorDashboard
);

router.get(
  "/profile",
  auth,
  roleCheck("donor"),
  donorController.getDonorProfile
);

router.put(
  "/profile",
  auth,
  roleCheck("donor"),
  sanitizeLocationData,
  donorController.updateDonorProfile
);

router.get(
  "/nearby-hospitals",
  auth,
  roleCheck("donor"),
  validateCoordinates,
  donorController.getNearbyHospitals
);

// OpenStreetMap hospitals (free alternative)
router.get(
  "/nearby-hospitals-osm",
  auth,
  roleCheck("donor"),
  validateCoordinates,
  donorController.getNearbyHospitalsOSM
);

// Combined hospitals from all sources
router.get(
  "/all-nearby-hospitals",
  auth,
  roleCheck("donor"),
  validateCoordinates,
  donorController.getAllNearbyHospitals
);

// Get specific hospital details from OSM
router.get(
  "/hospital-details-osm/:type/:hospitalId",
  auth,
  roleCheck("donor"),
  donorController.getHospitalDetailsOSM
);

router.get(
  "/requests",
  auth,
  roleCheck("donor"),
  donorController.getBloodRequests
);

router.get(
  "/accepted-requests",
  auth,
  roleCheck("donor"),
  donorController.getAcceptedRequests
);

router.delete(
  "/accepted-requests/:requestId",
  auth,
  roleCheck("donor"),
  donorController.cancelAcceptedRequest
);

router.get(
  "/history",
  auth,
  roleCheck("donor"),
  donorController.getDonationHistory
);

router.get(
  "/disaster-status",
  auth,
  roleCheck("donor"),
  donorController.getDisasterStatus
);

router.get(
  "/nearby-bloodbanks",
  auth,
  roleCheck("donor"),
  validateCoordinates,
  donorController.getNearbyBloodBanks
);

// Notifications routes
router.get(
  "/notifications",
  auth,
  roleCheck("donor"),
  donorController.getNotifications
);

router.patch(
  "/notifications/:id/read",
  auth,
  roleCheck("donor"),
  donorController.markNotificationAsRead
);

router.patch(
  "/notifications/mark-all-read",
  auth,
  roleCheck("donor"),
  donorController.markAllNotificationsAsRead
);

router.delete(
  "/notifications/:id",
  auth,
  roleCheck("donor"),
  donorController.deleteNotification
);

// Data seeding routes
router.post(
  "/seed-real-data",
  auth,
  roleCheck("donor"),
  donorController.seedRealData
);

router.post(
  "/seed-google-places",
  auth,
  roleCheck("donor"),
  donorController.seedFromGooglePlaces
);

// Cache management routes
router.get(
  "/cache-stats",
  auth,
  roleCheck("donor"),
  donorController.getCacheStats
);

router.delete(
  "/cache",
  auth,
  roleCheck("donor"),
  donorController.clearCache
);

module.exports = router;