// const jwt = require("jsonwebtoken");
// const asyncHandler = require("express-async-handler");
// const User = require("../models/userModel");

// // Middleware to verify JWT token
// const protect = asyncHandler(async (req, res, next) => {
//   let token;

//   // Check for Authorization header and Bearer token
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       // Verify token
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Find user by ID and exclude password
//       req.user = await User.findById(decoded._id).select("-password");

//       if (!req.user) {
//         res.status(401);
//         throw new Error("Not authorized, user not found");
//       }

//       next();
//     } catch (error) {
//       console.error("Token verification failed:", error.message);
//       res.status(401);
//       throw new Error("Not authorized, token invalid");
//     }
//   } else {
//     res.status(401);
//     throw new Error("Not authorized, no token provided");
//   }
// });

// module.exports = { protect };

const jwt = require("jsonwebtoken");
const User = require("../models/userModel"); // Your user model

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is set in your .env file

// Middleware to verify token
const protect = async (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from "Bearer <token>"

  console.log("Received token in middleware:", token); // Log the raw token

  // Check if token is present
  if (!token) {
    console.log("No token provided in request");
    return res
      .status(401)
      .json({ message: "No token provided, authorization denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded); // Log the decoded payload
    console.log(
      "Token expiration:",
      new Date(decoded.exp * 1000).toLocaleString()
    ); // Log expiration date
    console.log("Time left (ms):", decoded.exp * 1000 - Date.now()); // Log time left until expiration

    const user = await User.findById(decoded._id);
    if (!user) {
      console.log("User not found for ID:", decoded._id);
      return res
        .status(401)
        .json({ message: "User not found, authorization denied" });
    }

    // Attach user to request
    req.user = user;
    console.log("User authenticated:", user._id);
    console.log("User:", user);
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error("Token verification failed:", err.message); // Detailed error logging
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { protect };
