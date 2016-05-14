var mongoose = require("mongoose");

// var mediaSchema = new mongoose.Schema({
//   creatorId: String,
// 	info: {
// 		likes: Number,
// 		shows: Number,
// 		caption: String,
// 		author: String,
// 	},
//   coordinate: {
//     x: Number,
//     y: Number
//   },
//   time : {
//     type : Date,
//     default: Date.now
//   }.
//   source: String
// });

var mediaSchema = new mongoose.Schema({
  creatorId: String,
  dataSource: String
});

var Media = mongoose.model("Media", mediaSchema);

module.exports = Media;
