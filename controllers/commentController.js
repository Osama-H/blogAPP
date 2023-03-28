const catchAsync = require("../utils/catchAsync");
const AppError = require("./../utils/AppError");
const Comment = require("./../models/commentModel");
const Post = require("../models/postModel");
const Reply = require("../models/replyModel");

exports.createComment = catchAsync(async (req, res, next) => {
  if (!req.body.post) {
    req.body.post = req.params.postId;
  }

  const post = await Post.findOne({id : req.body.post, status : 'published',isReady : true})
  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  if (!req.body.user) {
    req.body.user = req.user._id;
  }

  const newComment = await Comment.create(req.body);
  res.status(200).json({
    status: "success",
    newComment,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;
  const postId = req.params.postId;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError("Comment Not Found", 404));
  }
  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  if (comment.post.toString() !== post._id.toString()) {
    return next(new AppError("This Comment doesnt Belong to this Post", 400));
  }

  if (req.user.id.toString() !== comment.user._id.toString()) {
    return next(new AppError("You Can't update this Comment", 403));
  }

  const editedComment = await Comment.findByIdAndUpdate(commentId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    editedComment,
  });
});

exports.getAllComment = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postId) {
    filter = { post: req.params.postId };
  }

  const comments = await Comment.find(filter).select("-post");
  res.status(200).json({
    status: "success",
    results: comments.length,
    comments,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const commentId = req.params.id;

  const postId = req.params.postId;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError("Comment Not Found", 404));
  }

  const post = await Post.findOne({
    _id: postId,
    status: "published",
    isReady: true,
  });

  if (!post) {
    return next(new AppError("Post Not Found", 404));
  }

  if (comment.post.toString() !== post._id.toString()) {
    return next(new AppError("This Comment Doesn't Belong to this Post", 400));
  }

  if (req.user.role !== "manager") {
    if (
      req.user.role === "member" &&
      comment.user._id.toString() === req.user.id.toString()
    ) {
      await Comment.findByIdAndDelete(commentId);
      return res.status(204).json({
        status: "success",
        data: null,
      });
    }
    if (
      req.user.role === "superAdmin" &&
      post.user._id.toString() === req.user.id.toString()
    ) {
      await Comment.findByIdAndDelete(commentId);
      await Reply.deleteMany({ comment: commentId });
      return res.status(204).json({
        status: "success",
        data: null,
      });
    }
    return next(new AppError("U cant delete this Comment", 401));
  }

  await Comment.findByIdAndDelete(commentId);
  await Reply.deleteMany({ comment: commentId });

  return res.status(204).json({
    status: "success",
    data: null,
  });
});
