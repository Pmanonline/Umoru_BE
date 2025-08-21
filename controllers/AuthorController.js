// const Author = require("../models/authorModel.js");
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
// const uploadToCloudinary = async (file, folder = "Credulen/authors") => {
//   try {
//     if (!file?.tempFilePath) {
//       throw new Error("No temp file path found");
//     }

//     const result = await cloudinary.uploader.upload(file.tempFilePath, {
//       folder: folder,
//       resource_type: "auto",
//     });

//     // Clean up temp file
//     await fs.unlink(file.tempFilePath);
//     return result.secure_url;
//   } catch (error) {
//     console.error("Upload to Cloudinary failed:", error);
//     throw new Error(`Cloudinary upload failed: ${error.message}`);
//   }
// };

// // Helper function to delete image from Cloudinary
// const deleteFromCloudinary = async (url) => {
//   try {
//     if (!url) return;

//     const urlParts = url.split("/");
//     const versionIndex = urlParts.findIndex((part) => part.startsWith("v"));

//     if (versionIndex === -1) {
//       console.error(`Invalid Cloudinary URL format: ${url}`);
//       return;
//     }

//     const publicId = urlParts
//       .slice(versionIndex + 1)
//       .join("/")
//       .replace(/\.[^/.]+$/, "");

//     const result = await cloudinary.uploader.destroy(publicId);

//     if (result.result === "ok") {
//       console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
//     } else {
//       console.error(`Deletion failed for: ${publicId}`, result);
//     }
//   } catch (error) {
//     console.error(`Failed to delete from Cloudinary:`, error);
//   }
// };

// const createAuthor = async (req, res, next) => {
//   try {
//     const { name, bio, email, socialMedia, website } = req.body;

//     if (!name) {
//       return next(errorHandler(400, "Author name is required"));
//     }
//     if (!email) {
//       return next(errorHandler(400, "Email is required"));
//     }

//     const existingAuthor = await Author.findOne({
//       $or: [{ name }, { email }],
//     });
//     if (existingAuthor) {
//       return res.status(400).json({
//         message: "Author with the same name or email already exists",
//       });
//     }

//     // Handle image upload to Cloudinary
//     let imageUrl = null;
//     if (req.files && req.files.image) {
//       try {
//         imageUrl = await uploadToCloudinary(req.files.image);
//       } catch (uploadError) {
//         return next(
//           errorHandler(500, `Image upload failed: ${uploadError.message}`)
//         );
//       }
//     }

//     const newAuthor = new Author({
//       name,
//       bio,
//       email,
//       image: imageUrl,
//       socialMedia,
//       website,
//     });

//     const savedAuthor = await newAuthor.save();
//     res.status(201).json(savedAuthor);
//   } catch (error) {
//     console.error("Error creating author:", error);
//     next(error);
//   }
// };

// const updateAuthor = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { name, bio, email, socialMedia, website } = req.body;

//     if (!name) {
//       return next(errorHandler(400, "Author name is required"));
//     }
//     if (!email) {
//       return next(errorHandler(400, "Email is required"));
//     }

//     const existingAuthor = await Author.findById(id);
//     if (!existingAuthor) {
//       return res.status(404).json({ message: "Author not found" });
//     }

//     // Handle image update
//     let imageUrl = existingAuthor.image;
//     if (req.files && req.files.image) {
//       try {
//         // Delete old image if it exists
//         if (existingAuthor.image) {
//           await deleteFromCloudinary(existingAuthor.image);
//         }
//         // Upload new image
//         imageUrl = await uploadToCloudinary(req.files.image);
//       } catch (uploadError) {
//         return next(
//           errorHandler(500, `Image upload failed: ${uploadError.message}`)
//         );
//       }
//     }

//     const updatedAuthor = await Author.findByIdAndUpdate(
//       id,
//       {
//         name,
//         bio,
//         email,
//         image: imageUrl,
//         socialMedia,
//         website,
//       },
//       { new: true, runValidators: true }
//     );

//     res.status(200).json(updatedAuthor);
//   } catch (error) {
//     console.error("Error updating author:", error);
//     next(error);
//   }
// };

// const deleteAuthor = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const author = await Author.findById(id);
//     if (!author) {
//       return res.status(404).json({ message: "Author not found" });
//     }

//     // Delete image from Cloudinary if it exists
//     if (author.image) {
//       await deleteFromCloudinary(author.image);
//     }

