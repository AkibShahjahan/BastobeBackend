var UserRecord = require("../models/userRecord");
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
	time : {
    type : Date,
    default: Date.now
  }
	// TODO: add a timestamp
})

var User = mongoose.model("User", userSchema);

userSchema.post('remove', function(next) {
  UserRecord.remove({ userId: this._id }).exec();
  next;
});

module.exports = User;
