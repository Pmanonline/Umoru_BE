// const mongoose = require("mongoose");

// const nomineeSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     image: { type: String },
//     bio: { type: String, required: true },
//     awardCategory: { type: String, required: true },
//     slug: { type: String, unique: true },
//     additionalImages: [{ type: String }],
//     userVotes: { type: Number, default: 0 },
//     judgeVotes: { type: Number, default: 0 },
//     adminVotes: { type: Number, default: 0 },
//     userVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     judgeVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     adminVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     totalScore: { type: Number, default: 0 },
//   },
//   { timestamps: true }
// );

// // Pre-save hook to calculate totalScore
// nomineeSchema.pre("save", function (next) {
//   this.totalScore =
//     this.userVotes * 0.5 + this.judgeVotes * 0.3 + this.adminVotes * 0.2;
//   next();
// });

// module.exports = mongoose.model("Nominee", nomineeSchema);

const mongoose = require("mongoose");
const slugify = require("slugify");

const nomineeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    image: { type: String, trim: true, default: "" },
    bio: { type: String, required: true, trim: true, maxlength: 500 },
    awardCategory: { type: String, required: true },
    slug: { type: String, unique: true },
    additionalImages: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: "Additional images cannot exceed 10",
      },
    },
    userVotes: { type: Number, default: 0, min: 0 },
    judgeVotes: { type: Number, default: 0, min: 0, max: 1 }, // Single judge vote
    adminVotes: { type: Number, default: 0, min: 0, max: 1 }, // Single admin vote
    userVoters: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    judgeVoter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Single judge
    adminVoter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // Single admin
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Pre-save hook to generate slug and calculate normalized totalScore
nomineeSchema.pre("save", async function (next) {
  // Generate slug
  if (this.isModified("name") || this.isModified("awardCategory")) {
    this.slug = slugify(`${this.name}-${this.awardCategory}`, {
      lower: true,
      strict: true,
    });
  }

  // Calculate normalized totalScore
  try {
    const Nominee = this.constructor;
    const categoryStats = await Nominee.aggregate([
      { $match: { awardCategory: this.awardCategory } },
      {
        $group: {
          _id: null,
          totalUserVotes: { $sum: "$userVotes" },
          totalJudgeVotes: { $sum: "$judgeVotes" },
          totalAdminVotes: { $sum: "$adminVotes" },
        },
      },
    ]);

    const totals = categoryStats[0] || {
      totalUserVotes: 0,
      totalJudgeVotes: 0,
      totalAdminVotes: 0,
    };

    const normUserVotes =
      totals.totalUserVotes > 0 ? this.userVotes / totals.totalUserVotes : 0;
    const normJudgeVotes =
      totals.totalJudgeVotes > 0 ? this.judgeVotes / totals.totalJudgeVotes : 0;
    const normAdminVotes =
      totals.totalAdminVotes > 0 ? this.adminVotes / totals.totalAdminVotes : 0;

    this.totalScore =
      normUserVotes * 0.5 + normJudgeVotes * 0.3 + normAdminVotes * 0.2;
  } catch (err) {
    console.error("Error calculating totalScore:", err);
    this.totalScore = 0; // Fallback
  }

  next();
});

// Indexes for efficient queries
nomineeSchema.index({ slug: 1 });
nomineeSchema.index({ awardCategory: 1 });

module.exports = mongoose.model("Nominee", nomineeSchema);
