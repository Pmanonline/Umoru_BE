const express = require("express");
const router = express.Router();
const {
  createResource,
  getAllResources,
  getResourceById,
  updateResource,
  deleteResource,
  incrementDownload,
} = require("../controllers/resourceController");

// Middleware for file type validation
const validateFileType = (req, res, next) => {
  if (!req.files || (!req.files.resource && !req.files.thumbnail)) {
    if (req.method === "POST") {
      return res.status(400).json({
        success: false,
        message: "Resource file is required for POST requests",
      });
    }
    return next(); // No file uploaded for PUT, continue
  }

  const files = [req.files.resource, req.files.thumbnail].filter(Boolean);
  const allowedResourceTypes = [
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
    "application/epub+zip",
  ];
  const allowedThumbnailTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ];
  const maxResourceSize = 500 * 1024 * 1024; // 500MB
  const maxThumbnailSize = 5 * 1024 * 1024; // 5MB

  for (const file of files) {
    const isResource = file === req.files.resource;
    const allowedTypes = isResource
      ? allowedResourceTypes
      : allowedThumbnailTypes;
    const maxSize = isResource ? maxResourceSize : maxThumbnailSize;
    const fieldName = isResource ? "resource" : "thumbnail";

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Error: Invalid file type for ${fieldName}. Allowed types: ${
          isResource ? "PDF, MP3, MP4, EPUB" : "JPEG, JPG, PNG, GIF"
        }`,
      });
    }

    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `Error: ${fieldName} file size cannot exceed ${
          isResource ? "500MB" : "5MB"
        }`,
      });
    }
  }

  next();
};

// Define routes for resources
router.post("/resources", validateFileType, createResource);
router.get("/resources", getAllResources);
router.get("/resources/:id", getResourceById);
router.put("/resources/:id", validateFileType, updateResource);
router.delete("/resources/:id", deleteResource);
router.put("/resources/:id/download", incrementDownload);

module.exports = router;
