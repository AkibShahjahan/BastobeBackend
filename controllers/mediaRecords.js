var express = require("express");
var router = express.Router()
var MediaRecord = require("../models/mediaRecord");

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
	if(req.body.hasOwnProperty("media_id")){
		MediaRecord.findOne({"mediaId": req.body.media_id}, function(err, foundMediaRecord){
			if(foundMediaRecord) {
				foundMediaRecord.commentRecord = [];
				foundMediaRecord.save(function(err, savedMediaRecord) {
					res.send("Done");
				});
			}
		})
	}
})




module.exports = router;
