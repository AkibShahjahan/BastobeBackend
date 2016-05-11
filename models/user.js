var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	facebook: {
		fbID: String,
		email: String,
		fbToken: String
	},
	firstName: String, 
	lastName: String,
	points: Number
})

var User = mongoose.model("User", userSchema);

module.exports = User;