const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const router = express.Router();

const postRouter = require("./postRoutes");

router.route("/signup").post(authController.signup);
router.route("/emailVerify/:code").patch(authController.verifyEmail);

router.route("/login").post(authController.login);
router.route("/admin-login").post(authController.adminLogin);


router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

router.get(
  "/me",
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updateMyPassword
);

router.patch("/deleteMe", authController.protect, userController.deleteMe);

router.route("/:userId/posts", postRouter);


// This is For AdminRoutes
router.use(authController.protect, authController.restrictTo("manager"));

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
