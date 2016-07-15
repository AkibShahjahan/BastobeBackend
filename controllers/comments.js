var express = require("express");
var router = express.Router()
var Comment = require("../models/comment");
var Media = require("../models/media");
var MediaRecord = require("../models/mediaRecord");
var MediaRecord = require("../models/userRecord");


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

router.get("/:mediaId", function(req, res){
  Comment.findOne({"mediaId": mediaId}, function(err, comment) {
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
  var creatorId = req.body.creator_id;
  var creatorFbId = req.body.creator_fbid;
  var mediaId = req.body.media_id;
  var commentContent = req.body.comment_content;
	if(creatorId && creatorFbId && mediaId && commentContent) {
		// Create the comment object
		var date= new Date();
		var currentTime = date.toUTCString();
		var newComment = {
      creatorId: creatorId,
      creatorFbId: creatorFbId,
      mediaId: mediaId,
      commentContent: commentContent,
			date: currentTime,
		};
		// Create the comment
		Comment.create(newComment, function(err, newCreation) {
			if(err) {
				res.status(400);
				res.json({error: "Creation failed"});
			} else {
        var newCommentId = newCreation._id.toString();
        MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
          if(foundMediaRecord && foundMediaRecord.commentRecord.indexOf(newCommentId) == -1){
            foundMediaRecord.commentRecord.push(newCommentId);
            foundMediaRecord.save();
          }
        })
        UserRecord.findOne({"userId": creatorId}, function(err, foundUserRecord){
          if(foundUserRecord && foundUserRecord.commentRecord.indexOf(mediaId) == -1){
            foundUserRecord.commentRecord.push(mediaId);
            foundUserRecord.save();
          }
        })
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
