var mongoose = require("mongoose");

var mediaRecordSchema = new mongoose.Schema({
  mediaId: String,
  likeRecord: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Like"
		}
	],
  spreadRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
			ref: "Spread"
    }
  ],
  viewRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
			ref: "View"
    }
  ]
});

var MediaHistory = mongoose.model("MediaHistory", mediaRecordSchema);

module.exports = MediaHistory;
