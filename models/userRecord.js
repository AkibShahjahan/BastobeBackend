var mongoose = require("mongoose");

var userRecordSchema = new mongoose.Schema({
  userId: String,
  userFbId: String,
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
  commentRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

var UserRecord = mongoose.model("UserRecord", userRecordSchema);

module.exports = UserRecord;
