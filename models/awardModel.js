const mongoose = require("mongoose");

const awardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    award: { type: String, required: true },
    category: { type: String, required: true },
    state: { type: String, default: "" }, // Retained for legacy or sub-national reference
    country: { type: String, required: true }, // Made required for global scope
    continent: { type: String, required: true }, // Made required for global scope
    year: { type: Number, required: false },
    slug: { type: String, unique: true },
    image: { type: String, default: "" },
    description: { type: String, default: "" },
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
    videoID: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    achievements: [{ type: String }],
    socialMedia: {
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      website: { type: String, default: "" },
    },
    profileLink: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Award", awardSchema);
