const Comment = require("../models/commentsModel");
const Post = require("../models/blogModel");
const { errorHandler } = require("../middlewares/errorHandling");

const createComment = async (req, res, next) => {
  try {
    const { content, postId, userId, parentId } = req.body;
    console.log(content, "content");
    console.log(postId, "postId");
    console.log(userId, "userId");
    console.log(parentId, "parentId");

    if (!content || !postId || !userId) {
      return next(
        errorHandler(400, "Content, post ID, and user ID are required")
      );
    }

    const newComment = new Comment({
      content,
      postId,
      userId,
      parentId,
    });

    const savedComment = await newComment.save();
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: savedComment._id },
    });

    res.status(201).json(savedComment);
  } catch (error) {
    next(errorHandler(500, "Failed to create comment", error));
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId })
      .populate("userId", "username image")
      .exec();

    if (!comments) {
      return res.status(404).json({ message: "No comments found" });
    }
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    next(errorHandler(500, "Failed to fetch comments", error));
  }
};

const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(errorHandler(404, "Comment not found"));

    const userId = req.body.userId;
    if (!userId) return next(errorHandler(400, "User ID is required"));

    const userIdString = userId.toString();
    const likeIndex = comment.likes.findIndex(
      (id) => id.toString() === userIdString
    );
    const dislikeIndex = comment.dislikes.findIndex(
      (id) => id.toString() === userIdString
    );

    if (likeIndex === -1) {
      comment.likes.push(userId);
      if (dislikeIndex !== -1) {
        comment.dislikes.splice(dislikeIndex, 1);
      }
    } else {
      comment.likes.splice(likeIndex, 1);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(errorHandler(500, "Failed to like comment", error));
  }
};

const dislikeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(errorHandler(404, "Comment not found"));

    const userId = req.body.userId;
    if (!userId) return next(errorHandler(400, "User ID is required"));

    const userIdString = userId.toString();
    const likeIndex = comment.likes.findIndex(
      (id) => id.toString() === userIdString
    );
    const dislikeIndex = comment.dislikes.findIndex(
      (id) => id.toString() === userIdString
    );

    if (dislikeIndex === -1) {
      comment.dislikes.push(userId);
      if (likeIndex !== -1) {
        comment.likes.splice(likeIndex, 1);
      }
    } else {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    next(errorHandler(500, "Failed to dislike comment", error));
  }
};

const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(errorHandler(404, "Comment not found"));

    if (comment.userId.toString() !== req.body.userId) {
      return next(errorHandler(403, "Unauthorized to edit this comment"));
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.commentId,
      {
        content: req.body.content,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("userId", "username avatar");

    res.status(200).json(updatedComment);
  } catch (error) {
    next(errorHandler(500, "Failed to edit comment", error));
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(errorHandler(404, "Comment not found"));

    if (comment.userId.toString() !== req.body.userId && !req.user.isAdmin) {
      return next(errorHandler(403, "Unauthorized to delete this comment"));
    }

    await Comment.deleteMany({ parentId: comment._id }); // Delete all replies
    await Comment.findByIdAndDelete(req.params.commentId);
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id },
    });

    res.status(200).json("Comment and its replies have been deleted");
  } catch (error) {
    next(errorHandler(500, "Failed to delete comment", error));
  }
};

const flagComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return next(errorHandler(404, "Comment not found"));

    const { userId, reason } = req.body;
    if (!userId || !reason)
      return next(errorHandler(400, "User ID and reason are required"));

    const flagExists = comment.flags.some(
      (flag) => flag.userId.toString() === userId.toString()
    );
    if (flagExists)
      return next(errorHandler(400, "You have already flagged this comment"));

    comment.flags.push({ userId, reason });
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    next(errorHandler(500, "Failed to flag comment", error));
  }
};

const getComments = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === "desc" ? -1 : 1;
    const query = {};

    if (req.query.postId) query.postId = req.query.postId;
    if (req.query.userId) query.userId = req.query.userId;

    const comments = await Comment.find(query)
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .populate("userId", "username avatar image picture")
      .populate("postId", "title")
      .populate("parentId", "content userId");

    const totalComments = await Comment.countDocuments(query);
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
      ...query,
    });

    res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (error) {
    next(errorHandler(500, "Failed to fetch comments", error));
  }
};

module.exports = {
  createComment,
  getPostComments,
  likeComment,
  dislikeComment,
  editComment,
  deleteComment,
  flagComment,
  getComments,
};
