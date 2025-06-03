const express = require("express");
const router = express.Router();
const {
  createFamousPerson,
  updateFamousPerson,
  getFamousPersonBySlug,
  getFamousPeople,
  deleteFamousPerson,
  getFamousPeopleByCategory,
} = require("../controllers/famousPeopleController");

router.post("/createFamousPerson", createFamousPerson);
router.put("/updateFamousPerson/:slug", updateFamousPerson);
router.get("/getFamousPersonBySlug/:slug", getFamousPersonBySlug);
router.get("/getFamousPeopleByCategory/:category", getFamousPeopleByCategory);
router.get("/getFamousPeople", getFamousPeople);
router.delete("/deleteFamousPerson/:personId", deleteFamousPerson);

module.exports = router;
