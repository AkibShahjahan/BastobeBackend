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
			res.json({error: "Finding failed."});
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
			res.json({error: "Finding failed."});
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
			res.json({error: "Finding failed."});
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
			res.json({error: "Finding failed."});
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
			res.json({error: "Finding failed."});
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




module.exports = router;
