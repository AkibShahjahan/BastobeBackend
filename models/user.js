var mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
	facebook: {
		id: String,
		email: String,
		accessToken: String
	},
	firstName: String, 
	lastName: String,
	points: Number
})

var User = mongoose.model("User", userSchema);

module.exports = User;