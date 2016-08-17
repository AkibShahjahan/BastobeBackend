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
  }
}
