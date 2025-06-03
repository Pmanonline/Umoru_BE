const Award = require("../models/awardModel.js");
const { errorHandler } = require("../middlewares/errorHandling.js");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload image to Cloudinary
const uploadToCloudinary = async (file, folder = "PrideOfTheWorld/awards") => {
  try {
    const filePath = file.path || file.tempFilePath || file.filepath;
    console.log("Attempting to upload file with path:", filePath);
    if (!filePath) {
      throw new Error(
        "No file path found (checked path, tempFilePath, filepath)"
      );
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: "auto",
    });
    try {
      await fs.unlink(filePath);
      console.log("Temporary file deleted:", filePath);
    } catch (unlinkError) {
      console.error("Failed to delete temporary file:", unlinkError.message);
    }
    return result.secure_url;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to delete image from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;
    const urlParts = url.split("/");
    const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
    if (versionIndex === -1) {
      console.error(`Invalid Cloudinary URL format: ${url}`);
      return;
    }
    const publicId = urlParts
      .slice(versionIndex + 1)
      .join("/")
      .replace(/\.[^/.]+$/, "");
    const result = await cloudinary.uploader.destroy(publicId);
    if (result.result === "ok") {
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
    } else {
      console.error(`Deletion failed for: ${publicId}`, result);
    }
  } catch (error) {
    console.error(`Failed to delete from Cloudinary:`, error);
  }
};

