// const FamousPerson = require("../models/famousPeopleModel.js");
// const { errorHandler } = require("../middlewares/errorHandling.js");
// const cloudinary = require("cloudinary").v2;
// const fs = require("fs").promises;

// // Cloudinary configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Helper function to upload image to Cloudinary
// const uploadToCloudinary = async (
//   file,
//   folder = "PrideOfTheWorld/FamousPeople/images"
// ) => {
//   try {
//     const filePath = file.path || file.tempFilePath || file.filepath;
//     if (!filePath) {
//       throw new Error("No file path found");
//     }
//     const result = await cloudinary.uploader.upload(filePath, {
//       folder: folder,
//       resource_type: "auto",
//     });
//     await fs.unlink(filePath);
//     return result.secure_url;
//   } catch (error) {
//     throw new Error(`Cloudinary upload failed: ${error.message}`);
//   }
// };

// // Helper function to delete image from Cloudinary
// const deleteFromCloudinary = async (url) => {
//   try {
//     if (!url) return;
//     const urlParts = url.split("/");
//     const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));
//     if (versionIndex === -1) return;
//     const publicId = urlParts
//       .slice(versionIndex + 1)
//       .join("/")
//       .replace(/\.[^/.]+$/, "");
//     await cloudinary.uploader.destroy(publicId);
//   } catch (error) {
//     console.error(`Failed to delete from Cloudinary: ${error.message}`);
//   }
// };

// // Create a new famous person
// const createFamousPerson = async (req, res, next) => {
//   try {
//     const {
//       name,
//       category,
//       description,
//       fullDescription,
//       videoLink,
//       videoDuration,
//       profileLink,
//     } = req.body;

//     // Validate required fields
//     if (!name || !category) {
//       return next(errorHandler(400, "Name and category are required"));
//     }

//     // Check for duplicate person (based on name and category)
//     const existingPerson = await FamousPerson.findOne({ name, category });
//     if (existingPerson) {
//       return next(
//         errorHandler(400, "This person in this category already exists")
//       );
//     }

//     // Handle main image upload
//     let imageUrl = "";
//     if (req.files && req.files.image) {
//       imageUrl = await uploadToCloudinary(req.files.image);
//     }

//     // Handle additional images (up to 10)
//     let additionalImages = [];
//     if (req.files && req.files.additionalImages) {
//       const additionalFiles = Array.isArray(req.files.additionalImages)
//         ? req.files.additionalImages
//         : [req.files.additionalImages];
//       if (additionalFiles.length > 10) {
//         return next(
//           errorHandler(400, "Cannot upload more than 10 additional images")
//         );
//       }
//       additionalImages = await Promise.all(
//         additionalFiles.map((file) => uploadToCloudinary(file))
//       );
//     }

//     // Create slug from name and category
//     const slug = `${name}-${category}`
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//     // Create and save new famous person
//     const newPerson = new FamousPerson({
//       name: name.trim(),
//       category: category.trim(),
//       slug,
//       image: imageUrl,
//       description: description ? description.trim() : "",
//       fullDescription: fullDescription ? fullDescription.trim() : "",
//       videoLink: videoLink ? videoLink.trim() : "",
//       videoDuration: videoDuration ? videoDuration.trim() : "",
//       profileLink: profileLink ? profileLink.trim() : "",
//       additionalImages,
//     });

//     const savedPerson = await newPerson.save();

//     res.status(201).json({
//       success: true,
//       person: savedPerson,
//       message: "Famous person created successfully",
//     });
//   } catch (error) {
//     console.error("Error in createFamousPerson:", error);
//     next(error);
//   }
// };

// // Update an existing famous person
// const updateFamousPerson = async (req, res, next) => {
//   try {
//     const { slug } = req.params;
//     const {
//       name,
//       category,
//       description,
//       fullDescription,
//       videoLink,
//       videoDuration,
//       profileLink,
//     } = req.body;

//     // Validate required fields
//     if (!name || !category || !description) {
//       return next(
//         errorHandler(400, "Name, category, and description are required")
//       );
//     }

//     // Fetch the existing person
//     const personDoc = await FamousPerson.findOne({ slug });
//     if (!personDoc) {
//       return next(errorHandler(404, "Famous person not found"));
//     }

//     // Handle main image update
//     let imageUrl = personDoc.image;
//     if (req.files && req.files.image) {
//       if (personDoc.image) {
//         await deleteFromCloudinary(personDoc.image);
//       }
//       imageUrl = await uploadToCloudinary(req.files.image);
//     }

//     // Handle additional images update
//     let additionalImages = personDoc.additionalImages;
//     if (req.files && req.files.additionalImages) {
//       const additionalFiles = Array.isArray(req.files.additionalImages)
//         ? req.files.additionalImages
//         : [req.files.additionalImages];
//       if (additionalFiles.length + additionalImages.length > 10) {
//         return next(
//           errorHandler(400, "Total additional images cannot exceed 10")
//         );
//       }
//       const newImages = await Promise.all(
//         additionalFiles.map((file) => uploadToCloudinary(file))
//       );
//       additionalImages = [...additionalImages, ...newImages];
//     }

