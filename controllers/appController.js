// const UserModel = require("../models/userModel");
// const NewsletterSubscription = require("../models/NewsLetterModel");
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const otpGenerator = require("otp-generator");
// const nodemailer = require("nodemailer");
// const dotenv = require("dotenv");
// const validator = require("validator");
// const JWT_SECRET = process.env.JWT_SECRET || "Qwe123123";
// const crypto = require("crypto");
// const axios = require("axios");
// const { TwitterApi } = require("twitter-api-v2");
// dotenv.config();
// const {
//   generateAccessToken,
//   generateRefreshToken,
// } = require("../middlewares/tokenUtils");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// const generateOTP = () => {
//   return otpGenerator.generate(6, {
//     digits: true,
//     upperCase: false,
//     specialChars: false,
//     alphabets: false,
//   });
// };
// const sendOTPEmail = async (email, otp) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Login Authentication OTP",
//     html: `
//       <h2>Login Authentication Code</h2>
//       <p>Your one-time password (OTP) for login is:</p>
//       <h3>${otp}</h3>
//       <p>This code will expire in 10 minutes.</p>
//       <p>If you didn't request this code, please ignore this email.</p>
//     `,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     return true;
//   } catch (error) {
//     console.error("Error sending OTP email:", error);
//     throw new Error("Failed to send OTP email");
//   }
// };

// const registerUser = async (req, res) => {
//   const { email, password, username } = req.body;

//   try {
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     if (!password || !username) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const passwordRegex = /^.{6,}$/;
//     if (!passwordRegex.test(password)) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 digits long" });
//     }

//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "Existing User with this Email" });
//     }

//     const existingUserName = await UserModel.findOne({ username });
//     if (existingUserName) {
//       return res
//         .status(400)
//         .json({ message: "Existing User with this Username" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new UserModel({
//       email,
//       password: hashedPassword,
//       username,
//       role: "user",
//     });

//     await newUser.save();

//     const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(201).json({
//       token,
//       user: {
//         _id: newUser._id,
//         email: newUser.email,
//         username: newUser.username,
//         role: newUser.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     res.status(500).json({ message: error.message });
//   }
// };

// const registerAdmin = async (req, res) => {
//   const { email, password, username } = req.body;

//   try {
//     if (!validator.isEmail(email)) {
//       return res.status(400).json({ message: "Invalid email format" });
//     }

//     if (!password || !username) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const passwordRegex = /^.{6,}$/;
//     if (!passwordRegex.test(password)) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 digits long" });
//     }

//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newAdmin = new UserModel({
//       email,
//       password: hashedPassword,
//       username,
//       role: "admin",
//     });

//     await newAdmin.save();

