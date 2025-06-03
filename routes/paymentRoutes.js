const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
} = require("../controllers/paymentController");

router.post("/payments/initialize", initiatePayment);
router.get("/payments/verify", verifyPayment);

module.exports = router;
