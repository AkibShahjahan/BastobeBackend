var express = require("express");
var router = express.Router()
var Media = require("../models/media");
var User = require("../models/user");
var MediaRecord = require("../models/mediaRecord");
var UserRecord = require("../models/userRecord");
var Points = require("./points.js");

router.get("/", function(req, res){
	Media.find({}, function(err, medias){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else if(!medias) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			res.json(medias);
		}
	});
});



// =============================================================
router.delete("/delete", function(req, res){
	Media.remove({}, function(err, medias){
		if(!err) {
			res.send(200);
			res.json({success: "All entities have been removed."});
		} else {
			res.send(400);
			res.json({error: "Sorry, the deletion was not successful"})
		}
	})
});
// =============================================================

router.get("/feed/global", function(req, res){
	 Media.find({}).sort({time: -1}).exec(function(err, medias) {
		 if(err) {
			 // NOT SURE ABOUT THIS
 			 res.status(400);
			 res.json({error: err});
		 } else if(!medias){
			 res.status(404);
			 res.json({error: "Not Found"});
		 } else {
			 res.status(200);
			 res.json(medias);
		 }
	 });
}); 

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
												res.json({error: err});
											} else if(!medias) {
												res.status(404);
												res.json({error: "Not Found"});
											} else {
												res.status(200);
												res.json(medias);
											}
	});
});

// Send only first 100 (?)
router.get("/rank/global", function(req, res){
	Media.find({}).sort({"generalInfo.likes": -1}).sort({time: -1}).exec(function(err, medias) {
		if(err) {
			// NOT SURE ABOUT THIS
			res.status(400);
			res.json({error: err});
		} else if(!medias) {
			res.status(404);
			res.json({error: "Not Found"});
		} else {
			if(medias.length >= 100){
				res.json(medias.slice(0, 100));
			} else {
				res.json(medias);
			}
		}
	});
});

router.get("/rank/:x/:y", function(req, res){
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.02;
	Media.find({$and: [{"coordinate.x": {$gt: x - rad}},
									 	{"coordinate.x": {$lt: x + rad}},
									 	{"coordinate.y": {$gt: y - rad}},
									 	{"coordinate.y": {$lt: y + rad}}]}).sort({"generalInfo.likes": -1}).sort({time: -1}).exec(function(err, medias) {
											if(err) {
												// NOT SURE ABOUT THIS
												res.status(400);
												res.json({error: err});
											} else if(!medias) {
												res.status(404);
												res.json({error: "Not Found"});
											} else {
												res.status(200);
												res.json(medias);
											}
	});
});

