// disribute the files, organize
// shelf isAuthenticate()



var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var FacebookTokenStrategy = require("passport-facebook-token");
var http = require("http");
var url = require("url");
var bodyParser = require("body-parser");
var session = require("express-session");

var User = require("./models/user.js");
var configAuth = require("./config/auth.js");
var configDB = require("./config/database.js")


var app = express();


//================================================
// Don't know if I need this or not

// required for passport session
app.use(session({
  secret: 'secrettexthere',
  saveUninitialized: true,
  resave: true,

}));

// Init passport authentication 
app.use(passport.initialize());
// persistent login sessions 
app.use(passport.session());

//================================================


app.set("port", process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect(configDB.url);
// Make sure connection to db is working
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function callback () {
   console.log('Successfully mongodb is connected');
});



app.get("/users", function(req, res){
	User.find({}, function(err, users){
		if(err)
		{
			console.log(err);
			res.send(404);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(200);
			res.send(users);
		}
	});
});

passport.use(new FacebookTokenStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
    }, function(accessToken, refreshToken, profile, done) {
        console.log(profile);
            User.findOne({"facebook.fbID": profile.id}, function(err, user){
    			if(err)
    			{
    				res.send(500);
    				return done(err);
    			}
    			if(user)
    			{
    				res.send(200);
    				return done(null, user);
    			}
    			else {
    				var newUser = new User();
    				newUser.facebook.fbID = profile.id;
    				newUser.facebook.fbToken = accessToken;
    				newUser.firstName = profile.name.givenName;
    				newUser.lastName = profile.name.familyName;
    				newUser.facebook.email = profile.displayName;
    				newUser.points = 0;
    				newUser.save(function(err){
    					if(err)
    					{
    						res.send(500);
    						throw err;
    					}
    					res.send(201);
    					return done(null, newUser);
    				})
    			}
    		});
    })
);

app.post("/login/facebook", passport.authenticate("facebook-token", {session: false}), function(req, res) {
    // Congratulations, you're authenticated!
    res.send(200);
    return res.json({status: "OK"});
});


var middlewareObj = {};
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.status(401);
	res.send({error: "You are unauthenticated."});
}

app.get("/points/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err)
		{
			console.log(err);
			res.send(404);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(200);
			res.send(user.points.toString());
		}
	});
});

http.createServer(app).listen(app.get("port"), function(){
  console.log("Bastobe server listening on port " + app.get("port"));
});


// FOR DEVELOPMENT PURPOSES ===================================================

app.post("/users", function(req, res){
	if(req.body.hasOwnProperty("fb_id") && req.body.hasOwnProperty("first_name") && 
		req.body.hasOwnProperty("last_name") && req.body.hasOwnProperty("email"))
	{
		var newUser = {
			facebook:{
				fbID: req.body.fb_id,
				email: req.body.email,
				accessToken: "DeveloperMode"
			},
			firstName: req.body.first_name,
			lastName: req.body.last_name,
			points: 0
		};

		User.create(newUser, function(err, newCreation){
			if(err)
			{
				res.send(500);
				res.json({error: "Creation failed."});
				console.log(err);
			} 
			else
			{
				res.send(201);
				res.json(newCreation);
				// res.json({_id: newCreation._id, 
				// 	fbID: req.body.fb_id,
				// 	email: req.body.email,
				// 	firstName: req.body.first_name,
				// 	lastName: req.body.last_name,
				// 	points: 0
				// });
			}
		});
	}
	else
	{
		res.status(400);
		res.json({error: "The POST request must have 'fb_id', 'email', 'first_name', and 'last_name' keys."})
	}
});

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
				res.status(500);
				res.json({error: "Deletion failed."});
				console.log(err);
			}
			else
			{
				res.status(200);
				res.json({success: "User deleted"});
			}
		});
	});
});
