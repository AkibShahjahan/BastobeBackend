var express = require('express');
var mongoose = require('mongoose');
var http = require('http');
var url = require('url')
var bodyParser = require("body-parser");

var app = express();


app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://akib:rusty@ds019101.mlab.com:19101/bastobe-db");
// Make sure connection to db is working
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log('Successfully mongodb is connected');
});

var userSchema = new mongoose.Schema({
	fbID: String,
	email: String,
	firstName: String, 
	lastName: String,
	points: Number
})
var User = mongoose.model("User", userSchema);


app.get('/users', function(req, res){
	User.find({}, function(err, users){
		if(err)
		{
			console.log(err);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(users);
		}
	});
});

app.post("/users", function(req, res){
	if(req.body.hasOwnProperty("fb_id") && req.body.hasOwnProperty("first_name") && 
		req.body.hasOwnProperty("last_name") && req.body.hasOwnProperty("email"))
	{
		var newUser = {
			fbID: req.body.fb_id,
			email: req.body.email,
			firstName: req.body.first_name,
			lastName: req.body.last_name,
			points: 0
		};

		User.create(newUser, function(err, newCreation){
			if(err)
			{
				res.json({error: "Creation failed."});
				console.log(err);
			} 
			else
			{
				res.json({_id: newCreation._id, 
					fbID: req.body.fb_id,
					email: req.body.email,
					firstName: req.body.first_name,
					lastName: req.body.last_name,
					points: 0
				});
			}
		});
	}
	else
	{
		res.status(400);
		res.json({error: "The POST request must have 'fb_id', 'email', 'first_name', and 'last_name' keys."})
	}
});


// for testing purposes ONLY
app.delete("/users/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(!user)
		{
			res.status(404);
			res.json({error: "No user with that object id"});
		}
		user.remove(function(err){
			if(err)
			{
				res.json({error: "Deletion failed."});
				console.log(err);
			}
			else
			{
				res.json({success: "User deleted"});
			}
		});
	});
});


// app.listen(3000, function () {
//   console.log("Bastobe server listening on port 3000!");
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Bastobe server listening on port " + app.get('port'));
});