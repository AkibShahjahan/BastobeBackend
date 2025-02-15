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
// router.get("/", function(req, res){
// 	Media.find({}, function(err, medias){
// 		if(err) {
// 			res.status(400);
// 			res.json({error: err});
// 		} else if(!medias) {
// 			res.status(404);
// 			res.json({error: "Not Found"});
// 		} else {
// 			res.json(medias);
// 		}
// 	});
// });
//
// router.delete("/delete", function(req, res){
// 	Media.remove({}, function(err, medias){
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

router.get("/stream/global/:userId", function(req, res){
	var userId = req.params.userId;
	MediaHelper.getFeed(userId, 0, 0, false, false, false, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});

router.get("/stream/global/:userId/preview", function(req, res){
	var userId = req.params.userId;
	MediaHelper.getFeed(userId, 0, 0, false, false, true, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/stream/:x/:y/:userId", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	var rad = 0.06;
	MediaHelper.getFeed(userId, x, y, false, true, false, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/stream/:x/:y/:userId/preview", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	MediaHelper.getFeed(userId, x, y, false, true, true, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/rank/global/:userId", function(req, res){
	var userId = req.params.userId;
	MediaHelper.getFeed(userId, 0, 0, true, false, false, false, function(json, status) {
		res.status(status);
		console.log(status);
		res.json(json);
	});
});
router.get("/rank/global/:userId/preview", function(req, res){
	var userId = req.params.userId;
	MediaHelper.getFeed(userId, 0, 0, true, false, true, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/rank/:x/:y/:userId", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	MediaHelper.getFeed(userId, x, y, true, true, false, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/rank/:x/:y/:userId/preview", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	MediaHelper.getFeed(userId, x, y, true, true, true, false, function(json, status) {
		res.status(status);
		res.json(json);
	});
});
router.get("/rank/:x/:y/:userId/map", function(req, res){
	var userId = req.params.userId;
	var x = parseFloat(req.params.x);
	var y = parseFloat(req.params.y);
	MediaHelper.getFeed(userId, x, y, true, true, false, true, function(json, status) {
		res.status(status);
		res.json(json);
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
	var creatorId = req.body.creator_id;
	var creatorFbId = req.body.creator_fb_id;
	var captionLabel = req.body.caption_label;
	var author = req.body.author;
	var cordX =  req.body.cord_x;
	var cordY = req.body.cord_y;
	var mediaType = req.body.media_type;
	var pinned = req.body.pinned;
	if(creatorId && creatorFbId && (captionLabel || captionLabel == "") && author && cordX && cordY && mediaType && pinned) {
		// Create the media object
		var date= new Date();
		var currentTime = date.toUTCString();
		var newMedia = {
			creatorId: creatorId,
			creatorFbId: creatorFbId,
			generalInfo: {
				likes: 0,
				spreads: 0,
				caption: captionLabel,
				author: author
			},
			coordinate: {
				x: cordX,
				y: cordY
			},
			date: currentTime,
			views: 0,
			mediaType: mediaType,
			active: false,
			pinned: pinned
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
					//XXlikeRecord: [req.body.creator_id],
					likeRecord: [],
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

router.delete("/:id/:deleterId", function(req, res){
	var deleterId = req.params.deleterId;
	var mediaId = req.params.id;
	if(deleterId) {
		Media.findById(mediaId, function(err, media) {
			if(media) {
				if(media.creatorId == deleterId) {
					media.remove();
					res.status(200);
					res.json({Success: "Media deleted."});
				} else {
					res.status(401);
					res.json({error: "Unauthorized"});
				}
			} else {
				res.status(404);
				res.json({error: "Failed to delete media"});
			}
		})
	} else {
		res.status(400);
		res.json({error: "The DELETE request must have deleter_id key "+ req.params.id});
	}
});

router.put("/activate", function(req, res) {
	var mediaId = req.body.media_id;
	var creatorId = req.body.creator_id;
	if(mediaId && creatorId) {
		Media.findById(mediaId, function(err, foundMedia) {
			if(foundMedia) {
				foundMedia.active = true;
				//foundMedia.generalInfo.likes = 1;
				foundMedia.save();
				// User liking their own media
				//Points.updatePointsWithLevel(creatorId, "Like");
				// UserRecord.findOne({"userId": creatorId}, function(err, foundUserRecord){
				// 	if(foundUserRecord) {
				// 		if(foundUserRecord.likeRecord.indexOf(mediaId) == -1) {
				// 			foundUserRecord.likeRecord.push(mediaId);
				// 			foundUserRecord.save();
				// 		}
				// 	}
				// })
				res.status(200);
			} else {
				res.status(404);
				res.json({error: "Media activation failed."});
			}
		})
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id' and 'media_id' keys."})
	}
})

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
					for(var i = 0; i < friendsListLength; i++) {
						UserRecord.findOne({"userFbId": friendsList[i]}, function(err, foundUserRecord){
							if(foundUserRecord) {

								// this condition is needed incase two people spread same thing to user
								var userBlockList = (foundUserRecord.blockedUsers).concat(foundUserRecord.blockedByUsers);
								if(foundUserRecord.spreadRecord.indexOf(req.body.media_id) == -1 &&
									 userBlockList.indexOf(foundMedia.creatorId) == -1 &&
								   userBlockList.indexOf(req.body.spreader_id) == -1) {
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
				});
			}
		});
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
	var userLat = parseFloat(req.body.user_lat);
	var userLong = parseFloat(req.body.user_long);
	var mediaLat = parseFloat(req.body.media_lat);
	var mediaLong = parseFloat(req.body.media_long);
	if(creatorId && creatorFbId && mediaId && commentContent && creatorName && userLat && userLong
		&& mediaLat && mediaLong && MediaHelper.isWithinAccessRadius(mediaLat, mediaLong, userLat, userLong)) {
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
			if(err) {
				res.status(400);
				res.json({error: "Creation failed"});
			} else {
        var newCommentId = newCreation._id.toString();
				UserRecord.findOne({"userId": creatorId}, function(err, foundUserRecord){
          if(foundUserRecord && foundUserRecord.commentRecord.indexOf(mediaId) == -1){
            foundUserRecord.commentRecord.push(mediaId);
            foundUserRecord.save();
          }
        })
				MediaRecord.findOne({"mediaId": mediaId}, function(err, foundMediaRecord) {
          if(foundMediaRecord && foundMediaRecord.commentRecord.indexOf(newCommentId) == -1){
            foundMediaRecord.commentRecord.push(newCommentId);
            foundMediaRecord.save(function() {
							res.status(201);
			        res.json({response: "Creation successful"});
						});
          }
        })
			}
		});
	} else {
		res.status(400);
		res.json({error: "The POST request must have 'creator_id', 'creator_fbid', \
    'creator_name', 'media_id', 'comment_content', 'cord_x', and 'cord_y' keys. Or you may not be in the access radius."})
	}
});

module.exports = router;
