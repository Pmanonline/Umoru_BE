const express = require("express");
const router = express.Router();
const {
  login,
  registerUser,
  registerAdmin,
  verifyAdminOTP,
  forgotPassword,
  resetPassword,
  handleGoogleLogin,
  handleFacebookLogin,
  handleTwitterLogin,
  refreshToken,
  getNewsletterSubscribers,
  NewLetterSubscribe,
  TwitterAuth,
} = require("../controllers/appController.js");
const { registerMail } = require("../controllers/mailer.js");
const { body, validationResult } = require("express-validator");

// Define routes without error handling
router.route("/register").post(registerUser);
router.route("/registerAdmin").post(registerAdmin);
router.route("/registerMail").post(registerMail);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verifyAdminOTP", verifyAdminOTP);
router.post("/google-login", handleGoogleLogin);
router.post("/facebook-login", handleFacebookLogin);
router.post("/twitter-login", handleTwitterLogin);
router.get("/auth/twitter/auth", TwitterAuth);
router.post("/refresh-token", refreshToken);
router.post("/newsletter-signup", NewLetterSubscribe);
router.get("/getNewsletterSubscribers", getNewsletterSubscribers);

module.exports = router;
