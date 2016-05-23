var mongoose = require("mongoose");

var mediaSchema = new mongoose.Schema({
  creatorId: String,
	generalInfo: {
		likes: Number,
		spread: Number,
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
  views: Number
});



var Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
