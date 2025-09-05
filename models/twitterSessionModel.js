// models/twitterSessionModel.js
const mongoose = require("mongoose");

const twitterSessionSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    codeVerifier: {
      type: String,
      required: true,
    },
    codeChallenge: {
      type: String,
      required: true,
    },
    redirectUri: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index for automatic cleanup
    },
  },
  {
    timestamps: true,
  }
);

// Additional cleanup method if needed
twitterSessionSchema.statics.cleanupExpired = function () {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

module.exports = mongoose.model("TwitterSession", twitterSessionSchema);
