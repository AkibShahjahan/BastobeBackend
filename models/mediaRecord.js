var mongoose = require("mongoose");

var mediaRecordSchema = new mongoose.Schema({
  mediaId: String,
  viewRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  likeRecord: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
  // ids of users who have spreaded this, NOT ids of users who this has been spreaded to
  spreadRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
    }
  ]
});

var MediaRecord = mongoose.model("MediaRecord", mediaRecordSchema);

module.exports = MediaRecord;
