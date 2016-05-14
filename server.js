var express = require('express');
var app = express();

var passport = require('passport');
var FacebookTokenStrategy = require('passport-facebook-token');
require("./config/passport")(passport);

var http = require('http');
var url = require('url');
var session = require("express-session");

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var User = require("./models/user");
var configAuth = require("./config/auth");
var configDB = require("./config/database")

app.set('port', process.env.PORT || 3000);

var mongoose = require('mongoose');
mongoose.connect(configDB.url);
// Make sure connection to db is working
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
   console.log('Successfully mongodb is connected');
});

var userRoutes = require("./controllers/users");
app.use("/users", userRoutes);


// app.get('/users', function(req, res){
// 	User.find({}, function(err, users){
// 		if(err)
// 		{
// 			console.log(err);
// 			res.json({error: "Finding failed."});
// 		}
// 		else
// 		{
// 			res.send(users);
// 		}
// 	});
// });


app.post('/login/facebook', passport.authenticate('facebook-token', {session: false}), function(req, res) {
    // Congratulations, you're authenticated!
    //res.status(200)
    return res.json({status: 'OK'});
});

// app.get('/points/:id', function(req, res){
// 	User.findById(req.params.id, function(err, user){
// 		if(err)
// 		{
// 			//console.log(err);
// 			res.status(400);
// 			res.json({error: "Finding failed."});
// 		}
// 		else
// 		{
// 			res.status(200);
// 			res.send(user.points.toString());
// 		}
// 	});
// });

app.get("/logout", function(req, res){
	res.status(200);
	req.logout();
})


http.createServer(app).listen(app.get('port'), function(){
  console.log("Bastobe server listening on port " + app.get('port'));
});

// FOR DEVELOPMENT PURPOSES ===================================================


var middlewareObj = {};
middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated())
	{
		return next();
	}
	res.send({error: "You are unauthenticated."});
}
