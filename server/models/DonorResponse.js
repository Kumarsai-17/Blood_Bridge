const mongoose = require("mongoose");

const donorResponseSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BloodRequest",
      required: true
    },

    status: {
      type: String,
      enum: ["accepted", "declined", "completed", "cancelled"],
      required: true
    },

    responseTime: {
      type: Date,
      default: Date.now
    },

    estimatedArrivalTime: {
      type: Date,
      default: null
    },

    actualArrivalTime: {
      type: Date,
      default: null
    },

    completedAt: {
      type: Date,
      default: null
    },

    cancelledAt: {
      type: Date,
      default: null
    },

    cancelReason: {
      type: String,
      default: null
    },

    notes: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

donorResponseSchema.index(
  { donor: 1, bloodRequest: 1 },
  { unique: true }
);

module.exports = mongoose.model("DonorResponse", donorResponseSchema);
