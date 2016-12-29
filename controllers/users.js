var express = require("express");
var router = express.Router()
var User = require("../models/user");
var UserRecord = require("../models/userRecord");
var Points = require("../helpers/points");

router.get("/", function(req, res){
	User.find({}, function(err, users){
		if(err) {
			res.status(400);
			res.json({error: "Finding failed."});
		} else if (!users) {
			res.status(404);
			res.json({error: "Not Found"});
		}
		else {
			res.status(200);
			res.json(users);
		}
	});
})

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(user == null) {
			res.status(404);
			res.json({error: "No user with that object id."});
		} else if(err) {
			res.status(400);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			res.send(user);
		}
	});
});

router.get("/:fbId/user", function(req, res){
	User.findOne({"facebook.id": req.params.fbId}, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!user) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			res.send(user);
		}
	});
});

router.get("/:fbId/id", function(req, res){
	User.findOne({"facebook.id": req.params.fbId}, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!user) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			res.send((user._id).toString());
		}
	});
});

router.put("/block", function(req, res) {
	var blockerId = req.body.blocker_id;
	var blockedId = req.body.blocked_id;
	if(blockerId && blockedId) {
		UserRecord.findOne({"userId": blockerId}, function(err, foundUserRecord){
			if(err) {
				res.status(400);
				res.json({error: err});
			} else if(!foundUserRecord) {
				res.status(404);
				res.json({error: "Not Found"});
			} else {
				if(foundUserRecord.blockedUsers.indexOf(blockedId) == -1) {
					Points.updatePointsWithLevel(blockedId, "Block");
					foundUserRecord.blockedUsers.push(blockedId);
					foundUserRecord.save();
					if(foundUserRecord.blockedUsers.length >= 5) {
						// TODO: do something ... maybe one day
					}
					res.json({success: "User successfuly blocked"});
				} else {
					res.json({success: "User already blocked"});
				}
				res.status(200);
			}
		});
		UserRecord.findOne({"userId": blockedId}, function(err, foundUserRecord){
			if(foundUserRecord) {
				if(foundUserRecord.blockedByUsers.indexOf(blockerId) == -1) {
					foundUserRecord.blockedByUsers.push(blockerId);
					foundUserRecord.save();
				}
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'blocker_id' and 'blocked_id' keys."});
	}
})

// FOR DEVELOPERS ONLY ========================================================
router.post("/", function(req, res){
	if(req.body.hasOwnProperty("fb_id") && req.body.hasOwnProperty("first_name") &&
		req.body.hasOwnProperty("last_name") && req.body.hasOwnProperty("email")) {
		var newUser = {
			facebook: {
				id: req.body.fb_id,
				email: req.body.email,
				firstName: req.body.first_name,
				lastName: req.body.last_name,
				token: "DeveloperToken"
			},
			points: 10,
			receivedMedias: []
		};

		User.create(newUser, function(err, newCreation){
			if(err) {
				res.status(400);
				res.json({error: "Creation failed."});
			} else {
				res.status(200);
				res.json({newCreation});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'fb_id', 'email', 'first_name', and 'last_name' keys."})
	}
});

router.delete("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(!user) {
			res.status(404);
			res.json({error: "No user with that object id."});
		} else {
			user.remove(function(err){
				if(err) {
					res.status(400);
					res.json({error: "Deletion failed."});
				}
				else {
					res.status(200);
					res.json({success: "User deleted."});
				}
			});
		}
	});
});

module.exports = router;
