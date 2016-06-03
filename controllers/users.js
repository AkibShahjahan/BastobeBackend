var express = require("express");
var router = express.Router()
var User = require("../models/user");

router.get("/", function(req, res){
	User.find({}, function(err, users){
		if(err) {
			console.log(err);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(users);
		}
	});
})

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(user == null) {
			//console.log(err);
			res.status(404);
			res.json({error: "No user with that object id."});
		} else if(err) {
			res.status(400);
			res.json({error: "Finding failed"});
		} else {
			res.status(200);
			res.send(user);
		}
	});
});


router.get("/:fbId/id", function(req, res){
	User.findOne({"facebook.id": req.params.fbId}, function(err, user){
		if(err || !user) {
			res.status(400);
			res.json({error: "Finding failed"});
		} else {
			res.status(200);
			res.send((user._id).toString());
		}
	});
});


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
				res.json({error: "Creation failed."});
				console.log(err);
			} else {
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
				if(err)
				{
					res.json({error: "Deletion failed."});
					console.log(err);
				}
				else
				{
					res.json({success: "User deleted."});
				}
			});
		}
	});
});

module.exports = router;
