const Nominee = require("../models/nomineeModel");
const User = require("../models/userModel"); // Assumes userModel.js exists
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
const uploadToCloudinary = async (file, folder = "Nominees/images") => {
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

// Get all nominees
const getNominees = asyncHandler(async (req, res) => {
  const { startIndex = 0, limit = 9, searchTerm, awardCategory } = req.query;
  let query = {};

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { bio: { $regex: searchTerm, $options: "i" } },
    ];
  }
  if (awardCategory) {
    query.awardCategory = awardCategory;
  }

  const nominees = await Nominee.find(query)
    .skip(Number(startIndex))
    .limit(Number(limit))
    .select("-userVoters -judgeVoter -adminVoter")
    .lean();

  const totalNominees = await Nominee.countDocuments(query);

  res.status(200).json({ nominees, totalNominees });
});

// Get single nominee by slug
const getNomineeBySlug = asyncHandler(async (req, res) => {
  const nominee = await Nominee.findOne({ slug: req.params.slug })
    .select("-userVoters -judgeVoter -adminVoter")
    .lean();

  if (!nominee) {
    res.status(404);
    throw new Error("Nominee not found");
  }

  res.status(200).json(nominee);
});

// Create nominee
const createNominee = asyncHandler(async (req, res) => {
  const { name, bio, awardCategory } = req.body;

  if (!req.user || !req.user.role == "admin") {
    res.status(403);
    throw new Error("Not authorized, admin access required");
  }

  if (!name || !bio || !awardCategory) {
    res.status(400);
    throw new Error("Name, bio, and award category are required");
  }

  // Check for duplicate nominee
  const existingNominee = await Nominee.findOne({ name, awardCategory });
  if (existingNominee) {
    res.status(400);
    throw new Error("This nominee in this category already exists");
  }

  // Handle main image upload
  let imageUrl = "";
  if (req.files && req.files.image) {
    imageUrl = await uploadToCloudinary(req.files.image);
  }

  // Handle additional images
  let additionalImages = [];
  if (req.files && req.files.additionalImages) {
    const additionalFiles = Array.isArray(req.files.additionalImages)
      ? req.files.additionalImages
      : [req.files.additionalImages];
    if (additionalFiles.length > 10) {
      res.status(400);
      throw new Error("Cannot upload more than 10 additional images");
    }
    additionalImages = await Promise.all(
      additionalFiles.map((file) => uploadToCloudinary(file))
    );
  }

  const nominee = await Nominee.create({
    name: name.trim(),
    image: imageUrl,
    bio: bio.trim(),
    awardCategory: awardCategory.trim(),
    additionalImages,
  });

  res.status(201).json({
    success: true,
    nominee,
    message: "Nominee created successfully",
  });
});

// Update nominee
const updateNominee = asyncHandler(async (req, res) => {
  const { name, bio, awardCategory } = req.body;
  const { slug } = req.params;

  if (!req.user || !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized, admin access required");
  }

  if (!name || !bio || !awardCategory) {
    res.status(400);
    throw new Error("Name, bio, and award category are required");
  }

  const nominee = await Nominee.findOne({ slug });
  if (!nominee) {
    res.status(404);
    throw new Error("Nominee not found");
  }

  // Handle main image update
  let imageUrl = nominee.image;
  if (req.files && req.files.image) {
    if (nominee.image) {
      await deleteFromCloudinary(nominee.image);
    }
    imageUrl = await uploadToCloudinary(req.files.image);
  }

  // Handle additional images update
  let additionalImages = nominee.additionalImages;
  if (req.files && req.files.additionalImages) {
    const additionalFiles = Array.isArray(req.files.additionalImages)
      ? req.files.additionalImages
      : [req.files.additionalImages];
    if (additionalFiles.length + additionalImages.length > 10) {
      res.status(400);
      throw new Error("Total additional images cannot exceed 10");
    }
    const newImages = await Promise.all(
      additionalFiles.map((file) => uploadToCloudinary(file))
    );
    additionalImages = [...additionalImages, ...newImages];
  }

  // Update nominee
  nominee.name = name.trim();
  nominee.bio = bio.trim();
  nominee.awardCategory = awardCategory.trim();
  nominee.image = imageUrl;
  nominee.additionalImages = additionalImages;

  await nominee.save();

  res.status(200).json({
    success: true,
    nominee,
    message: "Nominee updated successfully",
  });
});

