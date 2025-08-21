const Resource = require("../models/resourceModel");
const Author = require("../models/authorModel"); // Assume this exists
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;
const { errorHandler } = require("../middlewares/errorHandling");

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder = "umoru_resources") => {
  try {
    if (!file?.tempFilePath) {
      throw new Error("No temp file path found");
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: folder,
      resource_type: "auto",
    });

    // Clean up temp file
    await fs.unlink(file.tempFilePath);
    return result.secure_url;
  } catch (error) {
    console.error("Upload to Cloudinary failed:", error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Helper function to delete file from Cloudinary
const deleteFromCloudinary = async (url) => {
  try {
    if (!url) return;

    // Parse the Cloudinary URL
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
      console.log(`Successfully deleted file from Cloudinary: ${publicId}`);
    } else {
      console.error(`Deletion failed for: ${publicId}`, result);
    }
  } catch (error) {
    console.error(`Failed to delete from Cloudinary:`, error);
  }
};

exports.createResource = async (req, res, next) => {
  try {
    const {
      title,
      category,
      format,
      size,
      duration,
      author,
      description,
      tags,
    } = req.body;

    // Validate required fields
    if (!title || !category || !format || !size || !author || !description) {
      return next(
        errorHandler(400, "Missing required fields", {
          title: !title ? "Title is required" : undefined,
          category: !category ? "Category is required" : undefined,
          format: !format ? "Format is required" : undefined,
          size: !size ? "Size is required" : undefined,
          author: !author ? "Author is required" : undefined,
          description: !description ? "Description is required" : undefined,
        })
      );
    }

    // Validate resource file
    if (!req.files || !req.files.resource) {
      return next(errorHandler(400, "Resource file is required"));
    }

    // Parse and validate author IDs
    let parsedAuthors = [];
    if (author && author !== "[]") {
      try {
        parsedAuthors = Array.isArray(author) ? author : JSON.parse(author);
      } catch (error) {
        console.error("Error parsing authors:", error);
        return next(errorHandler(400, "Invalid author format"));
      }
    }

    if (parsedAuthors.length > 0) {
      const validAuthors = await Author.find({ _id: { $in: parsedAuthors } });
      if (validAuthors.length !== parsedAuthors.length) {
        return next(
          errorHandler(
            400,
            "One or more author IDs are invalid",
            `Provided author IDs: ${parsedAuthors}, Valid authors found: ${validAuthors.length}`
          )
        );
      }
    }

    // Upload resource file to Cloudinary
    let resourceUrl;
    try {
      resourceUrl = await uploadToCloudinary(
        req.files.resource,
        "umoru_resources"
      );
    } catch (uploadError) {
      return next(
        errorHandler(500, `Resource upload failed: ${uploadError.message}`)
      );
    }

    // Upload thumbnail to Cloudinary if provided
    let thumbnailUrl = req.body.thumbnail || "";
    if (req.files?.thumbnail) {
      try {
        thumbnailUrl = await uploadToCloudinary(
          req.files.thumbnail,
          "umoru_resources/thumbnails"
        );
      } catch (uploadError) {
        return next(
          errorHandler(500, `Thumbnail upload failed: ${uploadError.message}`)
        );
      }
    }

    const resource = new Resource({
      title,
      category,
      format,
      size,
      duration,
      author: parsedAuthors,
      description,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      url: resourceUrl,
      thumbnail: thumbnailUrl,
    });

    const savedResource = await resource.save();

    res.status(201).json({
      success: true,
      message: "Resource created successfully",
      data: savedResource,
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    next(
      errorHandler(
        500,
        "An error occurred while creating the resource",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};

exports.getAllResources = async (req, res, next) => {
  try {
    const { startIndex = 0, limit = 10 } = req.query;
    const resources = await Resource.find()
      .populate("author", "name")
      .skip(parseInt(startIndex))
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const totalResources = await Resource.countDocuments();

    res.status(200).json({
      success: true,
      message: "Resources retrieved successfully",
      totalResources,
      resources,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    next(
      errorHandler(
        500,
        "An error occurred while fetching resources",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};

exports.getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      "author",
      "name"
    );
    if (!resource) {
      return next(errorHandler(404, "Resource not found"));
    }
    res.status(200).json({
      success: true,
      message: "Resource retrieved successfully",
      data: resource,
    });
  } catch (error) {
    console.error("Error fetching resource:", error);
    next(
      errorHandler(
        500,
        "An error occurred while fetching the resource",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};

exports.updateResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      format,
      size,
      duration,
      author,
      description,
      tags,
    } = req.body;

    const resource = await Resource.findById(id);
    if (!resource) {
      return next(errorHandler(404, "Resource not found"));
    }

    // Handle resource file update
    let resourceUrl = resource.url;
    if (req.files?.resource) {
      try {
        if (resource.url) {
          await deleteFromCloudinary(resource.url);
        }
        resourceUrl = await uploadToCloudinary(
          req.files.resource,
          "umoru_resources"
        );
      } catch (uploadError) {
        return next(
          errorHandler(500, `Resource upload failed: ${uploadError.message}`)
        );
      }
    }

    // Handle thumbnail update
    let thumbnailUrl = resource.thumbnail;
    if (req.files?.thumbnail) {
      try {
        if (resource.thumbnail) {
          await deleteFromCloudinary(resource.thumbnail);
        }
        thumbnailUrl = await uploadToCloudinary(
          req.files.thumbnail,
          "umoru_resources/thumbnails"
        );
      } catch (uploadError) {
        return next(
          errorHandler(500, `Thumbnail upload failed: ${uploadError.message}`)
        );
      }
    }

    // Parse and validate author IDs
    let parsedAuthors = resource.author;
    if (author && author !== "[]") {
      try {
        parsedAuthors = Array.isArray(author) ? author : JSON.parse(author);
      } catch (error) {
        console.error("Error parsing authors:", error);
        return next(errorHandler(400, "Invalid author format"));
      }

      if (parsedAuthors.length > 0) {
        const validAuthors = await Author.find({ _id: { $in: parsedAuthors } });
        if (validAuthors.length !== parsedAuthors.length) {
          return next(
            errorHandler(
              400,
              "One or more author IDs are invalid",
              `Provided author IDs: ${parsedAuthors}, Valid authors found: ${validAuthors.length}`
            )
          );
        }
      }
    }

    const updateData = {
      title,
      category,
      format,
      size,
      duration,
      author: parsedAuthors,
      description,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : resource.tags,
      url: resourceUrl,
      thumbnail: thumbnailUrl,
      updatedAt: Date.now(),
    };

    const updatedResource = await Resource.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Resource updated successfully",
      data: updatedResource,
    });
  } catch (error) {
    console.error("Error updating resource:", error);
    next(
      errorHandler(
        500,
        "An error occurred while updating the resource",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findById(id);

    if (!resource) {
      return next(errorHandler(404, "Resource not found"));
    }

    // Delete resource file from Cloudinary
    if (resource.url) {
      await deleteFromCloudinary(resource.url);
    }

    // Delete thumbnail from Cloudinary if it exists
    if (resource.thumbnail) {
      await deleteFromCloudinary(resource.thumbnail);
    }

    await Resource.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    next(
      errorHandler(
        500,
        "An error occurred while deleting the resource",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};

exports.incrementDownload = async (req, res, next) => {
  try {
    const { id } = req.params;
    const resource = await Resource.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    ).populate("author", "name");

    if (!resource) {
      return next(errorHandler(404, "Resource not found"));
    }

    res.status(200).json({
      success: true,
      message: "Download count updated",
      data: resource,
    });
  } catch (error) {
    console.error("Error incrementing download:", error);
    next(
      errorHandler(
        500,
        "An error occurred while updating download count",
        process.env.NODE_ENV === "development" ? error.message : undefined,
        process.env.NODE_ENV === "development" ? error.stack : undefined
      )
    );
  }
};
