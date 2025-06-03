const express = require("express");
const router = express.Router();
const {
  createRecommendedPerson,
  getRecommendedPersons,
  getRecommendedPersonBySlug,
  updateRecommendedPerson,
  deleteRecommendedPerson,
  getRecommendedPersonsByCategory,
} = require("../controllers/recommendedPersonController");

router.post("/createRecommendedPerson", createRecommendedPerson);
router.get("/getRecommendedPersons", getRecommendedPersons);
router.get("/getRecommendedPersonBySlug/:slug", getRecommendedPersonBySlug);
router.put("/updateRecommendedPerson/:slug", updateRecommendedPerson);
router.delete("/deleteRecommendedPerson/:id", deleteRecommendedPerson);
router.get(
  "/getRecommendedPersonsByCategory/:category",
  getRecommendedPersonsByCategory
);

module.exports = router;
