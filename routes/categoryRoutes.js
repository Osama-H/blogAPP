const express = require("express");
const router = express.Router();
const categoryController = require("./../controllers/categoryController");
const authController = require("./../controllers/authController");
const postRouter = require("./postRoutes");

router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("manager"),
    categoryController.createCategory
  )
  .get(categoryController.getAllCategory);

router
  .route("/:id")
  .get(categoryController.getCategory)
  .delete(
    authController.protect,
    authController.restrictTo("manager"),
    categoryController.deleteCategory
  );

router.use("/:categoryId/posts", postRouter);

module.exports = router;
