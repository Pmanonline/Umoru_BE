const Pride = require("../models/prideModel.js");
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
const uploadToCloudinary = async (file, folder = "Pride/images") => {
  try {
    const filePath = file.path || file.tempFilePath || file.filepath;
    if (!filePath) {
      throw new Error("No file path found");
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
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

// Create a new pride entry
const createPride = async (req, res, next) => {
  try {
    const {
      name,
      award,
      category,
      description,
      fullDescription,
      country,
      videoLink,
      videoDuration,
      profileLink,
    } = req.body;

    // Validate required fields
    if (!name || !award || !category || !country) {
      return next(
        errorHandler(400, "Name, award, category, and country are required")
      );
    }

    // Check for duplicate pride entry (based on name, award, and year)
    const existingPride = await Pride.findOne({ name, award, country });
    if (existingPride) {
      return next(errorHandler(400, "This pride entry already exists"));
    }

    // Handle main image upload
    let imageUrl = "";
    if (req.files && req.files.image) {
      imageUrl = await uploadToCloudinary(req.files.image);
    }

    // Handle additional images (up to 10)
    let additionalImages = [];
    if (req.files && req.files.additionalImages) {
      const additionalFiles = Array.isArray(req.files.additionalImages)
        ? req.files.additionalImages
        : [req.files.additionalImages];
      if (additionalFiles.length > 10) {
        return next(
          errorHandler(400, "Cannot upload more than 10 additional images")
        );
      }
      additionalImages = await Promise.all(
        additionalFiles.map((file) => uploadToCloudinary(file))
      );
    }

    // Create slug from name, category, and country
    const slug = `${name}-${category}-${country}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create and save new pride entry
    const newPride = new Pride({
      name: name.trim(),
      award: award.trim(),
      category: category.trim(),
      slug,
      image: imageUrl,
      description: description ? description.trim() : "",
      fullDescription: fullDescription ? fullDescription.trim() : "",
      country: country ? country.trim() : "",
      videoLink: videoLink ? videoLink.trim() : "",
      videoDuration: videoDuration ? videoDuration.trim() : "",
      profileLink: profileLink ? profileLink.trim() : "",
      additionalImages,
    });

    const savedPride = await newPride.save();

    res.status(201).json({
      success: true,
      pride: savedPride,
      message: "Pride entry created successfully",
    });
  } catch (error) {
    console.error("Error in createPride:", error);
    next(error);
  }
};

// Update an existing pride entry
const updatePride = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      name,
      award,
      category,
      description,
      fullDescription,
      country,
      videoLink,
      videoDuration,
      profileLink,
    } = req.body;

    // Validate required fields
    if (!name || !award || !category || !country || !description) {
      return next(
        errorHandler(
          400,
          "Name, award, category, country, and description are required"
        )
      );
    }

    // Fetch the existing pride entry
    const prideDoc = await Pride.findOne({ slug });
    if (!prideDoc) {
      return next(errorHandler(404, "Pride entry not found"));
    }

    // Handle main image update
    let imageUrl = prideDoc.image;
    if (req.files && req.files.image) {
      if (prideDoc.image) {
        await deleteFromCloudinary(prideDoc.image);
      }
      imageUrl = await uploadToCloudinary(req.files.image);
    }

    // Handle additional images update
    let additionalImages = prideDoc.additionalImages;
    if (req.files && req.files.additionalImages) {
      const additionalFiles = Array.isArray(req.files.additionalImages)
        ? req.files.additionalImages
        : [req.files.additionalImages];
      if (additionalFiles.length + additionalImages.length > 10) {
        return next(
          errorHandler(400, "Total additional images cannot exceed 10")
        );
      }
      const newImages = await Promise.all(
        additionalFiles.map((file) => uploadToCloudinary(file))
      );
      additionalImages = [...additionalImages, ...newImages];
    }

    // Generate new slug
    const newSlug = `${name}-${category}-${country}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for slug conflict
    const slugConflict = await Pride.findOne({
      slug: newSlug,
      _id: { $ne: prideDoc._id },
    });
    if (slugConflict) {
      return next(
        errorHandler(400, "Another pride entry with this slug already exists")
      );
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      award: award.trim(),
      category: category.trim(),
      slug: newSlug,
      image: imageUrl,
      description: description.trim(),
      fullDescription: fullDescription
        ? fullDescription.trim()
        : prideDoc.fullDescription,
      country: country ? country.trim() : prideDoc.country,
      videoLink: videoLink ? videoLink.trim() : prideDoc.videoLink,
      videoDuration: videoDuration
        ? videoDuration.trim()
        : prideDoc.videoDuration,
      profileLink: profileLink ? profileLink.trim() : prideDoc.profileLink,
      additionalImages,
    };

    // Update pride entry
    const updatedPride = await Pride.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPride) {
      return next(errorHandler(500, "Failed to update pride entry"));
    }

    res.status(200).json({
      success: true,
      pride: updatedPride,
      message: "Pride entry updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePride:", error);
    next(error);
  }
};

// Get a single pride entry by slug
const getPrideBySlug = async (req, res, next) => {
  try {
    const pride = await Pride.findOne({ slug: req.params.slug });
    if (!pride) {
      return next(errorHandler(404, "Pride entry not found"));
    }
    res.status(200).json(pride);
  } catch (error) {
    next(error);
  }
};

// Get all pride entries with filtering and pagination
const getPrideEntries = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.country && { country: req.query.country }),
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: "i" } },
          { award: { $regex: req.query.searchTerm, $options: "i" } },
          { description: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const prideEntries = await Pride.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPrideEntries = await Pride.countDocuments(query);

    res.status(200).json({
      prideEntries,
      totalPrideEntries,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a pride entry
const deletePride = async (req, res, next) => {
  try {
    const { prideId } = req.params;
    const pride = await Pride.findById(prideId);

    if (!pride) {
      return next(errorHandler(404, "Pride entry not found"));
    }

    // Delete images from Cloudinary
    if (pride.image) {
      await deleteFromCloudinary(pride.image);
    }
    if (pride.additionalImages.length > 0) {
      await Promise.all(
        pride.additionalImages.map((url) => deleteFromCloudinary(url))
      );
    }

    // Delete pride entry from database
    await Pride.findByIdAndDelete(prideId);
    res.status(200).json({ message: "Pride entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting pride entry:", error);
    next(error);
  }
};

module.exports = {
  createPride,
  updatePride,
  getPrideBySlug,
  getPrideEntries,
  deletePride,
};
