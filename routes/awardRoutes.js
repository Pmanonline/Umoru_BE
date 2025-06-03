const express = require("express");
const router = express.Router();
const {
  createAward,
  updateAward,
  getRelatedAwards,
  getAwards,
  getAwardById,
  getAwardBySlug,
  deleteAward,
} = require("../controllers/awardController.js");

// Public routes
router.get("/getAwards", getAwards);
router.get("/getRelatedAwards", getRelatedAwards);
router.get("/getAwardById/:awardId", getAwardById);
router.get("/getAwardBySlug/:slug", getAwardBySlug);

// Admin routes
router.post("/createAward", createAward);
router.put("/updateAward/:slug", updateAward);
router.delete("/deleteAward/:awardId", deleteAward);

module.exports = router;
