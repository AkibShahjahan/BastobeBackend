var mongoose = require("mongoose");

var userRecordSchema = new mongoose.Schema({
  userId: String,
  userFbId: String,
  likeRecord: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Media"
		}
	],
  // media that has been spreaded to the user NOT by the user
  spreadRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
			ref: "Media"
    }
  ],
  commentRecord: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media"
    }
  ]
});

var UserRecord = mongoose.model("UserRecord", userRecordSchema);

module.exports = UserRecord;
