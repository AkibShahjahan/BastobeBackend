var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var FacebookTokenStrategy = require('passport-facebook-token');
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
	points: Number,
	fbToken: String
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


passport.use(new FacebookTokenStrategy({
        clientID: '1541173709535196',
        clientSecret: '9cfe46bb94433454454a281b0b4aba4d',
    }, function(accessToken, refreshToken, profile, done) {
        console.log(profile);
                    // Do stuff with the profile. You're already getting authenticated data so there's no need to double check anything! For example
            User.findOne({'fbID': profile.id}, function(err, user){
    			if(err)
    			{
    				console.log("hello");
    				return done(err);
    			}
    			if(user)
    			{
    				console.log("hello2");

    				return done(null, user);
    			}
    			else {
    				var newUser = new User();
    				newUser.fbID = profile.id;
    				newUser.fbToken = accessToken;
    				newUser.firstName = profile.name.givenName;
    				newUser.lastName = profile.name.familyName;
    				newUser.email = profile.displayName;
    				newUser.points = 1;
    				newUser.save(function(err){
    					if(err)
    						throw err;
    					return done(null, newUser);
    				})
    				console.log(profile);
    			}
    		});
    })
);

app.post('/login/facebook', passport.authenticate('facebook-token', {session: false}), function(req, res) {
    // Congratulations, you're authenticated!
    console.log("LOGGED");
    return res.json({status: 'OK'});
});


var middlewareObj = {};
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.json({error: "You are unauthenticated."});
}

app.get('/points/:id', middlewareObj.isLoggedIn, function(req, res){
	User.findOne({'fbID': req.params.id}, function(err, user){
		if(err)
		{
			console.log(err);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(user.points);
		}
	});
});

// app.listen(3000, function () {
//   console.log("Bastobe server listening on port 3000!");
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Bastobe server listening on port " + app.get('port'));
});