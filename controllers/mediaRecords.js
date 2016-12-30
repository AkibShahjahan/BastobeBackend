var express = require("express");
var router = express.Router()
var MediaRecord = require("../models/mediaRecord");
var MediaHelper = require("../helpers/media");
var Points = require("../helpers/points");

// =============================================================
router.delete("/delete", function(req, res){
	MediaRecord.remove({}, function(err, deletedRecords){
		if(!err) {
			res.json({success: "All entities have been removed."});
		} else {
			res.json({error: "Sorry, the deletion was not successful"})
		}
	})
})

router.get("/", function(req, res){
	MediaRecord.find({}, function(err, mediaRecords){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if (!mediaRecords) {
			res.status(404);
			res.json({error: "Not Found"});
		}
		else {
			res.send(mediaRecords);
		}
	});
});
// =============================================================

router.get("/:mediaId", function(req, res){
	MediaRecord.findOne({"mediaId": req.params.mediaId}, function(err, mediaRecord){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			res.send(mediaRecord);
		}
	});
});

router.get("/:mediaId/liked/:userId", function(req, res){
  MediaRecord.findOne({"mediaId": req.params.mediaId}, function(err, mediaRecord){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(mediaRecord.likeRecord.indexOf(req.params.userId) != -1) {
        res.send({"response": true});
      } else {
        res.send({"response": false});
      }
		}
	});
});

router.get("/:mediaId/viewed/:userId", function(req, res){
  MediaRecord.findOne({"mediaId": req.params.mediaId}, function(err, mediaRecord){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(mediaRecord.viewRecord.indexOf(req.params.userId) != -1) {
        res.send({"response": true});
      } else {
        res.send({"response": false});
      }
		}
	});
});

router.get("/:mediaId/spreaded/:userId", function(req, res){
  MediaRecord.findOne({"mediaId": req.params.mediaId}, function(err, mediaRecord){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(mediaRecord.spreadRecord.indexOf(req.params.userId) != -1) {
        res.send({"response": true});
      } else {
        res.send({"response": false});
      }
		}
	});
});

function getRecord(recordType, req, res) {
	MediaRecord.findOne({"mediaId": req.params.mediaId}).populate(recordType)
	.exec(function(err, mediaRecord){
		if(err){
			res.status(400);
			res.json({error: err});
		} else if (!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(recordType=="commentRecord") {
				// TODO: will have to change this to json
				res.send(mediaRecord.commentRecord);
			}
		}
	});
}

router.get("/:mediaId/comments", function(req, res) {
	getRecord("commentRecord", req, res);
})

router.put("/comments/delete", function(req, res) {
	var mediaId = req.body.media_id;
	if(mediaId){
		MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord){
			if(foundMediaRecord) {
				foundMediaRecord.commentRecord = [];
				foundMediaRecord.save(function(err, savedMediaRecord) {
					res.send("Done");
				});
			}
		})
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'media_id' key."});
	}
})

router.put("/flag", function(req, res) {
	var mediaId = req.body.media_id;
	var flaggerId = req.body.flagger_id;
	var creatorId = req.body.creator_id;
	if(mediaId && flaggerId) {
		MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord){
			if(err) {
				res.status(400);
				res.json({error: err});
			} else if(!foundMediaRecord) {
				res.status(404);
				res.json({error: "Not Found"});
			} else {
				if(foundMediaRecord.flagRecord.indexOf(flaggerId) == -1) {
					Points.updatePointsWithLevel(creatorId, "Flag");
					foundMediaRecord.flagRecord.push(flaggerId);
					foundMediaRecord.save();
					if(foundMediaRecord.flagRecord.length >= 5) {
						MediaHelper.deleteMedia(mediaId);
					}
					res.json({success: "Media successfuly flagged"});
				} else {
					res.json({success: "Media already flagged"});
				}
				res.status(200);
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'media_id', media_creator_id, and 'flagger_id' keys."});
	}
})




module.exports = router;
