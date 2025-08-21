// const express = require("express");
// const path = require("path");
// const morgan = require("morgan");
// const bodyParser = require("body-parser");
// const session = require("express-session");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const multer = require("multer");
// const dotenv = require("dotenv");
// const jwt = require("jsonwebtoken");
// const connectDB = require("./config/db.config");
// const mongoose = require("mongoose");
// const formData = require("express-form-data");
// const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
// const fileUpload = require("express-fileupload");
// // const visitTrackerMiddleware = require("./middlewares/visitsTracker.js");

// // Route imports
// const Routes = require("./routes/route.js");
// const UserRoutes = require("./routes/userRoutes.js");
// const AuthorRoutes = require("./routes/AuthorRoutes.js");
// const BlogRoutes = require("./routes/BlogRoutes.js");

// const app = express();

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// // Add the middleware before your routes

// // CORS Configuration
// // const corsOptions = {
// //   origin: "*", // Allow all origins
// //   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization"],
// //   credentials: false, // Explicitly set to false
// // };
// // Determine the allowed origin based on environment
// const allowedOrigin =
//   process.env.NODE_ENV === "production"
//     ? process.env.FRONTEND_URL // e.g., your production frontend URL
//     : "http://localhost:5173";

// // CORS Configuration
// const corsOptions = {
//   origin: allowedOrigin,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true, // Allow credentials (cookies, authorization headers)
// };

// app.use(express.json()); // For parsing JSON requests
// app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// // Configure express-form-data
// app.use(
//   formData.parse({
//     autoFiles: true, // Automatically handle file uploads
//     uploadDir: "uploads", // Temporary directory for files (create this directory)
//     autoClean: true, // Automatically delete files after parsing
//   })
// );
// app.use(formData.format()); // Format the parsed data
// app.use(formData.stream()); // Stream files to the temporary directory
// app.use(formData.union()); // Combine parsed data into req.body and req.files
// app.use(morgan("dev"));

// // 2. Basic middleware
// app.use(cors(corsOptions));
// app.options("*", cors());
// app.use(express.json({ limit: "50mb" }));
// app.use(cookieParser());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// // 3. Session middleware (only once)
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "your_session_secret",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     },
//   })
// );

// // 4. Static files middleware
// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// // app.use("/insertImage", express.static(path.join(__dirname, "insertImage")));
// // app.use(express.static(path.join(__dirname, "public")));

// // Standard Middleware
// app.use(express.json({ limit: "50mb" }));
// app.use(morgan("dev"));
// app.use(cookieParser());
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
// app.use(errorHandlingMiddleware);

// // Static Files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/insertImage", express.static(path.join(__dirname, "insertImage")));
// app.use(express.static(path.join(__dirname, "public")));
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//   })
// );
// // 5. Routes
// app.use("/api", Routes);
// app.use("/api", UserRoutes);
// app.use("/api", AuthorRoutes);
// app.use("/api", BlogRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.json("This API is available!!...!!");
// });

// // 6. Error handling middleware (should be last)
// app.use(errorHandlingMiddleware);

// // Server startup
// const PORT = process.env.PORT || 3001;
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
// });

// // Handle unhandled promise rejections
// process.on("unhandledRejection", (err, promise) => {
//   console.log("Unhandled Rejection:", err.message);
//   // Close server & exit process
//   server.close(() => process.exit(1));
// });

// module.exports = app;
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const multer = require("multer"); // Kept for potential custom upload needs, but not used directly
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const connectDB = require("./config/db.config");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
const session = require("express-session");
const fs = require("fs");

// Route imports
const Routes = require("./routes/route.js");
const UserRoutes = require("./routes/userRoutes.js");
const AuthorRoutes = require("./routes/AuthorRoutes.js");
const BlogRoutes = require("./routes/BlogRoutes.js");
const comentRoutes = require("./routes/commentRoutes.js");
const SpeakerRoutes = require("./routes/SpeakerRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const resourceRoutes = require("./routes/resourceRoutes.js");

const app = express();

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// CORS Configuration
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "*" // Fallback to wildcard if not set
    : "http://localhost:5173";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Handle preflight requests

// Middleware
app.use(express.json({ limit: "50mb" })); // Parse JSON with a reasonable limit
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded data
app.use(morgan("dev")); // HTTP request logger
app.use(cookieParser()); // Parse cookies

// Session middleware
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

// File upload middleware (using express-fileupload)
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded (5MB)",
  })
);

// Static file middleware
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory if it doesn't exist
}
app.use("/uploads", express.static(uploadsDir)); // Serve uploaded files

// Routes
app.use("/api", Routes);
app.use("/api", UserRoutes);
app.use("/api", AuthorRoutes);
app.use("/api", BlogRoutes);
app.use("/api", comentRoutes);
app.use("/api", SpeakerRoutes);
app.use("/api", eventRoutes);
app.use("/api", resourceRoutes);

// Test route
app.get("/", (req, res) => {
  res.json("This API is available!!...!!");
});

// Error handling middleware (must be last)
app.use(errorHandlingMiddleware);

// Server startup
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(
    `\x1b[36mServer running on port ${PORT} [${
      process.env.NODE_ENV || "production"
    }]\x1b[0m`
  ); // Teal color for consistency
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(
    `\x1b[31mUnhandled Rejection: ${err.message}\x1b[0m` // Red for errors
  );
  server.close(() => process.exit(1));
});

module.exports = app;
