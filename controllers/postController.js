const Post = require("../models/postModel");
const User = require("../models/userModel");

const Reply = require("../models/replyModel");

const Comment = require("./../models/commentModel");

const AppError = require("../utils/AppError");
const catchAsync = require("./../utils/catchAsync");

exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }

  const newPost = await Post.create(req.body);
  const admin = await User.findById(req.user._id);

  if (newPost.isReady === false) {
    newPost.status = "draft";
    await newPost.save();
    return res.status(201).json({
      status: "success",
      message: "You Created a Draft Post!",
    });
  }

  if (newPost.isReady == true) {
    if (admin.role !== "manager" && admin.role !== "superAdmin") {
      newPost.status = "pending";
      await newPost.save();
      return res.status(201).json({
        status: "success",
        message: "Your Post Send to an Admin!",
      });
    }
  }

  newPost.status = "published";
  await newPost.save();

  res.status(201).json({
    status: "success",
    message: "Your Post is Public Now!",
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  console.log(req.params.id);
  const post = await Post.findOne({ _id: req.params.id, status: "published" })
    .populate("comments")
    .populate({
      path: "user",
      select: "name profilePicture",
    });
  if (!post) {
    return next(new AppError("There's no Post with this ID", 404));
  }
  post.viewdBy = post.viewdBy + 1;
  await post.save();
  res.status(200).json({
    status: "success",
    post,
  });
});

exports.getAllPost = catchAsync(async (req, res) => {
  const queryObj = { ...req.query };
  const excludedFields = ["page", "sort", "limit", "fields"];
  excludedFields.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  let query = Post.find(JSON.parse(queryStr)).find({
    status: "published",
    isReady: true,
  });

  if (req.query.sort) {
    const sortedBy = req.query.sort.replaceAll(",", " ");
    query = query.sort(sortedBy);
  }

  if (req.query.fields) {
    const sortedBy = req.query.fields.replaceAll(",", " ");
    query = query.select(sortedBy);
  } else {
    query = query.select("-__v");
  }

  const page = req.query.page;
  const limit = req.query.limit;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  if (req.query.page) {
    const postCount = await Post.countDocuments();
    if (skip >= postCount) {
      return next(new AppError("No Posts Found", 404));
    }
  }

  const posts = await query;
  res.status(200).json({
    status: "success",
    results: posts.length,
    posts,
  });
});

exports.getPendingPosts = catchAsync(async (req, res, next) => {
  let posts;

  if (req.user.role === "manager") {
    posts = await Post.find({ status: "pending" });
  } else {
    posts = await Post.find({ user: req.user.id, status: "pending" });
  }

  if (posts.length == 0) {
    return next(new AppError("No Pending Posts Found", 404));
  }
  res.status(200).json({
    status: "success",
    numOfPosts: posts.length,
    posts,
  });
});

exports.getDraftPosts = catchAsync(async (req, res, next) => {
  let posts;

  if (req.user.role === "manager") {
    posts = await Post.find({ status: "draft" });
  } else {
    posts = await Post.find({ user: req.user.id, status: "draft" });
  }

  if (posts.length == 0) {
    return next(new AppError("No Draft Posts Found", 404));
  }
  res.status(200).json({
    status: "success",
    numOfPosts: posts.length,
    posts,
  });
});

exports.getPendingPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne({ _id: id, status: "pending" });

  // console.log(post.user._id.toString());
  // console.log(req.user.id);

  if (req.user.role !== "manager") {
    if (post.user._id.toString() !== req.user.id) {
      return next(new AppError("No Post Found", 404));
    }
  }

  if (!post) {
    return next(new AppError("No Pending Post Found With this id", 404));
  }

  res.status(200).json({
    status: "success",
    post,
  });
});

exports.getDraftPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findOne({ id, status: "draft" });

  if (req.user.role !== manager) {
    if (post.user.id.toString() !== req.user.id) {
      return next(new AppError("No Draft Post Found With this id", 404));
    }
  }

  res.status(200).json({
    status: "success",
    post,
  });
});

// exports.getAllPostsForSpecificUser = catchAsync(async (req, res, next) => {
//   const userId = req.params.userId;
//   const allPosts = await Post.find({ user: userId });
//   res.status(200).json({
//     status: "success",
//     allPosts,
//   });
// });

// exports.getPostsByCategory  = catchAsync(async (req, res, next) => {
//   const categoryId = req.params.id;
//   const allPosts = await Post.find({category : categoryId})
//   if (!allPosts) {
//     return next(new AppError("Category doesn't Found", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     allPosts,
//   });
// });

exports.updatePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new AppError("No Post Found!", 404));
  }

  if (post.status === "published") {
    if (req.user.id === "admin") {
      return next(new AppError("You Can't update this Post Now", 400));
    }
  }

  if (req.user.role !== "manager") {
    if (post.user.toString() !== req.user.id.toString()) {
      return next(new AppError("Can't Update this Post", 404));
    }
  }

  const updatedPost = await Post.findByIdAndUpdate(postId, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    updatedPost,
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const postId = req.params.id;

  console.log(req.user.id);

  const post = await Post.findById(postId);

  if (!post) {
    return next(new AppError("No Post Found!", 404));
  }

  if (req.user.role !== "manager") {
    if (post.user.toString() !== req.user.id.toString()) {
      return next(new AppError("Can't Delete this Post", 404));
    }
  }

  await Post.findByIdAndDelete(postId);
  // const allComments = await Comment.deleteMany({post : postId})
  // for (const comment of allComments) {

  //   await Reply.deleteMany({ comment: comment._id });
  // }

  const comments = await Comment.find({ post: postId }).lean();
  for (const comment of comments) {
    await Reply.deleteMany({ comment: comment._id });
    await Comment.findByIdAndDelete(comment._id);
  }

  return res.status(204).json({
    status: "success",
  });
});
