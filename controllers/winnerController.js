const Winner = require("../models/winnersModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file, folder = "Winners/images") => {
  try {
    const filePath = file.path || file.tempFilePath || file.filepath;
    if (!filePath) {
      throw new Error("No file path found");
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    await fs.unlink(filePath);
    return result.secure_url;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;
    const urlParts = url.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    if (versionIndex === -1) return;
    const publicId = urlParts
      .slice(versionIndex + 1)
      .join("/")
      .replace(/\.[^/.]+$/, "");
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

// Get all winners
const getWinners = asyncHandler(async (req, res) => {
  const { year, awardCategory } = req.query;
  let query = {};

  if (year) {
    query.year = Number(year);
  }
  if (awardCategory) {
    query.awardCategory = awardCategory;
  }

  const winners = await Winner.find(query).sort({ year: -1, name: 1 }).lean();

  res.status(200).json({ winners });
});

// Get single winner by slug
const getWinnerBySlug = asyncHandler(async (req, res) => {
  const winner = await Winner.findOne({ slug: req.params.slug }).lean();

  if (!winner) {
    res.status(404);
    throw new Error("Winner not found");
  }

  res.status(200).json(winner);
});

// Create winner
const createWinner = asyncHandler(async (req, res) => {
  const { name, award, awardCategory, year, description } = req.body;

  if (!name || !award || !awardCategory || !year || !description) {
    res.status(400);
    throw new Error("All fields are required");
  }

  // Check for duplicate winner
  const existingWinner = await Winner.findOne({ name, award, year });
  if (existingWinner) {
    res.status(400);
    throw new Error("This winner for this award and year already exists");
  }

  // Handle image upload
  let imageUrl = "";
  if (req.files && req.files.image) {
    imageUrl = await uploadToCloudinary(req.files.image);
  }

  const winner = await Winner.create({
    name: name.trim(),
    award: award.trim(),
    awardCategory: awardCategory.trim(),
    year: Number(year),
    description: description.trim(),
    image: imageUrl,
  });

  res.status(201).json({
    success: true,
    winner,
    message: "Winner created successfully",
  });
});

// Update winner
const updateWinner = asyncHandler(async (req, res) => {
  const { name, award, awardCategory, year, description } = req.body;
  const { slug } = req.params;

  if (!name || !award || !awardCategory || !year || !description) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const winner = await Winner.findOne({ slug });
  if (!winner) {
    res.status(404);
    throw new Error("Winner not found");
  }

  // Handle image update
  let imageUrl = winner.image;
  if (req.files && req.files.image) {
    if (winner.image) {
      await deleteFromCloudinary(winner.image);
    }
    imageUrl = await uploadToCloudinary(req.files.image);
  }

  // Update winner
  winner.name = name.trim();
  winner.award = award.trim();
  winner.awardCategory = awardCategory.trim();
  winner.year = Number(year);
  winner.description = description.trim();
  winner.image = imageUrl;

  await winner.save();

  res.status(200).json({
    success: true,
    winner,
    message: "Winner updated successfully",
  });
});

// Delete winner
const deleteWinner = asyncHandler(async (req, res) => {
  const winner = await Winner.findById(req.params.id);

  if (!winner) {
    res.status(404);
    throw new Error("Winner not found");
  }

  // Delete image from Cloudinary
  if (winner.image) {
    await deleteFromCloudinary(winner.image);
  }

  await Winner.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Winner deleted successfully" });
});

module.exports = {
  getWinners,
  getWinnerBySlug,
  createWinner,
  updateWinner,
  deleteWinner,
};
