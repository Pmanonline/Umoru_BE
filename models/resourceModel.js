const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "Spirituality",
          "Health & Wellness",
          "Education",
          "Finance",
          "Arts & Creativity",
        ],
        message:
          "Invalid category. Must be one of: Spirituality, Health & Wellness, Education, Finance, Arts & Creativity",
      },
    },
    format: {
      type: String,
      required: [true, "Format is required"],
      enum: {
        values: ["PDF", "MP3", "MP4", "EPUB"],
        message: "Invalid format. Must be one of: PDF, MP3, MP4, EPUB",
      },
    },
    size: {
      type: String,
      required: [true, "Size is required"],
    },
    duration: {
      type: String,
    },
    author: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: [true, "At least one author is required"],
        validate: {
          validator: async function (value) {
            const author = await mongoose.model("Author").findById(value);
            return !!author;
          },
          message: "Invalid author ID",
        },
      },
    ],
    date: {
      type: Date,
      default: Date.now,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    url: {
      type: String,
      required: [true, "Resource URL is required"],
    },
    thumbnail: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
