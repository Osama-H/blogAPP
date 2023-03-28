const mongoose = require("mongoose");

const replySchema = mongoose.Schema({
  reply: {
    type: String,
    required: [true, "A Replay Cannot Be Empty"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A Reply Must belong to a User"],
  },
  comment: {
    type: mongoose.Schema.ObjectId,
    ref: "Comment",
    required: [true, "A Reply Must Belong to a Comment"],
  },
});

module.exports = mongoose.model('Reply',replySchema);