const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");

const connectDB = require("./config/database");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const hospitalRoutes = require("./routes/hospital");
const bloodBankRoutes = require("./routes/bloodbank");
const donorRoutes = require("./routes/donor");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/upload");

const PORT = process.env.PORT || 5001;

connectDB().then(async () => {
  require("./cron/escalationJob");

  const existing = await User.findOne({ role: "super_admin" });
  if (!existing) {
    const password = "SuperAdmin@123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: "Super Admin",
      email: "superadmin@bloodbridge.com",
      phone: "0000000000",
      password: hashedPassword,
      role: "super_admin",
      isApproved: true,
      emailVerified: true,
      mustChangePassword: true
      // Don't set location for super_admin - it will default to null
    });

    console.log("✅ SUPER ADMIN CREATED");
  } else if (!existing.emailVerified) {
    existing.emailVerified = true;
    await existing.save();
    console.log("✅ SUPER ADMIN EMAIL VERIFIED");
  }
});

const app = express();


/* ✅ CORS CONFIG (FIXES YOUR ERROR) */
const allowedOrigins = [
  "http://localhost:5173", 
  "http://localhost:5174",
  "https://blood-bridge-mu.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // TEMPORARY: Allow all Vercel deployments
      if (origin && origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

/* IMPORTANT: allow preflight */
app.options("*", cors());
app.use(express.json());

// SAFE request logger
app.use((req, res, next) => {
  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = "***";
  if (safeBody.newPassword) safeBody.newPassword = "***";
  if (safeBody.otp) safeBody.otp = "***";

  console.log(`📨 ${req.method} ${req.path}`, {
    body: ["POST", "PUT"].includes(req.method) ? safeBody : undefined,
    query: Object.keys(req.query).length ? req.query : undefined,
    headers: {
      "content-type": req.headers["content-type"],
      authorization: req.headers.authorization ? "Bearer ***" : undefined
    }
  });
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "BloodBridge API running",
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is healthy",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/hospital", hospitalRoutes);
app.use("/api/bloodbank", bloodBankRoutes);
app.use("/api/donor", donorRoutes);
app.use("/api/user", userRoutes);
app.use("/api/upload", uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Debug route to test admin routes
app.get("/api/admin/test", (req, res) => {
  res.json({
    message: "Admin routes are working!",
    timestamp: new Date().toISOString()
  });
});

// Test reports endpoint without auth for debugging
app.get("/api/test-reports", async (req, res) => {
  try {
    const User = require("./models/User");
    const BloodRequest = require("./models/BloodRequest");
    
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: "donor" });
    const totalHospitals = await User.countDocuments({ role: "hospital" });
    const totalBloodBanks = await User.countDocuments({ role: "bloodbank" });
    const totalRequests = await BloodRequest.countDocuments();
    const pendingRequests = await BloodRequest.countDocuments({ status: "pending" });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: "fulfilled" });
    
    res.json({
      success: true,
      message: "Test reports data (no auth required)",
      data: {
        overview: {
          totalUsers,
          totalDonors,
          totalHospitals,
          totalBloodBanks,
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          pendingApprovals: 0
        },
        userDistribution: {
          donors: totalDonors,
          hospitals: totalHospitals,
          bloodBanks: totalBloodBanks,
          admins: totalUsers - totalDonors - totalHospitals - totalBloodBanks
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching test data",
      error: error.message
    });
  }
});

// Catch-all route for debugging 404s
app.use("*", (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
