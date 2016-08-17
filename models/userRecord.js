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
  ],
  // TODO: Adds to this list when _this user blocks another user [1hr max]
  //        - create endpoint that will take two ids and add to this list (check if already blocked)
  //        - frontend> Gets this list and stores it and then compares id of every media author
  //                  > compares id of every comment author as well
  //                  > makes a call to this endpoint when blocking
  blockedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  blockedByUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

var UserRecord = mongoose.model("UserRecord", userRecordSchema);

module.exports = UserRecord;
