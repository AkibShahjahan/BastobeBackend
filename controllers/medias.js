var express = require("express");
var router = express.Router()
var Media = require("../models/media");
var MediaHelper = require("../helpers/media");
var User = require("../models/user");
var MediaRecord = require("../models/mediaRecord");
var UserRecord = require("../models/userRecord");
var Points = require("../helpers/points");
var Comment = require("../models/comment");


// =============================================================
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

router.get("/feed/global/:userId", function(req, res){
	var userId = req.params.userId;
	User.findById(userId, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else {
			var userBlockList;
			if(!user) { userBlockList = []; }
			else { userBlockList = user.blockedUsers; }
			Media.find({"creatorId": {$nin: userBlockList}}).sort({time: -1}).exec(function(err, medias) {
	 			if(err) {
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
		}
	})
});

router.get("/feed/:x/:y/:userId", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.02;

	User.findById(userId, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else {
			var userBlockList;
			if(!user) { userBlockList = []; }
			else { userBlockList = user.blockedUsers; }
			Media.find({$and: [{"coordinate.x": {$gt: x - rad}},
											 	{"coordinate.x": {$lt: x + rad}},
											 	{"coordinate.y": {$gt: y - rad}},
											 	{"coordinate.y": {$lt: y + rad}},
												{"creatorId": {$nin: userBlockList}}]}).sort({time: -1})
												.exec(function(err, medias) {
													if(err) {
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
		}
	});
});

// Send only first 100 (?)
router.get("/rank/global/:userId", function(req, res){
	var userId = req.params.userId;
	User.findById(userId, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else {
			var userBlockList;
			if(!user) { userBlockList = []; }
			else { userBlockList = user.blockedUsers; }
			Media.find({"creatorId": {$nin: userBlockList}}).sort({"generalInfo.likes": -1})
																											.sort({time: -1})
																											.exec(function(err, medias) {
	 			if(err) {
	  			res.status(400);
	 			 	res.json({error: err});
	 			} else if(!medias){
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
		}
	})
});

router.get("/rank/:x/:y/:userId", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.02;

	User.findById(userId, function(err, user){
		if(err) {
			res.status(400);
			res.json({error: err});
		} else {
			var userBlockList;
			if(!user) { userBlockList = []; }
			else { userBlockList = user.blockedUsers; }
			Media.find({$and: [{"coordinate.x": {$gt: x - rad}},
											 	{"coordinate.x": {$lt: x + rad}},
											 	{"coordinate.y": {$gt: y - rad}},
											 	{"coordinate.y": {$lt: y + rad}},
												{"creatorId": {$nin: userBlockList}}]})
												.sort({"generalInfo.likes": -1})
												.sort({time: -1})
												.exec(function(err, medias) {
													if(err) {
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
		}
	});


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
				likes: 1,
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
					likeRecord: [req.body.creator_id],
					spreadRecord: [],
					viewRecord: [],
					commentRecord: [],
					flagRecord: []
				};

				MediaRecord.create(newMediaRecord, function(err, newRecordCreation) {
					if(!newRecordCreation) {
						res.status(400);
						res.json({error: "Creation failed."});
						MediaHelper.deleteMedia(newMediaId);
					} else {
						// User liking their own media
						Points.updatePointsWithLevel(req.body.creator_id, "Like");
						UserRecord.findOne({"userId": req.body.creator_id}, function(err, foundUserRecord){
							if(foundUserRecord) {
								if(foundUserRecord.likeRecord.indexOf(newMediaId) == -1) {
									foundUserRecord.likeRecord.push(newMediaId);
									foundUserRecord.save();
								}
							}
						})
						res.status(201);
						res.send(newMediaId);
					}
				});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id', 'caption_label', \
		'author', 'cord_x', 'cord_y', and 'media_type' keys."})
	}
});

router.delete("/:id", function(req, res){
	var mediaId = req.params.id;
	MediaHelper.deleteMedia(mediaId, res);
});

// TODO: MIGHT BE ABLE TO CREATE A COMMON HELPER FOR THESE 4 ROUTES

router.put("/view", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("viewer_id")) {
		var mediaId = req.body.media_id;
		var viewerId = req.body.viewer_id;
		MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
			if(foundMediaRecord) {
				if(foundMediaRecord.viewRecord.indexOf(viewerId)==-1) {
					Media.findById(mediaId, function(err, foundMedia){
						if(foundMedia) {
							foundMedia.views++;
							foundMedia.save();
							foundMediaRecord.viewRecord.push(viewerId);
							foundMediaRecord.save();
							Points.updatePointsWithLevel(viewerId, "View");
							res.status(200);
							res.json({response: "Media successfully viewed."});
						} else {
							res.status(404);
							res.json({error: "Error finding media."});
						}
					});
				} else {
					res.status(400);
					res.json({error: "Media already viewed."});
				}
			} else {
				res.status(404);
				res.json({error: "Error finding media record."});
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
		Media.findById(mediaId, function(err, foundMedia){
			if(foundMedia) {
				foundMedia.generalInfo.spreads++;
				foundMedia.save(function(err, savedMedia) {
					Points.updatePointsWithLevel(foundMedia.creatorId, "Spread");
				});
			}
		});
		for(var i = 0; i < friendsListLength; i++) {
			UserRecord.findOne({"userFbId": friendsList[i]}, function(err, foundUserRecord){
				if(foundUserRecord) {
					// this condition is needed incase two people spread same thing to user
					if(foundUserRecord.spreadRecord.indexOf(req.body.media_id) == -1) {
						foundUserRecord.spreadRecord.push(req.body.media_id);
						foundUserRecord.save();
					} else {
						// skip this one and move on to the next one
					}
				} else {
					// skip this one and move on to the next one
				}
			});
		}
		res.status(200);
		res.json({response: "Media successfully spreaded"});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'spreader_id', 'media_id', and 'friends_list' keys."});
	}
});

router.put("/like", function(req, res){
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("liker_id")) {
		var mediaId = req.body.media_id;
		var likerId = req.body.liker_id;
		MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
			if(foundMediaRecord) {
				if(foundMediaRecord.likeRecord.indexOf(likerId) == -1) {
					foundMediaRecord.likeRecord.push(likerId);
					foundMediaRecord.save();
					UserRecord.findOne({"userId": likerId}, function(err, foundUserRecord){
						if(foundUserRecord) {
							if(foundUserRecord.likeRecord.indexOf(mediaId) == -1) {
								foundUserRecord.likeRecord.push(req.body.media_id);
								foundUserRecord.save();
								Media.findById(mediaId, function(err, foundMedia){
									if(foundMedia) {
										foundMedia.generalInfo.likes++;
										foundMedia.save();
										Points.updatePointsWithLevel(foundMedia.creatorId, "Like");
										res.status(200);
										res.json({response: "Media successfuly liked."});
									} else {
										res.status(404);
										res.json({error: "Error finding media."});
									}
								});
							} else {
								res.status(400);
								res.json({error: "Media already liked."});
							}
						} else {
							res.status(404);
							res.json({error: "Error finding user record."});
						}
					});
				} else {
					res.status(400);
					res.json({error: "Media already liked."});
				}
			} else {
				res.status(404);
				res.json({error: "Error finding media record."});
			}
		});
	}
});

router.put("/unlike", function(req, res) {
	if(req.body.hasOwnProperty("media_id") && req.body.hasOwnProperty("unliker_id")) {
		var mediaId = req.body.media_id;
		var unlikerId = req.body.unliker_id;
		Media.findById(mediaId, function(err, foundMedia){
			if(foundMedia) {
				MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
					if(foundMediaRecord) {
						if(foundMediaRecord.likeRecord.indexOf(unlikerId) != -1) {
							foundMedia.generalInfo.likes--;
							foundMedia.save();
							foundMediaRecord.likeRecord.pull(unlikerId);
							foundMediaRecord.save();
							UserRecord.findOne({"userId": unlikerId}, function(err, foundUserRecord){
								if(foundUserRecord) {
									foundUserRecord.likeRecord.pull(req.body.media_id);
									foundUserRecord.save();
									Points.updatePointsWithLevel(foundMedia.creatorId, "Unlike");
									res.status(200);
									res.json({resposne: "Media successfully liked."});
								} else {
									res.status(404);
									res.json({error: "Error finding user record."});
								}
							});
						} else {
							res.status(400);
							res.json({error: "Media already unliked."});
						}
					} else {
						res.status(404);
						res.json({error: "Error finding media record."});
					}
				});
			} else {
				res.status(404);
				res.json({error: "Error finding media."});
			}
		});
	} else {
		res.status(400);
		res.json({error: "The PUT request must have 'media_id', and 'unliker_id' keys."});
	}
})

