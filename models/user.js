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
	receivedMedias: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Media"
		}
	]
})

var User = mongoose.model("User", userSchema);

module.exports = User;
