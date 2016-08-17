var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	facebook: {
		id: String,
		firstName: String,
		lastName: String,
		email: String,
		token: String
	},
	points: {
		type: Number,
		default: 0
	},
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
  ]
	// TODO: add a timestamp
})

var User = mongoose.model("User", userSchema);

module.exports = User;
