var Media = require("../models/media");
module.exports = {
   deleteMedia: function (mediaId, res) {
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
  },
  isWithinAccessRadius: function(mediaLat, mediaLong, userLat, userLong) {
    let accessRadius = 0.06;
    if(userLat > mediaLat - accessRadius && userLat < mediaLat + accessRadius && userLong > mediaLong - accessRadius && userLong < mediaLong + accessRadius) {
        return true;
    }
    return false;
  }
}
