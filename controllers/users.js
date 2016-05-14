var express = require("express");
var router = express.Router()
var User = require("../models/user");

router.get("/", function(req, res){
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
})

router.get("/:id", function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err)
		{
			//console.log(err);
			res.status(400);
			res.json({error: "Finding failed."});
		}
		else
		{
			//res.status(200);
			res.send(user);
		}
	});
});

router.get('/:id/points', function(req, res){
	User.findById(req.params.id, function(err, user){
		if(err)
		{
			//console.log(err);
			res.status(400);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.status(200);
			res.send(user.points.toString());
		}
	});
});

router.get("/:fb_id/id", function(req, res){
	User.findOne({"facebook.id": req.params.fb_id}, function(err, user){
		if(err)
		{
			res.status(400);
			res.json({error: "Finding failed"});
		}
		else {
			res.status(200);
			res.send(user._id);
		}
	})
})

router.put("/:id/points", function(req, res){
	if(req.body.hasOwnProperty("newPoints"))
	{
		User.findById(req.params.id, function(err, user){
			if(err)
			{
				// do something
			}
			else {
				var modifiedUser = {
					facebook: {
						id: user.facebook.id,
						email: user.facebook.email,
						firstName: user.facebook.firstName,
						lastName: user.facebook.lastName
					},
					points: Number(req.body.newPoints)
				};
				User.findByIdAndUpdate(req.params.id, modifiedUser, function(err, updatedUser){
					if(err)
					{
						// do something
					}
					else {
						res.status(200);
						res.send(modifiedUser);
					}
				})
			}
		})
	}
});


// FOR DEVELOPERS ONLY ========================================================
router.post("/", function(req, res){
	if(req.body.hasOwnProperty("fb_id") && req.body.hasOwnProperty("first_name") &&
		req.body.hasOwnProperty("last_name") && req.body.hasOwnProperty("email"))
	{
		var newUser = {
			facebook: {
				id: req.body.fb_id,
				email: req.body.email,
				firstName: req.body.first_name,
				lastName: req.body.last_name,
				token: "DeveloperToken"
			},
			points: 10
		};

		User.create(newUser, function(err, newCreation){
			if(err)
			{
				res.json({error: "Creation failed."});
				console.log(err);
			}
			else
			{
				res.json({newCreation});
			}
		});
	}
	else
	{
		res.status(400);
		res.json({error: "The POST request must have 'fb_id', 'email', 'first_name', and 'last_name' keys."})
	}
});

router.delete("/:id", function(req, res){
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

module.exports = router;