router.get("/:id", function(req, res){
	Media.findById(req.params.id, function(err, media){
		if(!media) {
			res.status(404);
			res.json({error: "Not Found"});
		} else if (err) {
			res.status(400);
			res.json({error: err});
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
		// Create the media object
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
			views: 0,
			mediaType: req.body.media_type
		};
		// Create the media
		Media.create(newMedia, function(err, newCreation) {
			if(err) {
				res.status(400);
				res.json({error: "Creation failed"});
			} else {

				// TODO: Create a helper function for this part
				var newMediaId = newCreation._id.toString();

				// Create media record object
				var newMediaRecord = {
					mediaId: newMediaId,
					likeRecord: [],
					spreadRecord: [],
					viewRecord: []
				};

				MediaRecord.create(newMediaRecord, function(err, newRecordCreation) {
					if(err) {
						res.send(400);
						res.json({error: "Creation failed."});
						//
						//
						// TODO: Delete the media
						//
						//
					} else {
						res.send(200);
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
		} else if (err) {
			res.status(400);
			res.json({error: err});
		} else {
			media.remove(function(err){
				if(err) {
					res.json({error: "Deletion failed."});
				}
				else {
					res.json({success: "User deleted"});
				}
			});
		}
	});
});

// TODO: MIGHT BE ABLE TO CREATE A COMMON HELPER FOR THESE 4 ROUTES

router.put("/view", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("viewer_id")) {
		var mediaId = req.body.media_id;
		var viewerId = req.body.viewer_id;
		Media.findById(mediaId, function(err, foundMedia){
			if (err) {
				res.status(400);
				res.json({error: err});
			} else if (!foundMedia) {
				res.status(404);
				res.json({error: "Not Found"});
			} else {
				MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
					if(foundMediaRecord.viewRecord.indexOf(viewerId)==-1) {
						foundMedia.generalInfo.views++;
						foundMedia.save();
						foundMediaRecord.viewRecord.push(viewerId);
						foundMediaRecord.save();
						Points.updatePointsWithLevel(viewerId, "View");
						res.send("Media successfully viewed");
					} else {
						res.send("Media already viewed");
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'media_id', and 'viewer_id' keys."});
	}
});


// change to person who spread it instead of the ones who got spreaded to
router.put("/spread", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("spreader_id")
	&& req.body.hasOwnProperty("friends_list")){
		var friendsList = JSON.parse(req.body.friends_list);
		var friendsListLength = friendsList.length;
		var mediaId = req.body.media_id;
		MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
			if(foundMediaRecord.spreadRecord.indexOf(req.body.spreader_id) == -1) {
				foundMediaRecord.spreadRecord.push(req.body.spreader_id);
				foundMediaRecord.save();
			}
		});
		for(var i = 0; i < friendsListLength; i++) {
			UserRecord.findOne({"userFbId": friendsList[i]}, function(err, foundUserRecord){
				console.log(foundUserRecord);

				if(foundUserRecord != null) {

					// this condition is needed incase two people spread same thing to user
					if(foundUserRecord.spreadRecord.indexOf(req.body.media_id) == -1) {
						foundUserRecord.spreadRecord.push(req.body.media_id);
						foundUserRecord.save();

						Media.findById(mediaId, function(err, foundMedia){
							if(err) {
								res.status(400);
								res.json({error: err});
							} else if (!foundMedia) {
								res.status(404);
								res.json({error: "Not Found"});
							} else {
								foundMedia.generalInfo.spreads++;
								foundMedia.save(function(err, savedMedia) {
									if(err) {
										res.status(400);
										res.json({error: err});
									} else {
										res.status(200);
										res.send("Successfully spreaded.");
									}
								});
							}
						});
					} else {
						res.status(200);
						res.send("Media already spreaded previously.");
					}
				} else {
					// skip this one and move on to the next one
				}
			});
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
				res.json({error: err});
			} else if (!foundMedia) {
				res.status(404);
				res.json({error: "Not Found"});
			} else {
				foundMedia.generalInfo.likes++;
				foundMedia.save(function(err, savedMedia) {
					if(err) {
						res.status(400);
						res.json({error: err});
					} else {
						// maybe should check if already liked or not
						MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
							foundMediaRecord.likeRecord.push(likerId);
							foundMediaRecord.save(function(err, savedMediaRecord) {
								if(err){
									res.status(400);
									res.json({error: err});
								} else {
									UserRecord.findOne({"userId": likerId}, function(err, foundUserRecord){
										if(foundUserRecord != null) {
											if(foundUserRecord.likeRecord.indexOf(req.body.media_id) == -1) {
												foundUserRecord.likeRecord.push(req.body.media_id);
												foundUserRecord.save(function(err, savedUser){
													if(!savedUser){
														res.status(400)
														res.send("Unsuccessful");
													} else if (err) {
														res.status(400)
														res.json({error: err});
													} else {
														res.send("Successfully liked.");
													}
												});
											}
										}
									});
								}

							});
						});
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
							foundMediaRecord.save(function(err, savedMediaRecord) {
								if(err){
									res.status(400);
									res.json({error: err});
								} else {
									UserRecord.findOne({"userId": unlikerId}, function(err, foundUserRecord){
										if(!foundUserRecord) {
											res.status(404);
											res.json({error: "Not Found"});
										}
										else if (foundUserRecord != null) {
											foundUserRecord.likeRecord.pull(req.body.media_id);
											foundUserRecord.save();
										} else {
											res.status(400);
											res.json({error: err});
										}
									});
									res.send("Successfully unliked.");
								}

							});
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

// router.get("/test/one", function(res, res){
// 	res.send(Points.updatePointsWithLevel("xo", "lmao"));
// })




module.exports = router;
