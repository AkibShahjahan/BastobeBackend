var Media = require("../models/media");
var UserRecord = require("../models/userRecord");

var deleteMedia = function (mediaId, res) {
 Media.findById(mediaId, function(err, media){
   if(media) {
     media.remove();
     if(res) {res.json({success: "Media deleted"});}
   } else if (!media) {
     if(res) {res.json({error: "No media with that object id"});}
   } else {
     if(res) {res.json({error: "Deletion failed."});}
   }
 });
}

var isWithinAccessRadius = function(mediaLat, mediaLong, userLat, userLong) {
  var accessRadius = 0.06;
  if(userLat > (mediaLat - accessRadius) && userLat < (mediaLat + accessRadius) && userLong > (mediaLong - accessRadius) && userLong < (mediaLong + accessRadius)) {
      return true;
  }
  return false;
}

function getMediaWithImageId(medias) {
	var len = medias.length;
	var retVal = [];
	for(var i = 0; i<len; i++) {
		if(medias[i].mediaType == "Photo") {
			retVal[0] = medias[i]._id;
			break;
		}
	}
	return retVal;
}

var getFeed = function(userId, x, y, byPopularity, byLocation, isPreview, isPinned, callback) {
	var rad = 0.06;
	UserRecord.findOne({"userId": userId}, function(err, foundUserRecord) {
		if(err) {
			res.status(400);
			res.json({error: err});
		} else {
			var userBlockList;
			if(!foundUserRecord) { userBlockList = []; }
			else { userBlockList = (foundUserRecord.blockedUsers).concat(foundUserRecord.blockedByUsers); }
			var locationQueryArray = [{"coordinate.x": {$gt: x - rad}},
											 					{"coordinate.x": {$lt: x + rad}},
											 					{"coordinate.y": {$gt: y - rad}},
											 					{"coordinate.y": {$lt: y + rad}}];
			var queryArray = [];
			if(byLocation) { queryArray = locationQueryArray; }
			queryArray = queryArray.concat([{"creatorId": {$nin: userBlockList}}, {"active": {$ne: false}}]);
      if(isPinned) {
        queryArray = queryArray.concat([{"pinned": {$eq: true}}]);
      }
			var query = {$and: queryArray};
			var popularSort = {};
			if(byPopularity) { popularSort = {"generalInfo.likes": -1}; }
			Media.find(query)
					.sort(popularSort)
					.sort({time: -1})
					.exec(function(err, medias) {
						if(err) {
							callback({error: err}, 400)
						} else if(!medias) {
							callback({error: "Not Found"}, 404);
						} else {
							if(isPreview) {
								callback(getMediaWithImageId(medias), 200);
							} else if (medias.length >= 100){
								callback(medias.slice(0, 100), 200)
							} else {
								callback(medias, 200);
							}
						}
			})
		}
	})
}

module.exports = {
  deleteMedia: deleteMedia,
  isWithinAccessRadius: isWithinAccessRadius,
  getFeed: getFeed
}
