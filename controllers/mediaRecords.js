var express = require("express");
var router = express.Router()
var MediaRecord = require("../models/mediaRecord");

router.get("/", function(req, res){
	MediaRecord.find({}, function(err, mediaRecords){
		if(err) {
			console.log(err);
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
			//console.log(err);
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			res.send(mediaRecord);
		}
	});
});



module.exports = router;
