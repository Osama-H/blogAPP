const Reply = require("./../models/replyModel");
const Comment = require("./../models/commentModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");

exports.createReply = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user.id;
  }
  if (!req.body.comment) {
    req.body.comment = req.params.commentId;
  }

  const reply = await Reply.create(req.body);
  res.status(201).json({
    status: "success",
    reply,
  });
});


exports.getAllReplies = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new AppError("Comment Not Found", 404));
  }

  const allReplies = await Reply.find({ comment: commentId });
  res.status(200).json({
    status: "success",
    results: allReplies.length,
    allReplies,
  });
});

exports.deleteReply = catchAsync(async (req, res, next) => {
  const replyId = req.params.id;
  const reply = await Reply.findById(replyId);

  if (!reply) {
    return next(new AppError("Reply doesn't Found", 404));
  }

  if (req.user.role != "Admin" || req.user.role != "superAdmin") {
    if (reply.user.toString() !== req.user.id.toString()) {
      return next(new AppError("You cant delete this reply", 400));
    }

    await Reply.deleteOne({ id: reply });
    res.status(204).json({
      status: "success",
    });
  }
});