// Create a new award
const createAward = async (req, res, next) => {
  try {
    console.log("Received request body:", req.body);
    console.log("Received files:", req.files);

    const {
      name,
      award,
      category,
      state,
      country,
      continent,
      year,
      description,
      fullDescription,
      achievements,
      socialMedia,
      profileLink,
      videoLink,
      videoDuration,
      videoID,
    } = req.body;

    console.log("Extracted fields:", {
      name,
      award,
      category,
      state,
      country,
      continent,
      year,
      description,
      fullDescription,
      achievements,
      socialMedia,
      profileLink,
      videoLink,
      videoDuration,
      videoID,
    });

    // Validate required fields
    if (!name || !award || !category || !country || !continent) {
      return next(
        errorHandler(
          400,
          "Name, award, category, country, and continent are required"
        )
      );
    }

    // Validate country and continent (simplified; use API validation in production)
    // const validCountries = ["Nigeria", "USA", "UK", "Canada", "Australia"]; // Replace with API data
    // const validContinents = ["Africa", "North America", "Europe", "Australia"]; // Replace with API data
    // if (!validCountries.includes(country)) {
    //   return next(errorHandler(400, "Invalid country"));
    // }
    // if (!validContinents.includes(continent)) {
    //   return next(errorHandler(400, "Invalid continent"));
    // }

    // Parse year as a number
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return next(errorHandler(400, "Year must be a valid number"));
    }

    // Validate videoDuration format if provided
    if (videoDuration && !/^\d{1,2}:\d{2}$/.test(videoDuration)) {
      return next(
        errorHandler(400, "Video duration must be in MM:SS format (e.g., 3:45)")
      );
    }

    // Parse achievements and socialMedia from JSON strings
    let parsedAchievements = [];
    if (achievements) {
      try {
        parsedAchievements = JSON.parse(achievements);
        if (!Array.isArray(parsedAchievements)) {
          throw new Error("Achievements must be an array");
        }
      } catch (error) {
        return next(
          errorHandler(400, `Invalid achievements format: ${error.message}`)
        );
      }
    }

    let parsedSocialMedia = {};
    if (socialMedia) {
      try {
        parsedSocialMedia = JSON.parse(socialMedia);
        if (
          typeof parsedSocialMedia !== "object" ||
          Array.isArray(parsedSocialMedia)
        ) {
          throw new Error("SocialMedia must be an object");
        }
      } catch (error) {
        return next(
          errorHandler(400, `Invalid socialMedia format: ${error.message}`)
        );
      }
    }

    // Check for duplicate award (based on name, award, year, country, continent)
    const existingAward = await Award.findOne({
      name,
      award,
      year: yearNumber,
      country,
      continent,
    });
    if (existingAward) {
      return next(
        errorHandler(
          400,
          "Award for this person in this year, country, and continent already exists"
        )
      );
    }

    // Handle image upload to Cloudinary
    let imageUrl = null;
    if (req.files && req.files.image) {
      try {
        console.log("Full image object:", req.files.image);
        console.log("Image path:", req.files.image.path);
        imageUrl = await uploadToCloudinary(req.files.image);
      } catch (uploadError) {
        return next(
          errorHandler(500, `Image upload failed: ${uploadError.message}`)
        );
      }
    }

    // Create slug from name, award, year, country, and continent
    const slug = `${name}-${award}-${yearNumber}-${country}-${continent}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create and save new award
    const newAward = new Award({
      name: name.trim(),
      award: award.trim(),
      category: category.trim(),
      state: state ? state.trim() : "",
      country: country.trim(),
      continent: continent.trim(),
      year: yearNumber,
      slug,
      image: imageUrl,
      description: description ? description.trim() : "",
      fullDescription: fullDescription ? fullDescription.trim() : "",
      achievements: parsedAchievements,
      socialMedia: parsedSocialMedia,
      profileLink: profileLink ? profileLink.trim() : "",
      videoLink: videoLink ? videoLink.trim() : "",
      videoDuration: videoDuration ? videoDuration.trim() : "",
      videoID: videoID ? videoID.trim() : "",
    });

    const savedAward = await newAward.save();

    res.status(201).json({
      success: true,
      award: savedAward,
      message: "Award created successfully",
    });
  } catch (error) {
    console.error("Error in createAward:", error);
    next(error);
  }
};

// Update an existing award
const updateAward = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      name,
      award,
      category,
      state,
      country,
      continent,
      year,
      description,
      fullDescription,
      achievements,
      socialMedia,
      profileLink,
      videoLink,
      videoDuration,
      videoID,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !award ||
      !category ||
      !country ||
      !continent ||
      !year ||
      !description
    ) {
      return next(
        errorHandler(
          400,
          "Name, award, category, country, continent, year, and description are required"
        )
      );
    }

    // Parse year as a number
    const yearNumber = parseInt(year, 10);
    if (isNaN(yearNumber)) {
      return next(errorHandler(400, "Year must be a valid number"));
    }

    // Validate videoDuration format if provided
    if (videoDuration && !/^\d{1,2}:\d{2}$/.test(videoDuration)) {
      return next(
        errorHandler(400, "Video duration must be in MM:SS format (e.g., 3:45)")
      );
    }

    // Parse achievements and socialMedia from JSON strings
    let parsedAchievements;
    if (achievements) {
      try {
        parsedAchievements = JSON.parse(achievements);
        if (!Array.isArray(parsedAchievements)) {
          throw new Error("Achievements must be an array");
        }
      } catch (error) {
        return next(
          errorHandler(400, `Invalid achievements format: ${error.message}`)
        );
      }
    }

    let parsedSocialMedia;
    if (socialMedia) {
      try {
        parsedSocialMedia = JSON.parse(socialMedia);
        if (
          typeof parsedSocialMedia !== "object" ||
          Array.isArray(parsedSocialMedia)
        ) {
          throw new Error("SocialMedia must be an object");
        }
      } catch (error) {
        return next(
          errorHandler(400, `Invalid socialMedia format: ${error.message}`)
        );
      }
    }

    // Fetch the existing award
    const awardDoc = await Award.findOne({ slug });
    if (!awardDoc) {
      return next(errorHandler(404, "Award not found"));
    }

    // Handle image update
    let imageUrl = awardDoc.image;
    if (req.files && req.files.image) {
      try {
        if (awardDoc.image) {
          await deleteFromCloudinary(awardDoc.image);
        }
        imageUrl = await uploadToCloudinary(req.files.image);
      } catch (uploadError) {
        return next(
          errorHandler(500, `Image upload failed: ${uploadError.message}`)
        );
      }
    }

    // Generate new slug
    const newSlug = `${name}-${award}-${yearNumber}-${country}-${continent}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for slug conflict (excluding current award)
    const slugConflict = await Award.findOne({
      slug: newSlug,
      _id: { $ne: awardDoc._id },
    });
    if (slugConflict) {
      return next(
        errorHandler(400, "Another award with this slug already exists")
      );
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      award: award.trim(),
      category: category.trim(),
      state: state ? state.trim() : awardDoc.state,
      country: country.trim(),
      continent: continent.trim(),
      year: yearNumber,
      slug: newSlug,
      image: imageUrl,
      description: description.trim(),
      fullDescription: fullDescription
        ? fullDescription.trim()
        : awardDoc.fullDescription,
      achievements:
        parsedAchievements !== undefined
          ? parsedAchievements
          : awardDoc.achievements,
      socialMedia:
        parsedSocialMedia !== undefined
          ? parsedSocialMedia
          : awardDoc.socialMedia,
      profileLink: profileLink ? profileLink.trim() : awardDoc.profileLink,
      videoLink: videoLink ? videoLink.trim() : awardDoc.videoLink,
      videoDuration: videoDuration
        ? videoDuration.trim()
        : awardDoc.videoDuration,
      videoID: videoID ? videoID.trim() : awardDoc.videoID,
    };

    // Update award
    const updatedAward = await Award.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedAward) {
      return next(errorHandler(500, "Failed to update award"));
    }

    console.log("Updated award:", updatedAward);

    res.status(200).json({
      success: true,
      award: updatedAward,
      message: "Award updated successfully",
    });
  } catch (error) {
    console.error("Error in updateAward:", error);
    next(error);
  }
};

