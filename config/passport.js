var FacebookTokenStrategy = require("passport-facebook-token");

var User = require("../models/user");
var configAuth = require("./auth");

module.exports = function(passport){
	passport.use(new FacebookTokenStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
    }, function(accessToken, refreshToken, profile, done) {
        console.log(profile);
            User.findOne({"facebook.id": profile.id}, function(err, user){
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
    				newUser.facebook.id = profile.id;
    				//newUser.facebook.accessToken = accessToken;
    				newUser.firstName = profile.name.givenName;
    				newUser.lastName = profile.name.familyName;
    				newUser.facebook.email = profile.displayName;
    				newUser.points = 0;
    				newUser.save(function(err){
    					if(err)
    					{
    						res.status(500);
    						throw err;
    					}
    					res.status(201);
    					return done(null, newUser);
    				})
    			}
    		});
    })
);
}