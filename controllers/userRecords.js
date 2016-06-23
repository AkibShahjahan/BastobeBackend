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
		if(err) {
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			res.send(userRecord);
		}
	});
});

router.get("/:userId/likes", function(req, res){
  UserRecord.findOne({"userId": req.params.userId}, function(err, userRecord){
		if(err) {
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			res.send(userRecord.likeRecord);
		}
	});
})



module.exports = router;