// Delete nominee
const deleteNominee = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.role == "admin") {
    res.status(403);
    throw new Error("Not authorized, admin access required");
  }

  const nominee = await Nominee.findById(req.params.id);

  if (!nominee) {
    res.status(404);
    throw new Error("Nominee not found");
  }

  // Delete images from Cloudinary
  if (nominee.image) {
    await deleteFromCloudinary(nominee.image);
  }
  if (nominee.additionalImages.length > 0) {
    await Promise.all(
      nominee.additionalImages.map((url) => deleteFromCloudinary(url))
    );
  }

  await Nominee.findByIdAndDelete(req.params.id);

  res.status(200).json({ message: "Nominee deleted successfully" });
});

// Submit vote
const submitVote = asyncHandler(async (req, res) => {
  const { voteType } = req.body;
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, please login");
  }

  if (!["user", "judge", "admin"].includes(voteType)) {
    res.status(400);
    throw new Error("Invalid vote type");
  }

  const nominee = await Nominee.findById(req.params.id);
  if (!nominee) {
    res.status(404);
    throw new Error("Nominee not found");
  }

  // Verify user role
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // For judge votes
  if (voteType === "judge") {
    if (nominee.judgeVoter) {
      res.status(400);
      throw new Error("Judge has already voted for this category");
    }
    const categoryNominees = await Nominee.find({
      awardCategory: nominee.awardCategory,
      judgeVoter: { $ne: null },
    });
    if (categoryNominees.length > 0) {
      res.status(400);
      throw new Error("Judge has already voted in this category");
    }
  }

  // For admin votes
  if (voteType === "admin") {
    if (!req.user.role == "admin") {
      res.status(403);
      throw new Error("Not authorized, admin access required");
    }
    if (nominee.adminVoter) {
      res.status(400);
      throw new Error("Admin has already voted for this category");
    }
    const categoryNominees = await Nominee.find({
      awardCategory: nominee.awardCategory,
      adminVoter: { $ne: null },
    });
    if (categoryNominees.length > 0) {
      res.status(400);
      throw new Error("Admin has already voted in this category");
    }
  }

  // For user votes
  if (voteType === "user") {
    if (nominee.userVoters.includes(req.user._id)) {
      res.status(400);
      throw new Error("You have already voted for this nominee");
    }
    const categoryNominees = await Nominee.find({
      awardCategory: nominee.awardCategory,
      userVoters: req.user._id,
    });
    if (categoryNominees.length > 0) {
      res.status(400);
      throw new Error("You have already voted in this category");
    }
  }

  // Record vote
  if (voteType === "judge") {
    nominee.judgeVotes = 1;
    nominee.judgeVoter = req.user._id;
  } else if (voteType === "admin") {
    nominee.adminVotes = 1;
    nominee.adminVoter = req.user._id;
  } else if (voteType === "user") {
    nominee.userVotes += 1;
    nominee.userVoters.push(req.user._id);
  }

  await nominee.save();

  res.status(200).json({
    message: `Vote recorded for ${nominee.name} as ${voteType}`,
    nominee: {
      _id: nominee._id,
      name: nominee.name,
      awardCategory: nominee.awardCategory,
      userVotes: nominee.userVotes,
      judgeVotes: nominee.judgeVotes,
      adminVotes: nominee.adminVotes,
      totalScore: nominee.totalScore,
    },
  });
});

// Get leaderboard by category
const getLeaderboard = asyncHandler(async (req, res) => {
  const { awardCategory } = req.query;
  if (!awardCategory) {
    res.status(400);
    throw new Error("Award category is required");
  }

  const nominees = await Nominee.find({ awardCategory })
    .select("name userVotes judgeVotes adminVotes totalScore")
    .sort({ totalScore: -1 })
    .lean();

  res.status(200).json({ nominees });
});

module.exports = {
  getNominees,
  getNomineeBySlug,
  createNominee,
  updateNominee,
  deleteNominee,
  submitVote,
  getLeaderboard,
};
