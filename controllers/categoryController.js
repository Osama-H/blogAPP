const Category = require("./../models/categoryModel");
const Post = require('./../models/postModel');
const catchAsync = require("../utils/catchAsync");

exports.createCategory = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  const newCategory = await Category.create(req.body);
  res.status(200).json({
    status: "success",
    newCategory,
  });
});

exports.getCategory = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const category = await Category.find({ _id: id }).select('-user');
  const posts = await Post.find({category : id})
  if (!category) {
    return next(new AppError("Category doesn't Found", 404));
  }
  const numOfPosts = await Post.countDocuments({category : id})
  res.status(200).json({
    status: "success",
    numOfPosts,
    category,
    posts,
  });
});

exports.getAllCategory = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "success",
    results: categories.length,
    categories,
  });
});


exports.deleteCategory = catchAsync(async(req,res,next)=>{
  const categoryId = req.params.id;
  const category = await Category.findById(categoryId)

  if(!category){
    return next(new AppError("Category not found",404))
  }

  await Post.deleteMany({category : categoryId})
  await Category.deleteOne({_id : categoryId})

  res.status(204).json({
    status : 'success'
  })



})