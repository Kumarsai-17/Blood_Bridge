const mongoose = require("mongoose");

/**
 * Single User model for ALL roles:
 * donor | hospital | bloodbank | admin | super_admin
 */

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      default: null
    },

    phone: {
      type: String,
      required: true
    },

    address: {
      type: String,
      default: null
    },

    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },

    emailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationOtp: {
      type: String,
      default: null
    },

    emailVerificationExpiry: {
      type: Date,
      default: null
    },

    role: {
      type: String,
      enum: ["donor", "hospital", "bloodbank", "admin", "super_admin"],
      required: true
    },

    // Region assignment for admins (super_admin can see all regions)
    region: {
      type: String,
      default: null // null means no region restriction (for super_admin)
    },

    // State and City for location-based filtering
    state: {
      type: String,
      default: null
    },

    city: {
      type: String,
      default: null
    },

    hospitalDetails: {
      registrationNumber: String,
      hospitalType: String,
      licenseAuthority: String,
      documentUrl: String,
      address: String,
      doctorInCharge: String
    },

    bloodBankDetails: {
      registrationId: String,
      licenseAuthority: String,
      certificateUrl: String,
      address: String
    },

    bloodGroup: {
      type: String,
      enum: ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"],
      default: null
    },

    // Lat/Lng kept for compatibility
    location: {
      lat: {
        type: Number,
        default: null
      },
      lng: {
        type: Number,
        default: null
      }
    },

    // GeoJSON field for MongoDB geospatial queries
    geo: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "donor";
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },

    mustChangePassword: {
      type: Boolean,
      default: false
    },

    donationHistory: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        request: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "BloodRequest"
        },
        hospital: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        bloodGroup: String,
        units: Number,
        // For donors: where they donated
        // For hospitals: who donated to them
        donorName: String,
        donorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        notes: String,
        donatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    lastDonationDate: {
      type: Date,
      default: null
    },





    emergencyContact: {
      type: String,
      default: null
    },

    medicalConditions: {
      type: String,
      default: null
    },

    geoFence: {
      center: {
        lat: Number,
        lng: Number
      },
      radius: {
        type: Number,
        default: 300
      }
    },

    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Sync lat/lng → GeoJSON
userSchema.pre("save", function (next) {
  if (
    this.location &&
    typeof this.location.lat === "number" &&
    typeof this.location.lng === "number" &&
    !isNaN(this.location.lat) &&
    !isNaN(this.location.lng)
  ) {
    this.geo = {
      type: "Point",
      coordinates: [this.location.lng, this.location.lat]
    };
  } else {
    this.geo = undefined;
  }
  next();
});

// Indexes
userSchema.index({ role: 1, isApproved: 1 });
userSchema.index({ geo: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
