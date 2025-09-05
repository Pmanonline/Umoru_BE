// const express = require("express");
// const path = require("path");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const multer = require("multer"); // Kept for potential custom upload needs, but not used directly
// const dotenv = require("dotenv");
// const jwt = require("jsonwebtoken");
// const connectDB = require("./config/db.config");
// const mongoose = require("mongoose");
// const fileUpload = require("express-fileupload");
// const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");
// const session = require("express-session");
// const fs = require("fs");

// // Route imports
// const Routes = require("./routes/route.js");
// const UserRoutes = require("./routes/userRoutes.js");
// const AuthorRoutes = require("./routes/AuthorRoutes.js");
// const BlogRoutes = require("./routes/BlogRoutes.js");
// const comentRoutes = require("./routes/commentRoutes.js");
// const SpeakerRoutes = require("./routes/SpeakerRoutes.js");
// const eventRoutes = require("./routes/eventRoutes.js");
// const resourceRoutes = require("./routes/resourceRoutes.js");

// const app = express();

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// // CORS Configuration
// const allowedOrigin =
//   process.env.NODE_ENV === "production"
//     ? process.env.FRONTEND_URL || "*" // Fallback to wildcard if not set
//     : "http://localhost:5173";

// const corsOptions = {
//   origin: allowedOrigin,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true, // Allow cookies and authorization headers
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // Handle preflight requests

// // Middleware
// app.use(express.json({ limit: "50mb" })); // Parse JSON with a reasonable limit
// app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded data
// app.use(morgan("dev")); // HTTP request logger
// app.use(cookieParser()); // Parse cookies

// // Session middleware
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

// // File upload middleware (using express-fileupload)
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     abortOnLimit: true,
//     responseOnLimit: "File size limit exceeded (5MB)",
//   })
// );

// // Static file middleware
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory if it doesn't exist
// }
// app.use("/uploads", express.static(uploadsDir)); // Serve uploaded files

// // Routes
// app.use("/api", Routes);
// app.use("/api", UserRoutes);
// app.use("/api", AuthorRoutes);
// app.use("/api", BlogRoutes);
// app.use("/api", comentRoutes);
// app.use("/api", SpeakerRoutes);
// app.use("/api", eventRoutes);
// app.use("/api", resourceRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.json("This API is available!!...!!");
// });

// // Error handling middleware (must be last)
// app.use(errorHandlingMiddleware);

// // Server startup
// const PORT = process.env.PORT || 3001;
// const server = app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;

// const express = require("express");
// const path = require("path");
// const morgan = require("morgan");
// const cookieParser = require("cookie-parser");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const session = require("express-session");
// const fileUpload = require("express-fileupload");
// const fs = require("fs");

// const connectDB = require("./config/db.config");
// const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");

// // Route imports
// const Routes = require("./routes/route.js");
// const UserRoutes = require("./routes/userRoutes.js");
// const AuthorRoutes = require("./routes/AuthorRoutes.js");
// const BlogRoutes = require("./routes/BlogRoutes.js");
// const comentRoutes = require("./routes/commentRoutes.js");
// const SpeakerRoutes = require("./routes/SpeakerRoutes.js");
// const eventRoutes = require("./routes/eventRoutes.js");
// const resourceRoutes = require("./routes/resourceRoutes.js");
// const notificationRoutes = require("./routes/notificationRoutes.js");
// const BookingRoutes = require("./routes/BookingRoutes.js");

// const app = express();

// // Load env vars
// dotenv.config();

// // Connect to database
// connectDB();

// // CORS Configuration
// const allowedOrigin =
//   process.env.NODE_ENV === "production"
//     ? process.env.FRONTEND_URL || "*"
//     : "http://localhost:5173";

// const corsOptions = {
//   origin: allowedOrigin,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true,
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

// // Middleware
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(morgan("dev"));
// app.use(cookieParser());

// // Session middleware
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

// // File upload middleware (using express-fileupload)
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "/tmp/",
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     abortOnLimit: true,
//     responseOnLimit: "File size limit exceeded (5MB)",
//   })
// );

// // Static file middleware
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory if it doesn't exist
// }
// app.use("/uploads", express.static(uploadsDir)); // Serve uploaded files

// // 🚀 Routes
// app.use("/api", Routes);
// app.use("/api", UserRoutes);
// app.use("/api", AuthorRoutes);
// app.use("/api", BlogRoutes);
// app.use("/api", comentRoutes);
// app.use("/api", SpeakerRoutes);
// app.use("/api", eventRoutes);
// app.use("/api", resourceRoutes);
// app.use("/api", notificationRoutes);
// app.use("/api", BookingRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.json("This API is available!!...!!");
// });

// // Error handling middleware
// app.use(errorHandlingMiddleware);

// // ✅ Export app for Vercel
// module.exports = app;

// // ✅ Run only in local dev mode
// if (require.main === module) {
//   const PORT = process.env.PORT || 3001;
//   app.listen(PORT, () => {
//     console.log(
//       `\x1b[36mServer running on port ${PORT} [${
//         process.env.NODE_ENV || "development"
//       }]\x1b[0m`
//     );
//   });

//   process.on("unhandledRejection", (err) => {
//     console.log(`\x1b[31mUnhandled Rejection: ${err.message}\x1b[0m`);
//     process.exit(1);
//   });
// }
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const fileUpload = require("express-fileupload");

const connectDB = require("./config/db.config");
const { errorHandlingMiddleware } = require("./middlewares/errorHandling.js");

// Route imports
const Routes = require("./routes/route.js");
const UserRoutes = require("./routes/userRoutes.js");
const AuthorRoutes = require("./routes/AuthorRoutes.js");
const BlogRoutes = require("./routes/BlogRoutes.js");
const comentRoutes = require("./routes/commentRoutes.js");
const SpeakerRoutes = require("./routes/SpeakerRoutes.js");
const eventRoutes = require("./routes/eventRoutes.js");
const resourceRoutes = require("./routes/resourceRoutes.js");
const notificationRoutes = require("./routes/notificationRoutes.js");
const BookingRoutes = require("./routes/BookingRoutes.js");

const app = express();

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// CORS Configuration
const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL || "*"
    : "http://localhost:5173";

const corsOptions = {
  origin: allowedOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));
app.use(cookieParser());

// Session middleware
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

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // false for local dev
      maxAge: 3600000, // 1 hour
    },
  })
);
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    credentials: true, // Allow session cookies
  })
);

// File upload middleware
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    abortOnLimit: true,
    responseOnLimit: "File size limit exceeded (5MB)",
  })
);

// Routes
app.use("/api", Routes);
app.use("/api", UserRoutes);
app.use("/api", AuthorRoutes);
app.use("/api", BlogRoutes);
app.use("/api", comentRoutes);
app.use("/api", SpeakerRoutes);
app.use("/api", eventRoutes);
app.use("/api", resourceRoutes);
app.use("/api", notificationRoutes);
app.use("/api", BookingRoutes);

// Test route
app.get("/", (req, res) => {
  res.json("This API is available!!...");
});

// Error handling middleware
app.use(errorHandlingMiddleware);

// Export app for Vercel
module.exports = app;

// Run only in local dev mode
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(
      `\x1b[36mServer running on port ${PORT} [${
        process.env.NODE_ENV || "development"
      }]\x1b[0m`
    );
  });

  process.on("unhandledRejection", (err) => {
    console.log(`\x1b[31mUnhandled Rejection: ${err.message}\x1b[0m`);
    process.exit(1);
  });
}
