var mongoose = require("mongoose");

var mediaRecordSchema = new mongoose.Schema({
  mediaId: String,
  viewRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "View"
    }
  ],
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
  ]
});

var MediaRecord = mongoose.model("MediaRecord", mediaRecordSchema);

module.exports = MediaRecord;
