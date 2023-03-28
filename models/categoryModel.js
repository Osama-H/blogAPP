const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category Name Must be Provided"],
    minglength: [3, "Category name Must be more than 2 Characters"],
    maxlength: [7, "Category name Must be less than 8 Characters"],
    unique: true,
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Category Must belong to an Admin"],
  },
});

module.exports = mongoose.model("Category", categorySchema);
