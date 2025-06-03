const Nomination = require("../models/nominationModel.js");
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
const uploadToCloudinary = async (
  file,
  folder = "ThePrideOfTheWorld/Nominate/images"
) => {
  try {
    const filePath = file.path;
    if (!filePath) {
      throw new Error("No file path found");
    }
    console.log("Uploading file from path:", filePath); // Debug log

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    console.log("Cloudinary upload successful:", result.secure_url); // Debug log

    await fs.unlink(filePath);
    console.log("Temporary file deleted:", filePath); // Debug log

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

// Create a new nomination
const createNomination = async (req, res, next) => {
  try {
    const {
      nomineeName,
      category,
      nominationReason,
      whyDeserves,
      country,
      continent,
    } = req.body;

    const nominator = req.user._id; // From auth middleware

    // Validate required fields
    if (
      !nomineeName ||
      !category ||
      !nominationReason ||
      !country ||
      !continent
    ) {
      return next(
        errorHandler(
          400,
          "Nominee name, category, nomination reason, country, and continent are required"
        )
      );
    }

    // Check for duplicate nomination
    const existingNomination = await Nomination.findOne({
      nomineeName,
      category,
      country,
      continent,
      nominator,
    });
    if (existingNomination) {
      return next(
        errorHandler(
          400,
          "You have already nominated this person in this category, country, and continent"
        )
      );
    }

    // Handle main image upload
    let imageUrl = "";
    console.log("req.files:", req.files); // Debug log for all files
    if (req.files && req.files["image"]) {
      const imageFile = req.files["image"];
      console.log("Found image file:", imageFile); // Debug log for image file
      console.log("Attempting to upload image:", imageFile); // Debug log
      try {
        imageUrl = await uploadToCloudinary(imageFile);
        console.log("Image successfully uploaded to Cloudinary:", imageUrl); // Debug log
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return next(
          errorHandler(500, `Image upload failed: ${uploadError.message}`)
        );
      }
    } else {
      console.log("No image file found with fieldname 'image'"); // Debug log
    }

    // Create slug
    const slug = `${nomineeName}-${category}-${country}-${continent}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Create and save new nomination
    const newNomination = new Nomination({
      nominator,
      nomineeName: nomineeName.trim(),
      category: category.trim(),
      nominationReason: nominationReason.trim(),
      whyDeserves: whyDeserves ? whyDeserves.trim() : "",
      country: country.trim(),
      continent: continent.trim(),
      slug,
      image: imageUrl || undefined, // Only set if imageUrl exists
      status: "pending",
    });

    const savedNomination = await newNomination.save();
    console.log("Saved nomination:", savedNomination); // Debug log

    res.status(201).json({
      success: true,
      nomination: savedNomination,
      message: "Nomination submitted successfully",
    });
  } catch (error) {
    console.error("Error in createNomination:", error);
    next(error);
  }
};

// Update an existing nomination
const updateNomination = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      nomineeName,
      category,
      nominationReason,
      whyDeserves,
      country,
      continent,
      status,
    } = req.body;

    if (
      !nomineeName ||
      !category ||
      !nominationReason ||
      !whyDeserves ||
      !country ||
      !continent
    ) {
      return next(
        errorHandler(
          400,
          "Nominee name, category, nomination reason, why deserves, country, and continent are required"
        )
      );
    }

    const nominationDoc = await Nomination.findOne({ slug });
    if (!nominationDoc) {
      return next(errorHandler(404, "Nomination not found"));
    }

    if (
      nominationDoc.nominator.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return next(
        errorHandler(403, "You are not authorized to update this nomination")
      );
    }

    // Handle main image upload
    let imageUrl = nominationDoc.image;
    if (req.files && req.files["image"]) {
      const imageFile = req.files["image"];
      console.log("Attempting to upload new image:", imageFile); // Debug log
      try {
        if (nominationDoc.image) {
          await deleteFromCloudinary(nominationDoc.image);
        }
        imageUrl = await uploadToCloudinary(imageFile);
        console.log("New image successfully uploaded to Cloudinary:", imageUrl); // Debug log
      } catch (uploadError) {
        console.error("Image upload error during update:", uploadError);
        return next(
          errorHandler(500, `Image upload failed: ${uploadError.message}`)
        );
      }
    }

    const newSlug = `${nomineeName}-${category}-${country}-${continent}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slugConflict = await Nomination.findOne({
      slug: newSlug,
      _id: { $ne: nominationDoc._id },
    });
    if (slugConflict) {
      return next(
        errorHandler(400, "Another nomination with this slug already exists")
      );
    }

    const updateData = {
      nomineeName: nomineeName.trim(),
      category: category.trim(),
      nominationReason: nominationReason.trim(),
      whyDeserves: whyDeserves.trim(),
      country: country.trim(),
      continent: continent.trim(),
      slug: newSlug,
      image: imageUrl || nominationDoc.image, // Retain old image if no new upload
      status: status || nominationDoc.status,
      updatedAt: Date.now(),
    };

    const updatedNomination = await Nomination.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("nominator", "name email");

    if (!updatedNomination) {
      return next(errorHandler(500, "Failed to update nomination"));
    }

    res.status(200).json({
      success: true,
      nomination: updatedNomination,
      message: "Nomination updated successfully",
    });
  } catch (error) {
    console.error("Error in updateNomination:", error);
    next(error);
  }
};

// Get related nominations
const getRelatedNominations = async (req, res, next) => {
  try {
    const { category, currentNominationId } = req.query;

    if (!category || !currentNominationId) {
      return next(
        errorHandler(400, "Category and current nomination ID are required")
      );
    }

    const relatedNominations = await Nomination.find({
      category: category,
      _id: { $ne: currentNominationId },
    })
      .select("nomineeName category image slug country continent")
      .limit(4);

    res.status(200).json(relatedNominations);
  } catch (error) {
    console.error("Error in getRelatedNominations:", error);
    next(error);
  }
};

// Get all nominations
const getNominations = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.country && { country: req.query.country }),
      ...(req.query.continent && { continent: req.query.continent }),
      ...(req.query.status && { status: req.query.status }),
      ...(req.query.nominator && { nominator: req.query.nominator }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.nominationId && { _id: req.query.nominationId }),
      ...(req.query.searchTerm && {
        $or: [
          { nomineeName: { $regex: req.query.searchTerm, $options: "i" } },
          { nominationReason: { $regex: req.query.searchTerm, $options: "i" } },
          { whyDeserves: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const nominations = await Nomination.find(query)
      .populate("nominator", "name email")
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalNominations = await Nomination.countDocuments(query);

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    res.status(200).json({
      nominations,
      totalNominations,
    });
  } catch (error) {
    console.error("Error in getNominations:", error);
    next(error);
  }
};

// Get a single nomination by ID
const getNominationById = async (req, res, next) => {
  try {
    const nomination = await Nomination.findById(
      req.params.nominationId
    ).populate("nominator", "name email");
    if (!nomination) {
      return next(errorHandler(404, "Nomination not found"));
    }

    res.status(200).json(nomination);
  } catch (error) {
    console.error("Error in getNominationById:", error);
    next(error);
  }
};

// Get a single nomination by slug
const getNominationBySlug = async (req, res, next) => {
  try {
    const nomination = await Nomination.findOne({
      slug: req.params.slug,
    }).populate("nominator", "name email");
    if (!nomination) {
      return next(errorHandler(404, "Nomination not found"));
    }

    res.status(200).json(nomination);
  } catch (error) {
    console.error("Error in getNominationBySlug:", error);
    next(error);
  }
};

// Delete a nomination
const deleteNomination = async (req, res, next) => {
  try {
    const { nominationId } = req.params;
    const nomination = await Nomination.findById(nominationId);

    if (!nomination) {
      return next(errorHandler(404, "Nomination not found"));
    }

    if (nomination.image) {
      await deleteFromCloudinary(nomination.image);
    }

    await Nomination.findByIdAndDelete(nominationId);
    res.status(200).json({ message: "Nomination deleted successfully" });
  } catch (error) {
    console.error("Error deleting nomination:", error);
    next(error);
  }
};

// Update nomination status
const updateNominationStatus = async (req, res, next) => {
  try {
    const { nominationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return next(errorHandler(400, "Invalid status value"));
    }

    // Find and update nomination
    const updatedNomination = await Nomination.findByIdAndUpdate(
      nominationId,
      { $set: { status, updatedAt: Date.now() } },
      { new: true, runValidators: true }
    ).populate("nominator", "name email");

    if (!updatedNomination) {
      return next(errorHandler(404, "Nomination not found"));
    }

    res.status(200).json({
      success: true,
      nomination: updatedNomination,
      message: "Nomination status updated successfully",
    });
  } catch (error) {
    console.error("Error in updateNominationStatus:", error);
    next(error);
  }
};

module.exports = {
  createNomination,
  updateNomination,
  getRelatedNominations,
  getNominations,
  getNominationById,
  getNominationBySlug,
  deleteNomination,
  updateNominationStatus,
};
