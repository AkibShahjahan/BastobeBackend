var express = require("express");
var router = express.Router()
var Media = require("../models/media");
var User = require("../models/user");
var MediaRecord = require("../models/mediaRecord");


router.get("/", function(req, res){
	Media.find({}, function(err, medias){
		if(err) {
			console.log(err);
			res.json({error: "Finding failed."});
		}
		else {
			res.send(medias);
		}
	});
});



// =============================================================
router.delete("/delete", function(req, res){
	Media.remove({}, function(err, medias){
		if(!err) {
			res.json({success: "All entities have been removed."});
		} else {
			res.json({error: "Sorry, the deletion was not successful"})
		}
	})
});
// =============================================================

// global feed
router.get("/feed/global", function(req, res){
	 Media.find({}).sort({time: -1}).exec(function(err, medias) {
		 res.send(medias);
	 });
});

// local feed
router.get("/feed/:x/:y", function(req, res){
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.02;
	Media.find({$and: [{"coordinate.x": {$gt: x - rad}},
									 	{"coordinate.x": {$lt: x + rad}},
									 	{"coordinate.y": {$gt: y - rad}},
									 	{"coordinate.y": {$lt: y + rad}}]}).sort({time: -1}).exec(function(err, medias) {
		res.json(medias);
	})
})
// /feed/x/y
// /rank/world
// /rank/x/y

router.get("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media) {
			//console.log(err);
			res.status(400);
			res.json({error: "Finding failed."});
		} else {
			res.status(200);
			res.send(media);
		}
	});
});


router.post("/", function(req, res){
	if(req.body.hasOwnProperty("creator_id") && req.body.hasOwnProperty("caption_label")
	&& req.body.hasOwnProperty("author") && req.body.hasOwnProperty("cord_x")
	&& req.body.hasOwnProperty("cord_y") && req.body.hasOwnProperty("media_type")) {
		var date= new Date();
		var currentTime = date.toUTCString();
		var newMedia = {
			creatorId: req.body.creator_id,
			generalInfo: {
				likes: 0,
				spreads: 0,
				caption: req.body.caption_label,
				author: req.body.author
			},
			coordinate: {
				x: req.body.cord_x,
				y: req.body.cord_y
			},
			date: currentTime,
			// _id doesn't work ---- source: "http://s3.amazonaws.com/bastobe/sample/"+_id+".png",
			views: 0,
			mediaType: req.body.media_type
		};

		Media.create(newMedia, function(err, newCreation) {
			if(err) {
				res.json({error: "Creation failed."});
				console.log(err);
			} else {
				var newMediaId = newCreation._id.toString();

				var newMediaRecord = {
					mediaId: newMediaId,
					likeRecord: [],
					spreadRecord: [],
					viewRecord: []
				}
				MediaRecord.create(newMediaRecord, function(err, newRecordCreation) {
					if(err) {
						res.json({error: "Creation failed."});
						//
						//
						// NEED TO DO SOMETHING HERE TO AVOID ANY PROBLEMS
						//
						//
					} else {
						res.send(newMediaId);
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id' and 'data_source' keys."})
	}
});


//Todo: delete the corresponding MediaRecord as well
router.delete("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media) {
			res.status(404);
			res.json({error: "No user with that object id"});
		}
		media.remove(function(err){
			if(err) {
				res.json({error: "Deletion failed."});
				console.log(err);
			}
			else {
				res.json({success: "User deleted"});
			}
		});
	});
});


// Obsolete
// router.put("/:id/likes/like", function(req, res){
// 	User.findById(req.params.id, function(err, user){
// 		if(err) {
// 			res.status(404);
// 			res.json({error: "No user with that object id"});
// 		} else {
// 			var modifiedUser = {
// 				facebook: {
// 					id: user.facebook.id,
// 					email: user.facebook.email,
// 					firstName: user.facebook.firstName,
// 					lastName: user.facebook.lastName
// 				},
// 				points: user.points+1
// 			};
// 			User.findByIdAndUpdate(req.params.id, modifiedUser, function(err, updatedUser){
// 				if(err){
// 					res.status(404);
// 					res.json({error: "No user with that object id"});
// 				} else {
// 					res.status(200);
// 					res.send(modifiedUser);
// 				}
// 			})
// 		}
// 	})
// });

router.put("/spread", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("spreader_id")
	&& req.body.hasOwnProperty("friends_list")){
		var friendsList = JSON.parse(req.body.friends_list);
		var friendsListLength = friendsList.length;
		for(var i = 0; i < friendsListLength; i++) {
			User.findOne({"facebook.id": friendsList[i]}, function(err, foundUser){
				if(foundUser != null) {
					// this condition is needed incase user is using to phones
					if(foundUser.receivedMedias.indexOf(req.body.media_id) == -1) {
						foundUser.receivedMedias.push(req.body.media_id);
						foundUser.save();

						Media.findById(req.body.media_id, function(err, foundMedia){
							if(err) {
								res.status(400);
							} else if (!foundMedia) {
								res.status(404);
							} else {
								var mediaUpdate = {
									generalInfo: {
										spreads: foundMedia.generalInfo.spreads + 1
									}
								}
								Media.findByIdAndUpdate(req.body.media_id, mediaUpdate, function(err, updatedMedia){
									if(err) {
										res.status(400);
									} else if(!updatedMedia) {
										res.status(404);
									} else {
										res.status(200);
										res.send("media spreaded");
									}
								});
							}
						});
					} else {
						res.send("Media already spreaded previously");
						// do nothing
					}
				} else {
					// skip this one and move on to the next one
				}
			})
		//	res.send({success:"Media has been spreaded."});
		}

	} else {
		res.status(400);
		res.json({error: "The POST request must have 'spreader_id', 'media_id', and 'friends_list' keys."});
	}
})

router.post("/like", function(req, res){
	//
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("liker_id")) {


	}
})





module.exports = router;
