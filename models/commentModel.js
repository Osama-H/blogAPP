const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    comment : {
        type : String,
        required : [true,'Comment Cannot Be Empty']
    },
    user : {
        type : mongoose.Schema.ObjectId,
        ref : 'User',
        required : [true,'A Comment Must Belong to a User']
    },
    post : {
        type : mongoose.Schema.ObjectId,
        ref : 'blogPost',
        required : [true,'A Comment Must Belong to a Post']
    }
})

commentSchema.pre(/^find/,function(next){
    this.populate({
        path : 'user',
        select : 'name profilePicture'
    })
    next();
})


module.exports = mongoose.model('Comment',commentSchema);