// Get related awards (e.g., same category, excluding current award)
const getRelatedAwards = async (req, res, next) => {
  try {
    const { category, currentAwardId } = req.query;

    if (!category || !currentAwardId) {
      return next(
        errorHandler(400, "Category and current award ID are required")
      );
    }

    const relatedAwards = await Award.find({
      category: category,
      _id: { $ne: currentAwardId }, // Exclude the current award
    })
      .select("name award image slug year country continent")
      .limit(4);

    res.status(200).json(relatedAwards);
  } catch (error) {
    console.error("Error in getRelatedAwards:", error);
    next(error);
  }
};

// Get all awards with filtering, sorting, and pagination
const getAwards = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.country && { country: req.query.country }),
      ...(req.query.continent && { continent: req.query.continent }),
      ...(req.query.year && { year: parseInt(req.query.year) }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.awardId && { _id: req.query.awardId }),
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: "i" } },
          { award: { $regex: req.query.searchTerm, $options: "i" } },
          { description: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const awards = await Award.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalAwards = await Award.countDocuments(query);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthAwards = await Award.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      awards,
      totalAwards,
      lastMonthAwards,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single award by ID
const getAwardById = async (req, res, next) => {
  try {
    const award = await Award.findById(req.params.awardId);
    if (!award) {
      return next(errorHandler(404, "Award not found"));
    }
    res.status(200).json(award);
  } catch (error) {
    next(error);
  }
};

// Get a single award by slug
const getAwardBySlug = async (req, res, next) => {
  try {
    const award = await Award.findOne({ slug: req.params.slug });
    if (!award) {
      return next(errorHandler(404, "Award not found"));
    }
    res.status(200).json(award);
  } catch (error) {
    next(error);
  }
};

// Delete an award
const deleteAward = async (req, res, next) => {
  try {
    const { awardId } = req.params;
    const award = await Award.findById(awardId);

    if (!award) {
      return res.status(404).json({ message: "Award not found" });
    }

    // Delete image from Cloudinary if it exists
    if (award.image) {
      await deleteFromCloudinary(award.image);
    }

    // Delete award from database
    await Award.findByIdAndDelete(awardId);
    res.status(200).json({ message: "Award deleted successfully" });
  } catch (error) {
    console.error("Error deleting award:", error);
    next(error);
  }
};

module.exports = {
  createAward,
  updateAward,
  getRelatedAwards,
  getAwards,
  getAwardById,
  getAwardBySlug,
  deleteAward,
};
