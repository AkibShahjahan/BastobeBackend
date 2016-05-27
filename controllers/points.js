// The last bit is bonus
// CONTRACT:
//   The frontend must make sure the user doesn't do anything if point is 0.

var express = require("express");
var router = express.Router()
var User = require("../models/user");

var levelNeg1 = -1; // View deduction
var level1 = 1; // Nothing as of yet
var level2 = 10; // Likes
var level3 = 10; // Spread

function levelConversion(level) {
	if(level == -1) {
    return levelNeg1;
  } else if(level == 1) {
    return level1;
  } else if(level == 2) {
    return level2;
  } else if(level == 3) {
    return level3;
  }
};

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err) {
			//console.log(err);
			res.status(404);
			res.json({error: "No user with that object id"});
		} else {
			res.status(200);
			res.send(user.points.toString());
		}
	});
});

router.put("/:id", function(req, res){
	if(req.body.hasOwnProperty("level"))
	{
		User.findById(req.params.id, function(err, user){
			if(err) {
				res.status(404);
  			res.json({error: "No user with that object id"});
			}	else {
        var updatedPoints = user.points + levelConversion(Number(req.body.level));
        if(updatedPoints < 0) updatedPoints = 0;
				var modifiedUser = {
					facebook: {
						id: user.facebook.id,
						firstName: user.facebook.firstName,
						lastName: user.facebook.lastName,
						email: user.facebook.email,
						token: user.facebook.token
					},
					points: updatedPoints
				};
				User.findByIdAndUpdate(req.params.id, modifiedUser, function(err, updatedUser){
					if(err) {
            res.status(400);
      			res.json({error: "Update failed"});
					}
					else {
						res.status(200);
						res.send(modifiedUser.points.toString());
					}
				})
			}
		})
	}
});

module.exports = router;
