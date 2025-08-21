const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createComment,
  getPostComments,
  likeComment,
  dislikeComment,
  editComment,
  deleteComment,
  flagComment,
  getComments,
} = require("../controllers/commentsController");

// Middleware for authentication (example, adjust as needed)

router.post("/createComment", createComment);
router.put("/editComment/:commentId", editComment);
router.delete("/deleteComment/:commentId", deleteComment);
router.get("/getPostComments/:postId", getPostComments);
router.post("/likeComment/:commentId", likeComment);
router.post("/dislikeComment/:commentId", dislikeComment); // Fixed double authenticate
router.post("/flagComment/:commentId", flagComment);
router.get("/getComments", getComments);

module.exports = router;
