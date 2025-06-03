const mongoose = require("mongoose");
const slugify = require("slugify");

const winnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Winner name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    award: {
      type: String,
      trim: true,
    },
    awardCategory: {
      type: String,
      required: [true, "Award category is required"],
      //   enum: [
      //     "Humanitarian of the Year",
      //     "Innovator of the Year",
      //     "Emergency Services",
      //     "Young Achiever",
      //     "Community Champion",
      //     "Lifetime Achievement",
      //     "Environmental Hero",
      //   ],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Pre-save hook to generate slug
winnerSchema.pre("save", function (next) {
  if (
    this.isModified("name") ||
    this.isModified("award") ||
    this.isModified("year")
  ) {
    this.slug = slugify(`${this.name}-${this.award}-${this.year}`, {
      lower: true,
      strict: true,
    });
  }
  next();
});

// Index for efficient queries
winnerSchema.index({ slug: 1 });
winnerSchema.index({ year: 1, awardCategory: 1 });

module.exports = mongoose.model("Winner", winnerSchema);
