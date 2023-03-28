const User = require("./../models/userModel");
const Post = require("../models/postModel");
const Comment = require("../models/commentModel");
const Reply = require("../models/replyModel");

const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: "success",
    users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new AppError("No User Found With this Id", 404));
  }
  res.status(200).json({
    status: "success",
    user,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  res.status(500).json({
    status: "fail",
    message: "Please Go To /signup Instead of This Route!",
  });
});

exports.updateUser = async (req, res) => {
  try {
    if (req.body.userId === req.params.id) {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).json({
        status: "success",
        updatedUser,
      });
    } else {
      res.status(401).json({
        status: "fail",
        message: "You can update only your Account",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "theres an error",
    });
  }
};

// This deleteUser for manager Just!

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError("No User Found with this Id", 404));
  }
  if (user.role == "admin" || user.role =='superAdmin') {
    await Post.deleteMany({ user: user._id });
  }
 const comments =  await Comment.deleteMany({ user: user._id });
  for (const comment of comments) {
   
    await Reply.deleteMany({ comment: comment._id });
  }
 
  // How To Delete all replies with the comment we need to delete ..
  await Reply.deleteMany({ user: user._id });

  res.status(204).json({
    status: "success",
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  req.params = req.user;
  next();
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    isActive : false,
  });
  res.status(204).json({
    status: "success",
    data: null,
  });
});
