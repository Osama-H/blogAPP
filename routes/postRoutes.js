const express = require("express");
const router = express.Router({ mergeParams: true });
const postController = require("./../controllers/postController");

const authController = require("./../controllers/authController");
const commentRouter = require("./commentRoutes");

router
  .route("/pending")
  .get(
    authController.protect,
    authController.restrictTo("admin", "superAdmin", "manager"),
    postController.getPendingPosts
  );
router
  .route("/pending/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin", "superAdmin", "manager"),
    postController.getPendingPost
  );
router
  .route("/draft")
  .get(
    authController.protect,
    authController.restrictTo("admin", "superAdmin", "manager"),
    postController.getDraftPosts
  );

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin", "superAdmin", "manager"),
    postController.createPost
  )
  .get(postController.getAllPost);

router
  .route("/:id")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "superAdmin", "manager"),
    postController.updatePost
  )
  .delete(
    authController.protect,
    authController.restrictTo("superAdmin", "manager"),
    postController.deletePost
  )
  .get(postController.getPost);

// POST /post/24124/comments
// GET /post/234ff/comments

router.use("/:postId/comments", commentRouter);

module.exports = router;
