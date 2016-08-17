var mongoose = require("mongoose");
var UserRecord = require("../models/userRecord");
var MediaRecord = require("../models/mediaRecord");
var Comment = require("../models/comment");


var mediaSchema = new mongoose.Schema({
  creatorId: String,
	generalInfo: {
		likes: Number,
		spreads: Number,
		caption: String,
		author: String,
	},
  coordinate: {
    x: Number,
    y: Number
  },
  time : {
    type : Date,
    default: Date.now
  },
  views: Number,
  mediaType: String
});

mediaSchema.post('remove', function(next) {
  UserRecord.update({ likeRecord : {$in: [this._id]} }, {$pullAll: {likeRecord: [this._id]}}).exec();
  UserRecord.update({ commentRecord : {$in: [this._id]} }, {$pullAll: {commentRecord: [this._id]}}).exec();
  UserRecord.update({ spreadRecord : {$in: [this._id]} }, {$pullAll: {spreadRecord: [this._id]}}).exec();
  Comment.remove({mediaId: this._id}).exec();
  MediaRecord.remove({ mediaId: this._id }).exec();
  next;
});

var Media = mongoose.model("Media", mediaSchema);


module.exports = Media;
