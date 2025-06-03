const express = require("express");
const router = express.Router();
const {
  createPride,
  updatePride,
  getPrideBySlug,
  getPrideEntries,
  deletePride,
} = require("../controllers/prideController");

router.post("/createPride", createPride);
router.put("/updatePride/:slug", updatePride);
router.get("/getPrideBySlug/:slug", getPrideBySlug);
router.get("/getPrideEntries", getPrideEntries);
router.delete("/deletePride/:prideId", deletePride);

module.exports = router;