router.get("/comments/:mediaId", function(req, res){
  MediaRecord.findOne({"mediaId": req.params.mediaId}).populate("commentRecord")
	.exec(function(err, mediaRecord) {
    if(!mediaRecord) {
			res.status(404);
			res.json({error: "Not Found"});
		} else if (err) {
			res.status(400);
			res.json({error: err});
		} else {
			res.status(200);
			res.send(mediaRecord.commentRecord);
		}
  })
});

router.post("/comments", function(req, res){
  var creatorId = req.body.creator_id;
  var creatorFbId = req.body.creator_fbid;
  var creatorName = req.body.creator_name;
  var mediaId = req.body.media_id;
  var commentContent = req.body.comment_content;
	if(creatorId && creatorFbId && mediaId && commentContent) {
		// Create the comment object
		var date= new Date();
		var currentTime = date.toUTCString();
		var newComment = {
      creatorId: creatorId,
      creatorFbId: creatorFbId,
      creatorName: creatorName,
      mediaId: mediaId,
      commentContent: commentContent,
			date: currentTime,
		};
		// Create the comment
		Comment.create(newComment, function(err, newCreation) {
			console.log("CREATED");
			if(err) {
				res.status(400);
				res.json({error: "Creation failed"});
			} else {
        var newCommentId = newCreation._id.toString();
				MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
          if(foundMediaRecord && foundMediaRecord.commentRecord.indexOf(newCommentId) == -1){
            foundMediaRecord.commentRecord.push(newCommentId);
            foundMediaRecord.save();
          }
        })
        UserRecord.findOne({"userId": creatorId}, function(err, foundUserRecord){
          if(foundUserRecord && foundUserRecord.commentRecord.indexOf(mediaId) == -1){
            foundUserRecord.commentRecord.push(mediaId);
            foundUserRecord.save();
          }
        })
        res.status(201);
        res.json({response: "Creation successful"});

			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id', 'creator_fbid', \
    'creator_name', 'media_id', and 'comment_content' keys."})
	}
});

module.exports = router;
