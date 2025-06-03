const RecommendedPerson = require("../models/recommendedPersonModel");
const { errorHandler } = require("../middlewares/errorHandling");
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
  folder = "RecommendedPersons/images"
) => {
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

// Create a new recommended person
const createRecommendedPerson = async (req, res, next) => {
  try {
    const {
      name,
      title,
      category,
      country, // Added country
      description,
      fullDescription,
      timeframe,
      videoLink,
      videoDuration,
      profileLink,
      year,
    } = req.body;

    // Validate required fields
    if (!name || !title || !category || !country || !timeframe || !year) {
      return next(
        errorHandler(
          400,
          "Name, title, category, country, timeframe, and year are required"
        )
      );
    }

    // Check for duplicate person (based on name, category, country, and timeframe)
    const existingPerson = await RecommendedPerson.findOne({
      name,
      category,
      country,
      timeframe,
    });
    if (existingPerson) {
      return next(
        errorHandler(
          400,
          "This person in this category, country, and timeframe already exists"
        )
      );
    }

    // Handle main image upload
    let imageUrl = "";
    if (req.files && req.files.image) {
      imageUrl = await uploadToCloudinary(
        req.files.image,
        "Recommended/images"
      );
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
        additionalFiles.map((file) =>
          uploadToCloudinary(file, "Recommended/additional_images")
        )
      );
    }

    // Create slug from name, category, country, and timeframe
    const slug = `${name}-${category}-${country}-${timeframe}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for slug conflict
    const slugConflict = await RecommendedPerson.findOne({ slug });
    if (slugConflict) {
      return next(
        errorHandler(400, "Another person with this slug already exists")
      );
    }

    // Create and save new recommended person
    const newPerson = new RecommendedPerson({
      name: name.trim(),
      title: title.trim(),
      category: category.trim(),
      country: country.trim(), // Save country
      slug,
      image: imageUrl,
      description: description ? description.trim() : "",
      fullDescription: fullDescription ? fullDescription.trim() : "",
      timeframe: timeframe.trim(),
      videoLink: videoLink ? videoLink.trim() : "",
      videoDuration: videoDuration ? videoDuration.trim() : "",
      profileLink: profileLink ? profileLink.trim() : "",
      additionalImages,
      year: year.trim(),
    });

    const savedPerson = await newPerson.save();

    res.status(201).json({
      success: true,
      person: savedPerson,
      message: "Recommended person created successfully",
    });
  } catch (error) {
    console.error("Error in createRecommendedPerson:", error);
    next(error);
  }
};

// Update an existing recommended person
const updateRecommendedPerson = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      name,
      title,
      category,
      country, // Added country
      description,
      fullDescription,
      timeframe,
      videoLink,
      videoDuration,
      profileLink,
      year,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !title ||
      !category ||
      !country ||
      !timeframe ||
      !description ||
      !year
    ) {
      return next(
        errorHandler(
          400,
          "Name, title, category, country, timeframe, description, and year are required"
        )
      );
    }

    // Fetch the existing person
    const personDoc = await RecommendedPerson.findOne({ slug });
    if (!personDoc) {
      return next(errorHandler(404, "Recommended person not found"));
    }

    // Handle main image update
    let imageUrl = personDoc.image;
    if (req.files && req.files.image) {
      if (personDoc.image) {
        await deleteFromCloudinary(personDoc.image);
      }
      imageUrl = await uploadToCloudinary(
        req.files.image,
        "Recommended/images"
      );
    }

    // Handle additional images update
    let additionalImages = personDoc.additionalImages;
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
        additionalFiles.map((file) =>
          uploadToCloudinary(file, "Recommended/additional_images")
        )
      );
      additionalImages = [...additionalImages, ...newImages];
    }

    // Generate new slug
    const newSlug = `${name}-${category}-${country}-${timeframe}`
      .trim()
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check for slug conflict
    const slugConflict = await RecommendedPerson.findOne({
      slug: newSlug,
      _id: { $ne: personDoc._id },
    });
    if (slugConflict) {
      return next(
        errorHandler(400, "Another person with this slug already exists")
      );
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      title: title.trim(),
      category: category.trim(),
      country: country.trim(), // Update country
      slug: newSlug,
      image: imageUrl,
      description: description.trim(),
      fullDescription: fullDescription
        ? fullDescription.trim()
        : personDoc.fullDescription,
      timeframe: timeframe.trim(),
      videoLink: videoLink ? videoLink.trim() : personDoc.videoLink,
      videoDuration: videoDuration
        ? videoDuration.trim()
        : personDoc.videoDuration,
      profileLink: profileLink ? profileLink.trim() : personDoc.profileLink,
      additionalImages,
      year: year.trim(),
    };

    // Update person
    const updatedPerson = await RecommendedPerson.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPerson) {
      return next(errorHandler(500, "Failed to update recommended person"));
    }

    res.status(200).json({
      success: true,
      person: updatedPerson,
      message: "Recommended person updated successfully",
    });
  } catch (error) {
    console.error("Error in updateRecommendedPerson:", error);
    next(error);
  }
};

// Get a single recommended person by slug
const getRecommendedPersonBySlug = async (req, res, next) => {
  try {
    const person = await RecommendedPerson.findOne({ slug: req.params.slug });
    if (!person) {
      return next(errorHandler(404, "Recommended person not found"));
    }
    res.status(200).json(person);
  } catch (error) {
    console.error("Error in getRecommendedPersonBySlug:", error);
    next(error);
  }
};

// Get all recommended persons with filtering and pagination
const getRecommendedPersons = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.timeframe && { timeframe: req.query.timeframe }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.country && { country: req.query.country }), // Added country filter
      ...(req.query.search && {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { description: { $regex: req.query.search, $options: "i" } },
        ],
      }),
    };

    const people = await RecommendedPerson.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPeople = await RecommendedPerson.countDocuments(query);

    res.status(200).json({
      people,
      totalPeople,
    });
  } catch (error) {
    console.error("Error in getRecommendedPersons:", error);
    next(error);
  }
};

// Delete a recommended person
const deleteRecommendedPerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const person = await RecommendedPerson.findById(id);

    if (!person) {
      return next(errorHandler(404, "Recommended person not found"));
    }

    // Delete images from Cloudinary
    if (person.image) {
      await deleteFromCloudinary(person.image);
    }
    if (person.additionalImages.length > 0) {
      await Promise.all(
        person.additionalImages.map((url) => deleteFromCloudinary(url))
      );
    }

    // Delete person from database
    await RecommendedPerson.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Recommended person deleted successfully" });
  } catch (error) {
    console.error("Error in deleteRecommendedPerson:", error);
    next(error);
  }
};

// Get recommended persons by category (for related persons carousel)
const getRecommendedPersonsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;

    if (!category) {
      return next(errorHandler(400, "Category parameter is required"));
    }

    // Decode the category
    const decodedCategory = decodeURIComponent(category);

    // Find people in the same category, sorted by most recently updated
    const people = await RecommendedPerson.find({
      category: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
    }).sort({ updatedAt: -1 });

    res.status(200).json(people);
  } catch (error) {
    console.error("Error in getRecommendedPersonsByCategory:", error);
    next(error);
  }
};

module.exports = {
  createRecommendedPerson,
  updateRecommendedPerson,
  getRecommendedPersonBySlug,
  getRecommendedPersons,
  deleteRecommendedPerson,
  getRecommendedPersonsByCategory,
};
