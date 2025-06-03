// models/Nomination.js
const mongoose = require("mongoose");

const nominationSchema = new mongoose.Schema({
  nominator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  nomineeName: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  slug: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "Best Business Entrepreneur",
      "Humanitarian",
      "Innovation",
      "Emergency Services",
      "Other",
    ],
  },
  nominationReason: {
    type: String,
    required: true,
  },
  whyDeserves: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  continent: {
    type: String,
    required: true,
    enum: [
      "Africa",
      "Asia",
      "Europe",
      "North America",
      "South America",
      "Australia",
      "Antarctica",
    ],
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Nomination", nominationSchema);