//     const token = jwt.sign({ _id: newAdmin._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(201).json({
//       token,
//       user: {
//         _id: newAdmin._id,
//         email: newAdmin.email,
//         username: newAdmin.username,
//         role: newAdmin.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error during admin registration:", error);
//     if (error.code === 11000) {
//       return res.status(400).json({ message: "User already exists" });
//     }
//     res.status(500).json({ message: error.message });
//   }
// };

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const userData = {
//       _id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//     };

//     if (user.role === "admin") {
//       try {
//         const otp = generateOTP();
//         user.otp = otp;
//         user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
//         await user.save();

//         await sendOTPEmail(email, otp);

//         return res.status(200).json({
//           message: "OTP sent to your email",
//           requireOTP: true,
//           user: userData,
//         });
//       } catch (error) {
//         console.error("OTP generation/sending error:", error);
//         return res.status(500).json({ message: "Failed to send OTP" });
//       }
//     }

//     // Generate access and refresh tokens
//     const accessToken = generateAccessToken(user._id);
//     const refreshToken = generateRefreshToken(user._id);

//     // Store refresh token in user document
//     user.refreshToken = refreshToken;

//     // log token values
//     console.log(
//       `[Login] Tokens issued for user ${
//         user._id
//       } at ${new Date().toISOString()} (WAT):`
//     );
//     console.log(`  Access Token: ${accessToken.substring(0, 10)}...`);
//     console.log(`  Refresh Token: ${refreshToken.substring(0, 10)}...`);
//     await user.save();

//     return res.status(200).json({
//       accessToken,
//       refreshToken,
//       user: userData,
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// const refreshToken = async (req, res) => {
//   const { refreshToken: refreshTokenFromClient } = req.body;

//   if (!refreshTokenFromClient) {
//     return res.status(401).json({ message: "Refresh token is required" });
//   }

//   try {
//     // Verify refresh token
//     const decoded = jwt.verify(refreshTokenFromClient, JWT_SECRET);
//     const user = await UserModel.findOne({
//       _id: decoded._id,
//       refreshToken: refreshTokenFromClient,
//     });

//     if (!user) {
//       return res.status(403).json({ message: "Invalid refresh token" });
//     }

//     // Generate new access token
//     const newAccessToken = generateAccessToken(user._id);

//     res.status(200).json({
//       accessToken: newAccessToken,
//       user: {
//         _id: user._id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Refresh token error:", error);
//     res.status(403).json({ message: "Invalid or expired refresh token" });
//   }
// };

// const verifyAdminOTP = async (req, res) => {
//   const { userId, email, otp } = req.body;

//   if (!otp) {
//     return res.status(400).json({ message: "OTP is required" });
//   }

//   try {
//     let query = {
//       role: "admin",
//       otp,
//       otpExpiresAt: { $gt: Date.now() },
//     };

//     if (userId) {
//       query._id = userId;
//     } else if (email) {
//       query.email = email;
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Either userId or email is required" });
//     }

//     const user = await UserModel.findOne(query);

//     if (!user) {
//       return res.status(401).json({
//         message: "Invalid or expired OTP",
//       });
//     }

//     if (user.otp !== otp) {
//       return res.status(401).json({
//         message: "Invalid OTP",
//       });
//     }

//     // Generate new token
//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "3d",
//     });

//     // Clear OTP after successful verification
//     user.otp = undefined;
//     user.otpExpiresAt = undefined;
//     await user.save();

//     // Return consistent response structure
//     return res.status(200).json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.error("Error during OTP verification:", error);
//     return res.status(500).json({
//       message: "Internal server error",
//       details: error.message,
//     });
//   }
// };

// const logout = (req, res) => {
//   res.status(200).json({ message: "Successfully logged out" });
// };

// const forgotPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const resetToken = crypto.randomBytes(20).toString("hex");
//     user.resetPasswordToken = resetToken;
//     user.resetPasswordExpires = Date.now() + 3600000;
//     await user.save();

//     console.log("Reset token:", resetToken);
//     console.log("Token expiration time:", user.resetPasswordExpires);

//     const frontendURL = process.env.FRONTEND_URL;

//     // Include both token and email in the reset URL as query parameters
//     const resetUrl = `${frontendURL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
//       email
//     )}`;
//     const mailOptions = {
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Password Reset",
//       text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//         Please click on the following link, or paste this into your browser to complete the process:\n\n
//         ${resetUrl}\n\n
//         If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//     };

//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Reset password email sent" });
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     res.status(500).json({ message: "Error in forgot password process" });
//   }
// };

// const resetPassword = async (req, res) => {
//   const { token } = req.params;
//   const { password } = req.body;

//   try {
//     const user = await UserModel.findOne({
//       resetPasswordToken: token,
//       resetPasswordExpires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ message: "Password reset token is invalid or has expired" });
//     }

//     const passwordRegex = /^.{6,}$/;
//     if (!passwordRegex.test(password)) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters long" });
//     }

//     user.password = await bcrypt.hash(password, 10);
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     const mailOptions = {
//       to: user.email,
//       from: process.env.EMAIL_USER,
//       subject: "Your password has been changed",
//       text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
//     };
//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: "Password has been reset" });
//   } catch (error) {
//     console.error("Reset password error:", error);
//     res.status(500).json({ message: "Error in reset password process" });
//   }
// };

// const twitterClient = new TwitterApi({
//   clientId: process.env.TWITTER_CLIENT_ID,
//   clientSecret: process.env.TWITTER_CLIENT_SECRET,
// });

// // Google Login
// const handleGoogleLogin = async (req, res) => {
//   const { credential } = req.body;
//   try {
//     const decoded = jwt.decode(credential);
//     if (!decoded)
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid Google token" });

//     let user = await UserModel.findOne({ email: decoded.email });
//     if (user && user.role === "admin")
//       return res.status(403).json({
//         success: false,
//         message:
//           "Admin accounts cannot login through Google authentication. Please use the standard login route.",
//       });

//     if (!user) {
//       user = new UserModel({
//         email: decoded.email,
//         username: decoded.name,
//         googleId: decoded.sub,
//         picture: decoded.picture,
//         role: "user",
//       });
//       await user.save();
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//         picture: user.picture,
//       },
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Error processing Google login" });
//   }
// };

// // Facebook Login
// const handleFacebookLogin = async (req, res) => {
//   const { accessToken } = req.body;
//   try {
//     const { data } = await axios.get(
//       `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${accessToken}`
//     );

//     if (!data.email) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Email not provided by Facebook" });
//     }

//     let user = await UserModel.findOne({ email: data.email });
//     if (user && user.role === "admin") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Admin accounts cannot login through Facebook authentication. Please use the standard login route.",
//       });
//     }

//     if (!user) {
//       user = new UserModel({
//         email: data.email,
//         username: data.name,
//         facebookId: data.id,
//         picture: data.picture?.data?.url,
//         role: "user",
//       });
//       await user.save();
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         email: user.email,
//         username: user.username,
//         role: user.role,
//         picture: user.picture,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Facebook login error:",
//       error.response?.data || error.message
//     );
//     res
//       .status(500)
//       .json({ success: false, message: "Error processing Facebook login" });
//   }
// };

// // Twitter Login (OAuth 2.0 with PKCE)
// const handleTwitterLogin = async (req, res) => {
//   const { code, codeVerifier } = req.body;
//   try {
//     const { accessToken } = await twitterClient.loginWithOAuth2({
//       code,
//       codeVerifier,
//       redirectUri: process.env.TWITTER_REDIRECT_URI,
//     });

//     const twitterUser = await twitterClient.v2.me({
//       "user.fields": "id,name,username,profile_image_url",
//     });

//     let user = await UserModel.findOne({ twitterId: twitterUser.data.id });
//     if (user && user.role === "admin") {
//       return res.status(403).json({
//         success: false,
//         message:
//           "Admin accounts cannot login through Twitter authentication. Please use the standard login route.",
//       });
//     }

//     if (!user) {
//       user = new UserModel({
//         twitterId: twitterUser.data.id,
//         username: twitterUser.data.name,
//         picture: twitterUser.data.profile_image_url,
//         role: "user",
//       });
//       await user.save();
//     }

//     const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d",
//     });

//     res.status(200).json({
//       success: true,
//       token,
//       user: {
//         _id: user._id,
//         username: user.username,
//         role: user.role,
//         picture: user.picture,
//       },
//     });
//   } catch (error) {
//     console.error(
//       "Twitter login error:",
//       error.response?.data || error.message
//     );
//     res
//       .status(500)
//       .json({ success: false, message: "Error processing Twitter login" });
//   }
// };

// // Twitter OAuth 2.0 Authorization URL
// const TwitterAuth = async (req, res) => {
//   const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
//     process.env.TWITTER_REDIRECT_URI,
//     {
//       scope: ["tweet.read", "users.read"],
//     }
//   );

//   // Store codeVerifier in session or secure cookie
//   req.session.twitterCodeVerifier = codeVerifier;
//   req.session.twitterState = state;

//   res.json({ url });
// };

// const NewLetterSubscribe = async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ message: "Email is required." });
//   }

//   try {
//     const subscription = new NewsletterSubscription({ email });
//     await subscription.save();
//     res.status(201).json({ message: "Subscription successful!" });
//   } catch (error) {
//     if (error.code === 11000) {
//       return res.status(409).json({ message: "Email already subscribed." });
//     }
//     console.error(error);
//     res.status(500).json({ message: "An error occurred. Please try again." });
//   }
// };

// const getNewsletterSubscribers = async (req, res) => {
//   try {
//     const today = new Date();

//     const weekStart = moment().subtract(7, "days").toDate();
//     const monthStart = moment().subtract(30, "days").toDate();
//     const prevMonthStart = moment().subtract(60, "days").toDate();

//     const totalSubscribers = await NewsletterSubscription.countDocuments();

//     const weeklySubscribers = await NewsletterSubscription.countDocuments({
//       createdAt: { $gte: weekStart },
//     });

//     const monthlySubscribers = await NewsletterSubscription.countDocuments({
//       createdAt: { $gte: monthStart },
//     });

//     const prevMonthSubscribers = await NewsletterSubscription.countDocuments({
//       createdAt: {
//         $gte: prevMonthStart,
//         $lt: monthStart,
//       },
//     });

//     const weeklyBreakdown = await NewsletterSubscription.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: weekStart },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//     ]);

//     const monthlyBreakdown = await NewsletterSubscription.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: monthStart },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { _id: 1 },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         totalSubscribers,
//         weeklySubscribers,
//         monthlySubscribers,
//         prevMonthSubscribers,
//         weeklyBreakdown,
//         monthlyBreakdown,
//         growthRate: {
//           monthly: (
//             ((monthlySubscribers - prevMonthSubscribers) /
//               prevMonthSubscribers) *
//             100
//           ).toFixed(2),
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching newsletter subscribers:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching subscriber data",
//       error: error.message,
//     });
//   }
// };
// module.exports = {
//   registerUser,
//   registerAdmin,
//   login,
//   forgotPassword,
//   resetPassword,
//   verifyAdminOTP,
//   handleGoogleLogin,
//   handleFacebookLogin,
//   handleTwitterLogin,
//   logout,
//   refreshToken,
//   getNewsletterSubscribers,
//   NewLetterSubscribe,
//   TwitterAuth,
// };

const UserModel = require("../models/userModel");
const NewsletterSubscription = require("../models/NewsLetterModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const validator = require("validator");
const JWT_SECRET = process.env.JWT_SECRET || "Qwe123123";
const crypto = require("crypto");
const axios = require("axios");
const TwitterSession = require("../models/twitterSessionModel");
const { TwitterApi } = require("twitter-api-v2");
dotenv.config();
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/tokenUtils");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    upperCase: false,
    specialChars: false,
    alphabets: false,
  });
};
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Login Authentication OTP",
    html: `
      <h2>Login Authentication Code</h2>
      <p>Your one-time password (OTP) for login is:</p>
      <h3>${otp}</h3>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

const registerUser = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordRegex = /^.{6,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 digits long" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Existing User with this Email" });
    }

    const existingUserName = await UserModel.findOne({ username });
    if (existingUserName) {
      return res
        .status(400)
        .json({ message: "Existing User with this Username" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      username,
      role: "user",
    });

    await newUser.save();

    const token = jwt.sign({ _id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const registerAdmin = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const passwordRegex = /^.{6,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new UserModel({
      email,
      password: hashedPassword,
      username,
      role: "admin",
    });

    await newAdmin.save();

    const token = jwt.sign({ _id: newAdmin._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({
      token,
      user: {
        _id: newAdmin._id,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error during admin registration:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "User already exists" });
    }
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    if (user.role === "admin") {
      try {
        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        await sendOTPEmail(email, otp);

        return res.status(200).json({
          message: "OTP sent to your email",
          requireOTP: true,
          user: userData,
        });
      } catch (error) {
        console.error("OTP generation/sending error:", error);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    console.log(
      `[Login] Tokens issued for user ${
        user._id
      } at ${new Date().toISOString()} (WAT):`
    );
    console.log(`  Access Token: ${accessToken.substring(0, 10)}...`);
    console.log(`  Refresh Token: ${refreshToken.substring(0, 10)}...`);
    await user.save();

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const refreshToken = async (req, res) => {
  const { refreshToken: refreshTokenFromClient } = req.body;

  if (!refreshTokenFromClient) {
    return res.status(401).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = jwt.verify(refreshTokenFromClient, JWT_SECRET);
    const user = await UserModel.findOne({
      _id: decoded._id,
      refreshToken: refreshTokenFromClient,
    });

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

const verifyAdminOTP = async (req, res) => {
  const { userId, email, otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "OTP is required" });
  }

  try {
    let query = {
      role: "admin",
      otp,
      otpExpiresAt: { $gt: Date.now() },
    };

    if (userId) {
      query._id = userId;
    } else if (email) {
      query.email = email;
    } else {
      return res
        .status(400)
        .json({ message: "Either userId or email is required" });
    }

    const user = await UserModel.findOne(query);

    if (!user) {
      return res.status(401).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        message: "Invalid OTP",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({
      message: "Internal server error",
      details: error.message,
    });
  }
};

const logout = (req, res) => {
  res.status(200).json({ message: "Successfully logged out" });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    console.log("Reset token:", resetToken);
    console.log("Token expiration time:", user.resetPasswordExpires);

    const frontendURL = process.env.FRONTEND_URL;

    const resetUrl = `${frontendURL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
      email
    )}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        ${resetUrl}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Reset password email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Error in forgot password process" });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    const passwordRegex = /^.{6,}$/;
    if (!passwordRegex.test(password)) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Your password has been changed",
      text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Error in reset password process" });
  }
};

