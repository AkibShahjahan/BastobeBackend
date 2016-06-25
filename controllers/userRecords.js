var express = require("express");
var router = express.Router()
var UserRecord = require("../models/userRecord");

router.delete("/delete", function(req, res){
	UserRecord.remove({}, function(err, deletedRecords){
		if(!err) {
			res.json({success: "All entities have been removed."});
		} else {
			res.json({error: "Sorry, the deletion was not successful"})
		}
	})
})

router.get("/", function(req, res){
	UserRecord.find({}, function(err, userRecords){
		if(err) {
			res.json({error: "Finding failed."});
		}
		else {
			res.send(userRecords);
		}
	});
});

router.get("/:userId", function(req, res){
	UserRecord.findOne({"userId": req.params.userId}, function(err, userRecord){
		if(!userRecord) {
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			res.send(userRecord);
		}
	});
});

router.get("/:userId/likes", function(req, res){
	getRecord("likeRecord", req, res);
});

router.get("/:userId/spreads", function(req, res){
	getRecord("spreadRecord", req, res);
});

router.get("/:userId/comments", function(req, res){
  getRecord("commentRecord", req, res);
});

function getRecord(recordType, req, res) {
	UserRecord.findOne({"userId": req.params.userId}).populate(recordType).exec(function(err, userRecord){
		if(err){
			res.send(err);
		} else if (!userRecord) {
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			if(recordType=="likeRecord") {
				res.send(userRecord.likeRecord);
			} else if (recordType=="spreadRecord") {
				res.send(userRecord.spreadRecord);
			} else if (recordType=="commentRecord") {
				res.send(userRecord.commentRecord);
			}
		}
	})
}

module.exports = router;