//     // Generate new slug
//     const newSlug = `${name}-${category}`
//       .trim()
//       .toLowerCase()
//       .replace(/[^a-zA-Z0-9]+/g, "-")
//       .replace(/^-+|-+$/g, "");

//     // Check for slug conflict
//     const slugConflict = await FamousPerson.findOne({
//       slug: newSlug,
//       _id: { $ne: personDoc._id },
//     });
//     if (slugConflict) {
//       return next(
//         errorHandler(400, "Another person with this slug already exists")
//       );
//     }

//     // Prepare update data
//     const updateData = {
//       name: name.trim(),
//       category: category.trim(),
//       slug: newSlug,
//       image: imageUrl,
//       description: description.trim(),
//       fullDescription: fullDescription
//         ? fullDescription.trim()
//         : personDoc.fullDescription,
//       videoLink: videoLink ? videoLink.trim() : personDoc.videoLink,
//       videoDuration: videoDuration
//         ? videoDuration.trim()
//         : personDoc.videoDuration,
//       profileLink: profileLink ? profileLink.trim() : personDoc.profileLink,
//       additionalImages,
//     };

//     // Update person
//     const updatedPerson = await FamousPerson.findOneAndUpdate(
//       { slug },
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!updatedPerson) {
//       return next(errorHandler(500, "Failed to update famous person"));
//     }

//     res.status(200).json({
//       success: true,
//       person: updatedPerson,
//       message: "Famous person updated successfully",
//     });
//   } catch (error) {
//     console.error("Error in updateFamousPerson:", error);
//     next(error);
//   }
// };

// // Get a single famous person by slug
// const getFamousPersonBySlug = async (req, res, next) => {
//   try {
//     const person = await FamousPerson.findOne({ slug: req.params.slug });
//     if (!person) {
//       return next(errorHandler(404, "Famous person not found"));
//     }
//     res.status(200).json(person);
//   } catch (error) {
//     next(error);
//   }
// };

// // Get all famous people with filtering and pagination
// const getFamousPeople = async (req, res, next) => {
//   try {
//     const startIndex = parseInt(req.query.startIndex, 10) || 0;
//     const limit = parseInt(req.query.limit, 10) || 9;
//     const sortDirection = req.query.order === "asc" ? 1 : -1;

//     const query = {
//       ...(req.query.category && { category: req.query.category }),
//       ...(req.query.searchTerm && {
//         $or: [
//           { name: { $regex: req.query.searchTerm, $options: "i" } },
//           { description: { $regex: req.query.searchTerm, $options: "i" } },
//         ],
//       }),
//     };

//     const people = await FamousPerson.find(query)
//       .sort({ updatedAt: sortDirection })
//       .skip(startIndex)
//       .limit(limit);

//     const totalPeople = await FamousPerson.countDocuments(query);

//     res.status(200).json({
//       people,
//       totalPeople,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Delete a famous person
// const deleteFamousPerson = async (req, res, next) => {
//   try {
//     const { personId } = req.params;
//     const person = await FamousPerson.findById(personId);

//     if (!person) {
//       return next(errorHandler(404, "Famous person not found"));
//     }

//     // Delete images from Cloudinary
//     if (person.image) {
//       await deleteFromCloudinary(person.image);
//     }
//     if (person.additionalImages.length > 0) {
//       await Promise.all(
//         person.additionalImages.map((url) => deleteFromCloudinary(url))
//       );
//     }

//     // Delete person from database
//     await FamousPerson.findByIdAndDelete(personId);
//     res.status(200).json({ message: "Famous person deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting famous person:", error);
//     next(error);
//   }
// };
// // Get famous people by category (for related persons carousel)
// const getFamousPeopleByCategory = async (req, res, next) => {
//   try {
//     const { category } = req.params;

//     if (!category) {
//       return next(errorHandler(400, "Category parameter is required"));
//     }

//     // Decode the category (in case it contains special characters)
//     const decodedCategory = decodeURIComponent(category);

//     // Find people in the same category, sorted by most recently updated
//     const people = await FamousPerson.find({
//       category: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
//     }).sort({ updatedAt: -1 });

//     res.status(200).json(people);
//   } catch (error) {
//     console.error("Error in getFamousPeopleByCategory:", error);
//     next(error);
//   }
// };

// module.exports = {
//   createFamousPerson,
//   updateFamousPerson,
//   getFamousPersonBySlug,
//   getFamousPeople,
//   deleteFamousPerson,
//   getFamousPeopleByCategory,
// };
const FamousPerson = require("../models/famousPeopleModel.js");
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
  folder = "PrideOfTheWorld/FamousPeople/images"
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

// Create a new famous person
const createFamousPerson = async (req, res, next) => {
  try {
    const {
      name,
      category,
      country,
      continent,
      description,
      fullDescription,
      videoLink,
      videoDuration,
      profileLink,
    } = req.body;

    // Validate required fields
    if (!name || !category || !country || !continent) {
      return next(
        errorHandler(400, "Name, category, country, and continent are required")
      );
    }

    // Check for duplicate person (based on name, category, and country)
    const existingPerson = await FamousPerson.findOne({
      name,
      category,
      country,
    });
    if (existingPerson) {
      return next(
        errorHandler(
          400,
          "This person in this category and country already exists"
        )
      );
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

    // Create and save new famous person
    const newPerson = new FamousPerson({
      name: name.trim(),
      category: category.trim(),
      country: country.trim(),
      continent: continent.trim(),
      slug,
      image: imageUrl,
      description: description ? description.trim() : "",
      fullDescription: fullDescription ? fullDescription.trim() : "",
      videoLink: videoLink ? videoLink.trim() : "",
      videoDuration: videoDuration ? videoDuration.trim() : "",
      profileLink: profileLink ? profileLink.trim() : "",
      additionalImages,
    });

    const savedPerson = await newPerson.save();

    res.status(201).json({
      success: true,
      person: savedPerson,
      message: "Famous person created successfully",
    });
  } catch (error) {
    console.error("Error in createFamousPerson:", error);
    next(error);
  }
};

// Update an existing famous person
const updateFamousPerson = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const {
      name,
      category,
      country,
      continent,
      description,
      fullDescription,
      videoLink,
      videoDuration,
      profileLink,
    } = req.body;

    // Validate required fields
    if (!name || !category || !country || !continent || !description) {
      return next(
        errorHandler(
          400,
          "Name, category, country, continent, and description are required"
        )
      );
    }

    // Fetch the existing person
    const personDoc = await FamousPerson.findOne({ slug });
    if (!personDoc) {
      return next(errorHandler(404, "Famous person not found"));
    }

    // Handle main image update
    let imageUrl = personDoc.image;
    if (req.files && req.files.image) {
      if (personDoc.image) {
        await deleteFromCloudinary(personDoc.image);
      }
      imageUrl = await uploadToCloudinary(req.files.image);
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
    const slugConflict = await FamousPerson.findOne({
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
      category: category.trim(),
      country: country.trim(),
      continent: continent.trim(),
      slug: newSlug,
      image: imageUrl,
      description: description.trim(),
      fullDescription: fullDescription
        ? fullDescription.trim()
        : personDoc.fullDescription,
      videoLink: videoLink ? videoLink.trim() : personDoc.videoLink,
      videoDuration: videoDuration
        ? videoDuration.trim()
        : personDoc.videoDuration,
      profileLink: profileLink ? profileLink.trim() : personDoc.profileLink,
      additionalImages,
    };

    // Update person
    const updatedPerson = await FamousPerson.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedPerson) {
      return next(errorHandler(500, "Failed to update famous person"));
    }

    res.status(200).json({
      success: true,
      person: updatedPerson,
      message: "Famous person updated successfully",
    });
  } catch (error) {
    console.error("Error in updateFamousPerson:", error);
    next(error);
  }
};

// Get a single famous person by slug
const getFamousPersonBySlug = async (req, res, next) => {
  try {
    const person = await FamousPerson.findOne({ slug: req.params.slug });
    if (!person) {
      return next(errorHandler(404, "Famous person not found"));
    }
    res.status(200).json(person);
  } catch (error) {
    next(error);
  }
};

// Get all famous people with filtering and pagination
const getFamousPeople = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 9;
    const sortDirection = req.query.order === "asc" ? 1 : -1;

    const query = {
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.country && { country: req.query.country }),
      ...(req.query.continent && { continent: req.query.continent }),
      ...(req.query.searchTerm && {
        $or: [
          { name: { $regex: req.query.searchTerm, $options: "i" } },
          { description: { $regex: req.query.searchTerm, $options: "i" } },
        ],
      }),
    };

    const people = await FamousPerson.find(query)
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPeople = await FamousPerson.countDocuments(query);

    res.status(200).json({
      people,
      totalPeople,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a famous person
const deleteFamousPerson = async (req, res, next) => {
  try {
    const { personId } = req.params;
    const person = await FamousPerson.findById(personId);

    if (!person) {
      return next(errorHandler(404, "Famous person not found"));
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
    await FamousPerson.findByIdAndDelete(personId);
    res.status(200).json({ message: "Famous person deleted successfully" });
  } catch (error) {
    console.error("Error deleting famous person:", error);
    next(error);
  }
};

// Get famous people by category (for related persons carousel)
const getFamousPeopleByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { country, continent } = req.query;

    if (!category) {
      return next(errorHandler(400, "Category parameter is required"));
    }

    // Decode the category (in case it contains special characters)
    const decodedCategory = decodeURIComponent(category);

    // Build query
    const query = {
      category: { $regex: new RegExp(`^${decodedCategory}$`, "i") },
      ...(country && { country }),
      ...(continent && { continent }),
    };

    // Find people in the same category, sorted by most recently updated
    const people = await FamousPerson.find(query).sort({ updatedAt: -1 });

    res.status(200).json(people);
  } catch (error) {
    console.error("Error in getFamousPeopleByCategory:", error);
    next(error);
  }
};

module.exports = {
  createFamousPerson,
  updateFamousPerson,
  getFamousPersonBySlug,
  getFamousPeople,
  deleteFamousPerson,
  getFamousPeopleByCategory,
};
