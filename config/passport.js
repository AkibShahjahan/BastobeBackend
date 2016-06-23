var FacebookTokenStrategy = require("passport-facebook-token");

var User = require("../models/user");
var configAuth = require("./auth");

module.exports = function(passport){
	passport.use(new FacebookTokenStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
    }, function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        // ADDING status code here screws everythign up
          User.findOne({'facebook.id': profile.id}, function(err, user){
	    			if(err)
	    			{
	    				//res.status(500);
	    				return done(err);
	    			}
	    			if(user)
	    			{
	    				//res.status(200);
	    				return done(null, user);
	    			}
	    			else {
	    				var newUser = new User();
	    				newUser.facebook.id = profile.id;
	    				newUser.facebook.token = accessToken;
	    				newUser.facebook.firstName = profile.name.givenName;
	    				newUser.facebook.lastName = profile.name.familyName;
	    				newUser.facebook.email = profile.displayName;
	    				newUser.points = 1;
							newUser.receivedMedias = [];
	    				newUser.save(function(err){
	    					if(err){
	    						//res.status(500);
	    						throw err;
	    					}
	    					else {
									var newUserId = newUser._id.toString();

									var newUserRecord = {
										userId: newUserId,
										likeRecord: [],
										spreadRecord: [],
										viewRecord: []
									};

									UserRecord.create(newUserRecord, function(err, newRecordCreation) {
										if(err) {
											res.json({error: "Creation failed."});
											//
											//
											// NEED TO DO SOMETHING HERE TO AVOID ANY PROBLEMS
											//
											//
										} else {
											return done(null, newUser);
										}
									});
								}
	    				})
	    			}
    		});
    	})
	);
}
