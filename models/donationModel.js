const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Donor name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Donor email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Donation amount is required"],
      min: [100, "Donation amount must be at least ₦100"],
    },
    program: {
      type: String,
      enum: [
        "Where most needed",
        "Emergency Services Award",
        "Youth Development Program",
        "Community Heroes Fund",
      ],
      default: "Where most needed",
    },
    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Donation", donationSchema);
