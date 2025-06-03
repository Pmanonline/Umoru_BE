const mongoose = require("mongoose");

const recommendedPersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    timeframe: {
      type: String,
      required: true,
      trim: true,
      enum: ["Today", "This Week", "This Month", "This Year"], // Updated enum values
    },
    videoLink: {
      type: String,
      trim: true,
    },
    videoDuration: {
      type: String,
      trim: true,
    },
    profileLink: {
      type: String,
      trim: true,
    },
    additionalImages: [
      {
        type: String,
        trim: true,
      },
    ],
    year: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RecommendedPerson", recommendedPersonSchema);
