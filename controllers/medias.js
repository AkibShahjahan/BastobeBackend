var express = require("express");
var router = express.Router()
var Media = require("../models/media");

router.get("/", function(req, res){
	Media.find({}, function(err, medias){
		if(err)
		{
			console.log(err);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.send(medias);
		}
	});
});

router.get("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(err)
		{
			//console.log(err);
			res.status(400);
			res.json({error: "Finding failed."});
		}
		else
		{
			res.status(200);
			res.send(media);
		}
	});
});


router.post("/", function(req, res){
	if(req.body.hasOwnProperty("creator_id") && req.body.hasOwnProperty("caption_label")
	&& req.body.hasOwnProperty("author") && req.body.hasOwnProperty("cord_x")
	&& req.body.hasOwnProperty("cord_y"))
	{
		var d = new Date();
		var currentTime = d.toUTCString();
		var newMedia = {
			creatorId: req.body.creator_id,
			generalInfo: {
				likes: 0,
				spread: 0,
				caption: req.body.caption_label,
				author: req.body.author
			},
			coordinate: {
				x: req.body.cord_x,
				y: req.body.cord_y
			},
			date: currentTime,
			// _id doesn't work ---- source: "http://s3.amazonaws.com/bastobe/sample/"+_id+".png",
			views: 0
		};

		Media.create(newMedia, function(err, newCreation){
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
		res.json({error: "The POST request must have 'creator_id' and 'data_source' keys."})
	}
});

router.delete("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media)
		{
			res.status(404);
			res.json({error: "No user with that object id"});
		}
		media.remove(function(err){
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

router.put("/:id/likes/like", function(req, res){
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
				points: user.points+1
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
});

module.exports = router;
