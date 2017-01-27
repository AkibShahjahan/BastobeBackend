var express = require("express");
var router = express.Router()
var Comment = require("../models/comment");
var Media = require("../models/media");
var MediaRecord = require("../models/mediaRecord");
var MediaRecord = require("../models/userRecord");

// =============================================================
// router.get("/", function(req, res){
// 	Comment.find({}, function(err, comments){
// 		if(err) {
// 			res.status(400);
// 			res.json({error: err});
// 		} else if(!comments) {
// 			res.status(404);
// 			res.json({error: "Not Found"});
// 		} else {
// 			res.json(comments);
// 		}
// 	});
// });
//
// router.delete("/delete", function(req, res){
// 	Comment.remove({}, function(err, comments){
// 		if(!err) {
// 			res.status(200);
// 			res.json({success: "All entities have been removed."});
// 		} else {
// 			res.status(400);
// 			res.json({error: "Sorry, the deletion was not successful"})
// 		}
// 	})
// });
// =============================================================

// router.get("/:mediaId", function(req, res){
//   Comment.findOne({"mediaId": req.params.mediaId}, function(err, comment) {
//     if(!comment) {
// 			res.status(404);
// 			res.json({error: "Not Found"});
// 		} else if (err) {
// 			res.status(400);
// 			res.json({error: err});
// 		} else {
// 			res.status(200);
// 			res.send(comment);
// 		}
//   })
// });

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



module.exports = router;
