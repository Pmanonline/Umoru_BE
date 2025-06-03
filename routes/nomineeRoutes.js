const express = require("express");
const router = express.Router();
const {
  getNominees,
  getNomineeBySlug,
  createNominee,
  updateNominee,
  deleteNominee,
  submitVote,
  getLeaderboard,
} = require("../controllers/nomineeController");
const { protect } = require("../middlewares/authMiddleware");

router.post("/createNominee", protect, createNominee);
router.put("/updateNominee/:slug", protect, updateNominee);
router.get("/getNomineeBySlug/:slug", protect, getNomineeBySlug);
router.get("/getNominees", getNominees);
router.delete("/deleteNominee/:id", protect, deleteNominee);
router.post("/submitVote/:id", protect, submitVote);
router.route("/leaderboard").get(getLeaderboard);

module.exports = router;
