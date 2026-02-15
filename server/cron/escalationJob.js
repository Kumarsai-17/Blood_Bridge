const cron = require("node-cron");
const BloodRequest = require("../models/BloodRequest");
const User = require("../models/User");
const { findEligibleDonors } = require("../services/matchingService");
const { sendNotification } = require("../services/notificationService");

const SEARCH_RADII = [20, 30, 40, 50];

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("⏱ Running auto escalation job");

    const pendingRequests = await BloodRequest.find({
      status: "pending",
      searchStage: { $lt: 4 }
    });

    for (const request of pendingRequests) {
      if (Date.now() - request.createdAt < 5 * 60 * 1000) continue;

      const accepted = request.responses.some(r => r.status === "accepted");
      if (accepted) continue;

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
          `Blood needed within ${request.searchRadiusKm} km.

Hospital: ${hospital.name}`
        );

        request.notifiedDonors.push(donor._id);
      }

      await request.save();
    }
  } catch (error) {
    console.error("ESCALATION JOB ERROR:", error);
  }
});
