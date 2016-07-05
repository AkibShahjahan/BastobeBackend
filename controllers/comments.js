var express = require("express");
var router = express.Router()
var Comment = require("../models/comment");

router.get("/", function(req, res){
	Comment.find({}, function(err, comments){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!comments) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.json(comments);
		}
	});
});

router.delete("/delete", function(req, res){
	Comment.remove({}, function(err, comments){
		if(!err) {
			res.send(200);
			res.json({success: "All entities have been removed."});
		} else {
			res.send(400);
			res.json({error: "Sorry, the deletion was not successful"})
		}
	})
});

router.get("/:id", function(req, res){
	Comment.findById(req.params.id, function(err, comment){
		if(!comment) {
			res.status(404);
			res.json({error: "Not Found"});
		} else if (err) {
			res.status(400);
			res.json({error: err});
		} else {
			res.status(200);
			res.send(comment);
		}
	});
});

router.post("/", function(req, res){
	if(req.body.hasOwnProperty("creator_id") && req.body.hasOwnProperty("creator_fbid")
	&& req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("comment_content")) {
		// Create the comment object
		var date= new Date();
		var currentTime = date.toUTCString();
		var newComment = {
      creatorId: req.body.creator_id,
      creatorFbId: req.body.creator_fbid,
      mediaId: req.body.media_id,
      commentContent: req.body.comment_content,
			date: currentTime,
		};
		// Create the comment
		Comment.create(newComment, function(err, newCreation) {
			if(err) {
				res.status(400);
				res.json({error: "Creation failed"});
			} else {
        res.status(201);
        res.json({response: "Creation successful"});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id', 'creator_fbid', \
    'media_id', and 'comment_content' keys."})
	}
});


module.exports = router;
