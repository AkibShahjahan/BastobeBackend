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
	if(req.body.hasOwnProperty("creator_id") && req.body.hasOwnProperty("data_source"))
	{
		var newMedia = {
			creatorId: req.body.creator_id,
      dataSource: req.body.data_source
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

module.exports = router;
