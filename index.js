const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db.config");
const mongoose = require("mongoose");
const formData = require("express-form-data");
const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
// const visitTrackerMiddleware = require("./middlewares/visitsTracker.js");

// Route imports
const Routes = require("./routes/route.js");
const UserRoutes = require("./routes/userRoutes.js");
const awardRoutes = require("./routes/awardRoutes.js");
const famousPeopleRoutes = require("./routes/famousPeopleRoutes.js");
const prideRoutes = require("./routes/prideRoutes.js");
const recommendedPersonRoute = require("./routes/recommendedPersonRoute.js");
const nomineeRoutes = require("./routes/nomineeRoutes.js");
const winnersRoutes = require("./routes/winnersRoutes.js");
const paymentRoutes = require("./routes/paymentRoutes.js");
const nominateRoutes = require("./routes/nominateRoutes.js");

const app = express();

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Add the middleware before your routes

// CORS Configuration
// const corsOptions = {
//   origin: "*", // Allow all origins
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: false, // Explicitly set to false
// };
// Determine the allowed origin based on environment
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL // e.g., your production frontend URL
    : "http://localhost:5173";

// CORS Configuration
const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow credentials (cookies, authorization headers)
};

app.use(express.json()); // For parsing JSON requests
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Configure express-form-data
app.use(
  formData.parse({
    autoFiles: true, // Automatically handle file uploads
    uploadDir: "uploads", // Temporary directory for files (create this directory)
    autoClean: true, // Automatically delete files after parsing
  })
);
app.use(formData.format()); // Format the parsed data
app.use(formData.stream()); // Stream files to the temporary directory
app.use(formData.union()); // Combine parsed data into req.body and req.files
app.use(morgan("dev"));

// 2. Basic middleware
app.use(cors(corsOptions));
app.options("*", cors());
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// 3. Session middleware (only once)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    },
  })
);

// 4. Static files middleware
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/insertImage", express.static(path.join(__dirname, "insertImage")));
app.use(express.static(path.join(__dirname, "public")));

// 5. Routes
app.use("/api", Routes);
app.use("/api", UserRoutes);
app.use("/api", awardRoutes);
app.use("/api", famousPeopleRoutes);
app.use("/api", prideRoutes);
app.use("/api", recommendedPersonRoute);
app.use("/api", nomineeRoutes);
app.use("/api", winnersRoutes);
app.use("/api", paymentRoutes);
app.use("/api", nominateRoutes);

// Test route
app.get("/", (req, res) => {
  res.json("This API is available!!...!!");
});

// 6. Error handling middleware (should be last)
app.use(errorHandlingMiddleware);

// Server startup
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("Unhandled Rejection:", err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
