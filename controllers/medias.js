var express = require("express");
var router = express.Router()
var Media = require("../models/media");
var User = require("../models/user");
var MediaRecord = require("../models/mediaRecord");


router.get("/", function(req, res){
	Media.find({}, function(err, medias){
		if(err) {
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
		 if(err) {
			 // NOT SURE ABOUT THIS
 			 res.status(400);
		 } else {
			 res.json(medias);
		 }
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
											if(err) {
												// NOT SURE ABOUT THIS
												res.status(400);
											} else {
												res.json(medias);
											}
	});
});

// Send on ly first 100 (?)
router.get("/rank/global", function(req, res){
	Media.find({}).sort({"generalInfo.likes": -1}).exec(function(err, medias) {
		if(err) {
			// NOT SURE ABOUT THIS
			res.status(400);
		} else {
			if(medias.length >= 100){
				res.json(medias.slice(0, 100));
			} else {
				res.json(medias);
			}
		}
	});
}); 

// Need to test this
router.get("/rank/:x/:y", function(req, res){
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.02;
	Media.find({$and: [{"coordinate.x": {$gt: x - rad}},
									 	{"coordinate.x": {$lt: x + rad}},
									 	{"coordinate.y": {$gt: y - rad}},
									 	{"coordinate.y": {$lt: y + rad}}]}).sort({"generalInfo.likes": -1}).exec(function(err, medias) {
											if(err) {
												// NOT SURE ABOUT THIS
												res.status(400);
											} else {
												res.send(medias);
											}
	});
});

router.get("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media) {
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
			} else {
				var newMediaId = newCreation._id.toString();

				var newMediaRecord = {
					mediaId: newMediaId,
					likeRecord: [],
					spreadRecord: [],
					viewRecord: []
				};

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


//TODO: delete the corresponding MediaRecord as well
router.delete("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media) {
			res.status(404);
			res.json({error: "No user with that object id"});
		}
		media.remove(function(err){
			if(err) {
				res.json({error: "Deletion failed."});
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


// TODO: MIGHT BE ABLE TO CREATE A COMMON HELPER FOR THESE 4 ROUTES

router.put("/view", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("viewer_id")) {
		var mediaId = req.body.media_id;
		var viewerId = req.body.viewer_id;
		Media.findById(mediaId, function(err, foundMedia){
			if (err) {
				res.status(400);
			} else if (!foundMedia) {
				res.status(404);
			} else {
				foundMedia.generalInfo.views++;
				foundMedia.save(function(err, savedMedia) {
					if(err) {

					} else {
						MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
							foundMediaRecord.viewRecord.push(viewerId);
							foundMediaRecord.save();
						})
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'media_id', and 'viewer_id' keys."});
	}
});

router.put("/spread", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("spreader_id")
	&& req.body.hasOwnProperty("friends_list")){
		var friendsList = JSON.parse(req.body.friends_list);
		var friendsListLength = friendsList.length;
		var mediaId = req.body.media_id;
		for(var i = 0; i < friendsListLength; i++) {
			User.findOne({"facebook.id": friendsList[i]}, function(err, foundUser){
				if(foundUser != null) {
					// this condition is needed incase user is using two phones
					if(foundUser.receivedMedias.indexOf(req.body.media_id) == -1) {
						foundUser.receivedMedias.push(req.body.media_id);
						foundUser.save();

						Media.findById(mediaId, function(err, foundMedia){
							if(err) {
								res.status(400);
							} else if (!foundMedia) {
								res.status(404);
							} else {

								foundMedia.generalInfo.spreads++;
								foundMedia.save(function(err, savedMedia) {
									if(err) {

									} else {
										MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
											foundMediaRecord.spreadRecord.push(req.body.spreader_id);
											foundMediaRecord.save();
										})
									}
								});
							}
						});
					} else {
						res.send("Media already spreaded previously.");
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
		res.json({error: "The PUT request must have 'spreader_id', 'media_id', and 'friends_list' keys."});
	}
})

router.put("/like", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("liker_id")) {
		var mediaId = req.body.media_id;
		var likerId = req.body.liker_id;
		Media.findById(mediaId, function(err, foundMedia){
			if (err) {
				res.status(400);
			} else if (!foundMedia) {
				res.status(404);
			} else {
				foundMedia.generalInfo.likes++;
				foundMedia.save(function(err, savedMedia) {
					if(err) {

					} else {
						MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
							foundMediaRecord.likeRecord.push(likerId);
							foundMediaRecord.save();
							res.send(foundMedia);
						})
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'media_id', and 'liker_id' keys."});
	}
});

router.put("/unlike", function(req, res) {
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("unliker_id")) {
		var mediaId = req.body.media_id;
		var unlikerId = req.body.unliker_id;
		Media.findById(mediaId, function(err, foundMedia){
			if (err) {
				res.status(400);
			} else if (!foundMedia) {
				res.status(404);
			} else {
				foundMedia.generalInfo.likes--;
				foundMedia.save(function(err, savedMedia) {
					if(err) {

					} else {
						MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
							foundMediaRecord.likeRecord.pull(unlikerId);
							foundMediaRecord.save();
						})
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'media_id', and 'unliker_id' keys."});
	}
})






module.exports = router;
