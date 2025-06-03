const express = require("express");
const router = express.Router();
const {
  getWinners,
  getWinnerBySlug,
  createWinner,
  updateWinner,
  deleteWinner,
} = require("../controllers/winnerController");

router.post("/createWinner", createWinner);
router.get("/getWinners", getWinners);
router.put("/updateWinner/:slug", updateWinner);
router.get("/getWinnerBySlug/:slug", getWinnerBySlug);
router.delete("/deleteWinner/:id", deleteWinner);

module.exports = router;
