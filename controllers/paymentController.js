const axios = require("axios");
const Donation = require("../models/donationModel");
const asyncHandler = require("express-async-handler");
const nodemailer = require("nodemailer");

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send appreciation email
const sendAppreciationEmail = async (donation) => {
  try {
    const mailOptions = {
      from: `"Pride of Nigeria Fund" <${process.env.EMAIL_USER}>`,
      to: donation.email,
      subject: "Thank You for Your Donation!",
      html: `
        <h2>Dear ${donation.name},</h2>
        <p>Thank you for your generous donation of ₦${donation.amount.toLocaleString()} to the Pride of Nigeria Fund!</p>
        <p>Your support for "${
          donation.program
        }" helps us empower Nigeria's unsung heroes and create lasting impact.</p>
        <p><strong>Donation Details:</strong></p>
        <ul>
          <li>Amount: ₦${donation.amount.toLocaleString()}</li>
          <li>Program: ${donation.program}</li>
          <li>Reference: ${donation.paymentReference}</li>
          <li>Date: ${donation.paymentDate.toLocaleDateString()}</li>
        </ul>
        <p>We deeply appreciate your contribution!</p>
        <p>Warm regards,<br/>The Pride of Nigeria Fund Team</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Appreciation email sent to ${donation.email}`);
  } catch (error) {
    console.error(
      `Failed to send appreciation email to ${donation.email}:`,
      error.message
    );
  }
};

// Initialize Paystack payment
const initiatePayment = asyncHandler(async (req, res) => {
  const { name, email, phone, amount, program } = req.body;

  // Validate required fields
  if (!name || !email || !amount || !program) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }
  if (amount < 100) {
    return res.status(400).json({
      success: false,
      message: "Donation amount must be at least ₦100",
    });
  }

  // Create donation record
  const donation = new Donation({
    name,
    email,
    phone,
    amount,
    program,
    paymentStatus: "pending",
  });
  await donation.save();

  // Initialize Paystack payment
  const paystackResponse = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: amount * 100, // Convert to kobo
      callback_url: `${process.env.FRONTEND_URL}/donation/verify`,
      metadata: { donationId: donation._id.toString() },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { authorization_url, reference } = paystackResponse.data.data;

  // Update donation with reference
  donation.paymentReference = reference;
  await donation.save();

  res.json({ success: true, authorization_url, reference });
});

// Verify Paystack payment
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    return res
      .status(400)
      .json({ success: false, message: "No reference provided" });
  }

  try {
    const verification = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = verification.data.data;
    const donationId = paymentData.metadata.donationId;

    if (paymentData.status !== "success") {
      await Donation.findByIdAndUpdate(donationId, { paymentStatus: "failed" });
      return res
        .status(400)
        .json({ success: false, message: "Payment not successful" });
    }

    const donation = await Donation.findByIdAndUpdate(
      donationId,
      {
        paymentStatus: "completed",
        paymentReference: reference,
        paymentDate: new Date(),
        paymentMethod: paymentData.channel,
      },
      { new: true }
    );

    if (!donation) {
      return res
        .status(404)
        .json({ success: false, message: "Donation not found" });
    }

    // Send appreciation email
    await sendAppreciationEmail(donation);

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        name: donation.name,
        amount: donation.amount,
        program: donation.program,
        paymentDate: donation.paymentDate.toLocaleDateString(),
      },
    });
  } catch (error) {
    console.error(`Payment verification error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
});

module.exports = { initiatePayment, verifyPayment };
