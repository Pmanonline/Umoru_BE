const express = require("express");
const router = express.Router();
const {
  createNomination,
  updateNomination,
  getRelatedNominations,
  getNominations,
  getNominationById,
  getNominationBySlug,
  deleteNomination,
  updateNominationStatus,
} = require("../controllers/nominateController");
const { protect } = require("../middlewares/authMiddleware");

// Routes for nomination management
router.post("/createNomination", protect, createNomination);

router.put("/updateNomination/:slug", updateNomination);

router.get("/getNominationBySlug/:slug", getNominationBySlug);

router.get("/getNominationById/:nominationId", getNominationById);

router.get("/getNominations", getNominations);

router.get("/getRelatedNominations", getRelatedNominations);

router.delete("/deleteNomination/:nominationId", deleteNomination);
router.patch("/updateNominationStatus/:nominationId", updateNominationStatus);

module.exports = router;