//     // Delete author from database
//     await Author.findByIdAndDelete(id);
//     res.status(200).json({ message: "Author deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting author:", error);
//     next(error);
//   }
// };

// // Keep existing getAuthorById and getAllAuthors functions as they are
// const getAuthorById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const author = await Author.findById(id);
//     if (!author) {
//       return res.status(404).json({ message: "Author not found" });
//     }
//     res.status(200).json(author);
//   } catch (error) {
//     console.error("Error retrieving author:", error);
//     next(error);
//   }
// };

// const getAllAuthors = async (req, res, next) => {
//   try {
//     const authors = await Author.find({});
//     res.status(200).json(authors);
//   } catch (error) {
//     console.error("Error retrieving authors:", error);
//     next(error);
//   }
// };

// module.exports = {
//   createAuthor,
//   updateAuthor,
//   getAuthorById,
//   getAllAuthors,
//   deleteAuthor,
// };

const Author = require("../models/authorModel.js");
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
const uploadToCloudinary = async (file, folder = "Credulen/authors") => {
  try {
    if (!file?.tempFilePath) {
      throw new Error("No temp file path found");
    }

    // Validate file MIME type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(
        "You can only upload image files (jpeg, jpg, png, gif, svg)!"
      );
    }

    console.log("Uploading file:", file.mimetype, file.tempFilePath); // Debug log
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: folder,
      resource_type: "image", // Explicitly set to image to enforce type
    });

    console.log("Cloudinary result:", result); // Debug log
    await fs.unlink(file.tempFilePath);
    return result.secure_url;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    throw error; // Re-throw to be caught by the caller
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

const createAuthor = async (req, res, next) => {
  try {
    const { name, bio, email, socialMedia, website } = req.body;

    if (!name) {
      return next(errorHandler(400, "Author name is required"));
    }
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    const existingAuthor = await Author.findOne({
      $or: [{ name }, { email }],
    });
    if (existingAuthor) {
      return res.status(400).json({
        message: "Author with the same name or email already exists",
      });
    }

    // Handle image upload to Cloudinary
    let imageUrl = null;
    if (req.files && req.files.image) {
      try {
        imageUrl = await uploadToCloudinary(req.files.image);
      } catch (uploadError) {
        return next(errorHandler(400, uploadError.message)); // Use 400 for validation errors
      }
    }

    const newAuthor = new Author({
      name,
      bio,
      email,
      image: imageUrl,
      socialMedia,
      website,
    });

    const savedAuthor = await newAuthor.save();
    res.status(201).json(savedAuthor);
  } catch (error) {
    console.error("Error creating author:", error);
    next(error);
  }
};

const updateAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, bio, email, socialMedia, website } = req.body;

    if (!name) {
      return next(errorHandler(400, "Author name is required"));
    }
    if (!email) {
      return next(errorHandler(400, "Email is required"));
    }

    const existingAuthor = await Author.findById(id);
    if (!existingAuthor) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Handle image update
    let imageUrl = existingAuthor.image;
    if (req.files && req.files.image) {
      try {
        // Delete old image if it exists
        if (existingAuthor.image) {
          await deleteFromCloudinary(existingAuthor.image);
        }
        // Upload new image
        imageUrl = await uploadToCloudinary(req.files.image);
      } catch (uploadError) {
        return next(errorHandler(400, uploadError.message)); // Use 400 for validation errors
      }
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      {
        name,
        bio,
        email,
        image: imageUrl,
        socialMedia,
        website,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAuthor);
  } catch (error) {
    console.error("Error updating author:", error);
    next(error);
  }
};

const deleteAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }

    // Delete image from Cloudinary if it exists
    if (author.image) {
      await deleteFromCloudinary(author.image);
    }

    // Delete author from database
    await Author.findByIdAndDelete(id);
    res.status(200).json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error);
    next(error);
  }
};

// Keep existing getAuthorById and getAllAuthors functions as they are
const getAuthorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const author = await Author.findById(id);
    if (!author) {
      return res.status(404).json({ message: "Author not found" });
    }
    res.status(200).json(author);
  } catch (error) {
    console.error("Error retrieving author:", error);
    next(error);
  }
};

const getAllAuthors = async (req, res, next) => {
  try {
    const authors = await Author.find({});
    res.status(200).json(authors);
  } catch (error) {
    console.error("Error retrieving authors:", error);
    next(error);
  }
};

module.exports = {
  createAuthor,
  updateAuthor,
  getAuthorById,
  getAllAuthors,
  deleteAuthor,
};