const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

// Google Login
const handleGoogleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const decoded = jwt.decode(credential);
    if (!decoded)
      return res
        .status(400)
        .json({ success: false, message: "Invalid Google token" });

    let user = await UserModel.findOne({ email: decoded.email });
    if (user && user.role === "admin")
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot login through Google authentication. Please use the standard login route.",
      });

    if (!user) {
      user = new UserModel({
        email: decoded.email,
        username: decoded.name,
        googleId: decoded.sub,
        picture: decoded.picture,
        role: "user",
      });
      await user.save();
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error processing Google login" });
  }
};

// Facebook Login
const handleFacebookLogin = async (req, res) => {
  const { accessToken } = req.body;
  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    if (!data.email) {
      return res
        .status(400)
        .json({ success: false, message: "Email not provided by Facebook" });
    }

    let user = await UserModel.findOne({ email: data.email });
    if (user && user.role === "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin accounts cannot login through Facebook authentication. Please use the standard login route.",
      });
    }

    if (!user) {
      user = new UserModel({
        email: data.email,
        username: data.name,
        facebookId: data.id,
        picture: data.picture?.data?.url,
        role: "user",
      });
      await user.save();
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error(
      "Facebook login error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ success: false, message: "Error processing Facebook login" });
  }
};

const NewLetterSubscribe = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const subscription = new NewsletterSubscription({ email });
    await subscription.save();
    res.status(201).json({ message: "Subscription successful!" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already subscribed." });
    }
    console.error(error);
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
};

