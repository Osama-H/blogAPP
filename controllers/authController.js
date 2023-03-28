const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const User = require("./../models/userModel");

const catchAsync = require("./../utils/catchAsync");
const sendEmail = require("./../utils/email");

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    bio: req.body.bio,
  });

  const verificationCode = user.createVerificationCode();
  await user.save({ validateBeforeSave: false });

  const urlVerify = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/emailVerify/${verificationCode}`;

  const options = {
    email: user.email,
    subject: "Verify Your Email",
    text: ` Hello ${user.username}, Thank U For Registering in Our Blog APP
             Let's Verify Your Email To Complete the Registration
            ${urlVerify}`,
  };

  try {
    await sendEmail(options);
    res.status(201).json({
      status: "success",
      message: "Verification Code Sent to Your Gmail Account.",
    });
  } catch (err) {
    user.hashedVerificationCode = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500).json({
      status: "fail",
      message: "Theres an error",
    });
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  const verificationCode = req.params.code;

  const hashedVerificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");

  const user = await User.findOne({
    email: req.body.email,
    hashedVerificationCode: hashedVerificationCode,
  });

  if (!user) {
    return next(new AppError("User not Found!", 404));
  }

  user.hashedVerificationCode = undefined;
  user.isVerified = true;

  await user.save({ validateBeforeSave: false });

  const JWT_SECRET = process.env.JWT_SECRET;
  const JWT_EXPIRES = process.env.JWT_EXPIRES;
  const token = jwt.sign({ _id: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });

  res.status(201).json({
    status: "success",
    token,
    user,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please Provide Email and Password", 400));
  }

  const user = await User.findOne({ email: email }).select("+password");

  if (
    !user ||
    !(await user.correctPassword(password, user.password)) ||
    user.role !== "member"
  ) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (user.isVerified === false) {
    return next(
      new AppError("Please Verify Your Account then Come to Login!", 400)
    );
  }

  if (user.isActive === false) {
    return next(
      new AppError("Contact the administration To Active your account", 401)
    );
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
  res.cookie("access-token", token);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email | !password) {
    return next(new AppError("Please Provide Your Email and Password", 404));
  }

  const admin = await User.findOne({ email: req.body.email }).select(
    "+password"
  );

  if (
    !admin ||
    !(await admin.correctPassword(password, admin.password)) ||
    admin.role === "member"
  ) {
    return next(new AppError("Email Or Password Not Correctly", 401));
  }

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  if (admin.isActive === false) {
    return next(
      new AppError("Contact the administration To Active your account", 401)
    );
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // Getting Token and check if it's there
  // console.log(req.headers.authorization);
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in ! Please log in to get access", 401)
    );
  }

  const decodedPayload = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const currentUser = await User.findOne({ _id: decodedPayload.id });
  if (!currentUser) {
    return next(
      new AppError("The User belonging to this token doesnt longer exist", 401)
    );
  }


  if (currentUser.changedPasswordAfter(decodedPayload.iat)) {
    return next(
      new AppError("User Password Recently Changed, Please Login Again!", 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You Don't have permission to Perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User Not Found !", 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false }); 

  const URL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const options = {
    email: user.email,
    subject: "Verify Your Email",
    text: ` Hello ${user.username}, 
          We're Sending u this email because request a password reset, U Can Move to ${URL} and 
          Make a Patch Request On it ..
          If u didn't request a password reset, you can ignore this message`,
  };

  try {
    await sendEmail(options);
    res.status(200).json({
      status: "success",
      message: "Token Send to Your Email",
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error Happen in sending an email", 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("User not Found, or The Token is Expired", 404));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();


  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  const { email, currentPassword } = req.body;
  if (!email || !currentPassword) {
    return next(new AppError("Please Provide Ur Email And Password", 400));
  }

  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new AppError("User Not Found", 404));
  }

  if (!(await user.correctPassword(currentPassword))) {
    return next(new AppError("Your Current Password Is Wrong", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  res.status(200).json({
    message: "done",
    user,
  });
});
