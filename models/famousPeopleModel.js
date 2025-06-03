const mongoose = require("mongoose");

const famousPersonSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    country: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0;
        },
        message: "Country is required and cannot be empty",
      },
    },
    continent: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v && v.trim().length > 0;
        },
        message: "Continent is required and cannot be empty",
      },
    },
    slug: { type: String, unique: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    videoLink: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return !v || /^[a-zA-Z0-9_-]{11}$/.test(v); // YouTube video ID format
        },
        message: "Invalid YouTube video ID",
      },
    },
    videoDuration: {
      type: String,
      default: "",
      validate: {
        validator: function (v) {
          return !v || /^\d{1,2}:\d{2}$/.test(v); // MM:SS format
        },
        message: "Video duration must be in MM:SS format (e.g., 3:45)",
      },
    },
    profileLink: { type: String, default: "" },
    additionalImages: {
      type: [{ type: String }],
      default: [],
      validate: {
        validator: function (v) {
          return v.length <= 10; // Max 10 images
        },
        message: "Additional images cannot exceed 10",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FamousPerson", famousPersonSchema);
