const express = require("express");
const router = express.Router({ mergeParams: true });
const commentController = require("./../controllers/commentController");
const authController = require("./../controllers/authController");
const replyRouter = require("./replyRoutes");

router
  .route("/")
  .post(authController.protect, commentController.createComment)
  .get(commentController.getAllComment);

router
  .route("/:id")
  .patch(authController.protect, commentController.updateComment)
  .delete(
    authController.protect,
    authController.restrictTo("member", "superAdmin", "manager"),
    commentController.deleteComment
  );

router.route("/:commentId/replies", replyRouter);

module.exports = router;
