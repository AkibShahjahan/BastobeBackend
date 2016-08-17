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
			ref: "User"
    }
  ],
  commentRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ],
  // TODO: Adds to this list when another user flags _this media [1hr max]
  //        - frontend> when getting media, also stores media flagRecord
  //                  > calls this endpoint if not already flagged
  flagRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

var MediaRecord = mongoose.model("MediaRecord", mediaRecordSchema);

module.exports = MediaRecord;
