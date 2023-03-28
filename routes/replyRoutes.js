const express = require("express");
const router = express.Router({ mergeParams: true });

const replyController = require("./../controllers/replyController");
const authController = require("./../controllers/authController");

router
  .route("/")
  .post(authController.protect, replyController.createReply)
  .get(replyController.getAllReplies);

router
  .route("/:id")
  .delete(authController.protect, replyController.deleteReply);

module.exports = router;
