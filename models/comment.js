var mongoose = require("mongoose");

var commentSchema = new mongoose.Schema({
  creatorId: String,
  creatorFbId: String,
  creatorName: String, 
  mediaId: String,
  commentContent: String,
  time : {
    type : Date,
    default: Date.now
  }
});



var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