const getNewsletterSubscribers = async (req, res) => {
  try {
    const today = new Date();

    const weekStart = moment().subtract(7, "days").toDate();
    const monthStart = moment().subtract(30, "days").toDate();
    const prevMonthStart = moment().subtract(60, "days").toDate();

    const totalSubscribers = await NewsletterSubscription.countDocuments();

    const weeklySubscribers = await NewsletterSubscription.countDocuments({
      createdAt: { $gte: weekStart },
    });

    const monthlySubscribers = await NewsletterSubscription.countDocuments({
      createdAt: { $gte: monthStart },
    });

    const prevMonthSubscribers = await NewsletterSubscription.countDocuments({
      createdAt: {
        $gte: prevMonthStart,
        $lt: monthStart,
      },
    });

    const weeklyBreakdown = await NewsletterSubscription.aggregate([
      {
        $match: {
          createdAt: { $gte: weekStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthlyBreakdown = await NewsletterSubscription.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubscribers,
        weeklySubscribers,
        monthlySubscribers,
        prevMonthSubscribers,
        weeklyBreakdown,
        monthlyBreakdown,
        growthRate: {
          monthly: (
            ((monthlySubscribers - prevMonthSubscribers) /
              prevMonthSubscribers) *
            100
          ).toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching subscriber data",
      error: error.message,
    });
  }
};

// Backend: Fixed PKCE generation and Twitter auth

const generatePKCE = () => {
  const verifierBytes = crypto.randomBytes(32);
  const verifier = verifierBytes
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const challenge = crypto
    .createHash("sha256")
    .update(verifier, "ascii")
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return { verifier, challenge };
};

const TwitterAuth = async (req, res) => {
  try {
    const redirectUri =
      req.query.redirectUri || process.env.TWITTER_REDIRECT_URI;
    if (!redirectUri) {
      return res.status(400).json({ message: "Redirect URI is required" });
    }

    // Generate PKCE pair and state
    const { verifier, challenge } = generatePKCE();
    const state = crypto.randomBytes(16).toString("hex");

    // Store PKCE data in database with expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean up old sessions first
    await TwitterSession.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    // Store new session
    await TwitterSession.create({
      state,
      codeVerifier: verifier,
      codeChallenge: challenge,
      redirectUri,
      expiresAt,
    });

    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const authUrl = twitterClient.generateOAuth2AuthLink(redirectUri, {
      scope: ["tweet.read", "users.read", "offline.access"],
      codeChallenge: challenge,
      codeChallengeMethod: "S256",
      state,
    });

    console.log("Twitter Auth Setup:", {
      redirectUri,
      state,
      challengeUsed: challenge.substring(0, 10) + "...",
      url: authUrl.url.substring(0, 100) + "...",
    });

    res.json({
      url: authUrl.url,
      state,
    });
  } catch (error) {
    console.error("Twitter auth setup error:", error);
    res.status(500).json({ message: "Failed to setup Twitter authentication" });
  }
};

const handleTwitterLogin = async (req, res) => {
  const { code, state, redirectUri } = req.body;

  if (!code || !state || !redirectUri) {
    return res.status(400).json({
      message:
        "Missing required parameters: code, state, and redirectUri are required",
    });
  }

  try {
    // Retrieve stored session data from database
    const session = await TwitterSession.findOne({
      state,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      console.error("No valid session found for state:", state);
      return res.status(400).json({
        message: "Invalid or expired authentication session",
      });
    }

    console.log("Found valid session for state:", state);

    // Verify redirect URI matches
    if (session.redirectUri !== redirectUri) {
      await TwitterSession.deleteOne({ _id: session._id });
      return res.status(400).json({
        message: "Redirect URI mismatch",
      });
    }

    const { codeVerifier } = session;

    // Delete the session immediately after retrieving data
    await TwitterSession.deleteOne({ _id: session._id });

    // Create Twitter client for token exchange
    const twitterClient = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    console.log("Attempting token exchange with:", {
      code: code.substring(0, 10) + "...",
      verifier: codeVerifier.substring(0, 10) + "...",
      redirectUri,
    });

    // Exchange code for tokens using the stored verifier
    const tokenResult = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier, // This must match the verifier used to generate the challenge
      redirectUri,
    });

    console.log("Token exchange successful");

    // Get user data
    const authenticatedClient = new TwitterApi(tokenResult.accessToken);
    const userResult = await authenticatedClient.v2.me({
      "user.fields": "id,name,username,profile_image_url",
    });

    if (!userResult.data) {
      throw new Error("Failed to fetch user data from Twitter");
    }

    const { id, name, username, profile_image_url } = userResult.data;

    // Find or create user in your database
    let dbUser = await UserModel.findOne({ twitterId: id });
    if (!dbUser) {
      dbUser = new UserModel({
        twitterId: id,
        username: name || username,
        picture: profile_image_url,
        role: "user",
      });
      await dbUser.save();
    }

    // Generate your app's tokens
    const accessToken = generateAccessToken(dbUser._id);
    const refreshToken = generateRefreshToken(dbUser._id);

    dbUser.refreshToken = refreshToken;
    await dbUser.save();

    console.log("Twitter login successful for user:", dbUser._id);

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        _id: dbUser._id,
        username: dbUser.username,
        role: dbUser.role,
        picture: dbUser.picture,
      },
    });
  } catch (error) {
    console.error("Twitter login error:", error);

    // Clean up any remaining session data
    if (state) {
      await TwitterSession.deleteMany({ state }).catch(console.error);
    }

    res.status(500).json({
      message: "Twitter authentication failed",
      ...(process.env.NODE_ENV === "development" && {
        details: error.message,
        errorData: error.data,
      }),
    });
  }
};

module.exports = {
  registerUser,
  registerAdmin,
  login,
  forgotPassword,
  resetPassword,
  verifyAdminOTP,
  handleGoogleLogin,
  handleFacebookLogin,
  handleTwitterLogin,
  logout,
  refreshToken,
  getNewsletterSubscribers,
  NewLetterSubscribe,
  TwitterAuth,
};
