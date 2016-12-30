var express = require("express");
var router = express.Router()
var UserRecord = require("../models/userRecord");

// =============================================================
router.delete("/delete", function(req, res){
	UserRecord.remove({}, function(err, deletedRecords){
		if(err) {
			res.status(400);
			res.json({error: "Sorry, the deletion was not successful"})
		} else {
			res.status(200);
			res.json({success: "All entities have been removed."});
		}
	})
})

router.get("/", function(req, res){
	UserRecord.find({}, function(err, userRecords){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if (!userRecords){
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			res.send(userRecords);
		}
	});
});
// =============================================================

router.get("/:userId", function(req, res){
	UserRecord.findOne({"userId": req.params.userId}, function(err, userRecord){
		if(!userRecord) {
			res.status(400);
			res.json({error: "Not Found"});
		} else if (err) {
			res.status(400);
			res.json({error: err});
		}else {
			res.status(200);
			res.send(userRecord);
		}
	});
});

router.get("/:userId/likes", function(req, res){
	getRecord("likeRecord", req, res, false);
});

router.get("/:userId/spreads", function(req, res){
	getRecord("spreadRecord", req, res, false);
});

router.get("/:userId/comments", function(req, res){
  getRecord("commentRecord", req, res, false);
});

router.get("/:userId/likes/preview", function(req, res){
	getRecord("likeRecord", req, res, true);
});

router.get("/:userId/spreads/preview", function(req, res){
	getRecord("spreadRecord", req, res, true);
});

router.get("/:userId/comments/preview", function(req, res){
  getRecord("commentRecord", req, res, true);
});

function getRecord(recordType, req, res, preview) {
	UserRecord.findOne({"userId": req.params.userId})
	.populate({path: recordType, options: {sort: {time: -1}}})
	.exec(function(err, userRecord){
		if(err){
			res.status(400);
			res.json({error: err});
		} else if (!userRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(recordType=="likeRecord") {
				if(preview) {
					if(userRecord.likeRecord.length > 0){
						res.json([userRecord.likeRecord[0]._id]);
					} else {
						res.json([]);
					}
				} else {
					res.send(userRecord.likeRecord);
				}
			} else if (recordType=="spreadRecord") {
				if(preview) {
					if(userRecord.spreadRecord.length > 0){
						res.json([userRecord.spreadRecord[0]._id]);
					} else {
						res.json([]);
					}
				} else {
					res.send(userRecord.spreadRecord);
				}
			} else if (recordType=="commentRecord") {
				if(preview) {
					if(userRecord.commentRecord.length > 0){
						res.json([userRecord.commentRecord[0]._id]);
					} else {
						res.json([]);
					}
				} else {
					res.send(userRecord.commentRecord);
				}
			}
		}
	});
}

router.get("/:userId/liked/:mediaId", function(req, res){
  UserRecord.findOne({"userId": req.params.userId}, function(err, userRecord){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!userRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.status(200);
			if(userRecord.likeRecord.indexOf(req.params.mediaId) != -1) {
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

module.exports = router;
