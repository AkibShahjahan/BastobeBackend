// The last bit is bonus
// CONTRACT:
//   The frontend must make sure the user doesn't do anything if point is 0.

var express = require("express");
var router = express.Router()
var User = require("../models/user");

var negTen = {value: -10, types: ["unlike"]};
var negOne = {value: -1, types: ["view"]};
var one = {value: 1, types: []};
var ten = {value: 10, types: ["like", "spread"]};

function levelConversion(type) {
	if(exists(negTen.types, type)) {
		return negTen.value;
	} else if(exists(negOne.types, type)) {
    return negOne.value;
  } else if(exists(one.types, type)) {
    return one.value;
  } else if(exists(ten.types, type)) {
    return ten.value;
  } else {
		return 0;
	}
};

function exists(arr, type) {
	if(arr.indexOf(type.toLowerCase()) != -1) return true;
	return false;
}

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err) {
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
		User.findById(req.params.id, function(err, foundUser){
			if(!foundUser) {
				res.status(404);
  			res.json({error: "Not Found"});
			}	else if(err) {
				res.status(400);
				res.json({error: err});
			} else {
        var updatedPoints = foundUser.points + levelConversion(req.body.level);
				if(updatedPoints < 0) updatedPoints = 0;
				foundUser.points = updatedPoints;
				foundUser.save(function(err, updatedUser){
					if(err) {
            res.status(400);
      			res.json({error: "Update failed"});
					}
					else {
						res.status(200);
						res.send(updatedUser.points.toString());
					}
				});
			}
		})
	}
});

//module.exports = router;

module.exports = {
  updatePointsWithLevel: function (id, level) {
		User.findById(id, function(err, foundUser){
			if(!foundUser) {
				// res.status(404);
  			// res.json({error: "Not Found"});
			}	else if(err) {
				// res.status(400);
				// res.json({error: err});
			} else {
        var updatedPoints = foundUser.points + levelConversion(level);
				if(updatedPoints < 0) updatedPoints = 0;
				foundUser.points = updatedPoints;
				foundUser.save();
			}
		})
  },
  two: function() {
    return 'world';
  }
}
