const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = Schema(
  {
    title: {
      type: String,
      required: [true, "Post Title Must be Provided"],
      unique: true,
      trim : true
    },
    content: {
      type: String,
      required: [true, "Post Content Must be Provided"],
    },
    photo: {
      type: String,
      default: "",
    },
    isReady: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Post Must Belong to a User"],
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "A Post Must Belong to a Category"],
    },
    status : {
      type : String,
      enum : ['draft','pending','published']
    },
    viewdBy: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual("comments", {
  ref: "Comment",
  foreignField: "post",
  localField: "_id",
});

// commentSchema.pre(/^find/,function(next){
//   this.populate({
//       path : 'user',
//       select : 'name profilePicture'
//   })
//   next();
// })

// *************

// postSchema.pre(/^find/, function (next) {
//   this.find({ isReady: { $ne: false } });
//   next();
// });


// postSchema.pre(/^find/,function(){
//   this.find({status : {$ne : 'pending'}})
// })


module.exports = mongoose.model("Post", postSchema);
