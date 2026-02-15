const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const userController = require("../controllers/userController");

router.get("/profile", auth, userController.getProfile);
router.put("/profile", auth, userController.updateProfile);

router.get(
  "/all",
  auth,
  roleCheck("admin", "super_admin"),
  userController.getAllUsers
);

router.get(
  "/:id",
  auth,
  roleCheck("admin", "super_admin"),
  userController.getUserById
);

module.exports = router;
