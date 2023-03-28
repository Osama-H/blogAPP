const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username Must Provided !"],
    trim: true,
    maxlength: [20, "Username must be less than 20 Characters"],
    minlength: [4, "Username must be more than 4 Characters"],
    validate: {
      validator: function (value) {
        return !/[0-9$&+,:;=?@#|'<>.^*()%!-]/.test(value);
      },
      message: "Name Contain a letter's Only",
    },
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "User email Must Provided !"],
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} isn't a Valid Email !",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "User Password Must Provided !"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "User Password Confirm Must Provided !"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords Aren't The Same",
    },
  },
  emailToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isActive : {
    type : Boolean,
    default : true
  },
  bio: {
    type: String,
    minlength: [20, "A Bio Must be more than 20 Characters"],
    maxlength: [300, "A Bio Must be less than 300 Characters"],
    // required: [true, "A Bio Must be Provided"],
  },
  role: {
    type: String,
    enum: ["member", "admin", "superAdmin", "manager"],
    default: "member",
  },
  passwordChangedAt: Date,
  profilePicture: {
    type: String,
    default: "",
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  hashedVerificationCode: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangedAt = Date.now();
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeIssued) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > JWTTimeIssued;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex"); // random token
  // if someone Can access to our database then he can get the account by this resetToken, so let's encrypt it
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // valid for 10 minutes

  return resetToken;
};

userSchema.methods.createVerificationCode = function () {
  const verificationCode = crypto.randomBytes(32).toString("hex");
  this.hashedVerificationCode = crypto
    .createHash("sha256")
    .update(verificationCode)
    .digest("hex");
  return verificationCode;
};

module.exports = mongoose.model("User", userSchema);
