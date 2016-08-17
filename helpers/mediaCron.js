var CronJob = require('cron').CronJob;
var Media = require("../models/media");
var UserRecord = require("../models/userRecord");
var MediaRecord = require("../models/mediaRecord");
var Comment = require("../models/comment");

var cronInterval = "* * * * * *"; // run every ten minutes "0 */10 * * * *"

var deleteOld = new CronJob(cronInterval, function() {
  var currentTime = new Date().getTime();
  var duration = 1000*60*5; // should be 1000*60*60*24
  var deletionQuery =  {
    time: {
      $gt: currentTime - duration //TODO: change to $lte
    }
  }
  Media.find(deletionQuery, function(err, medias){
    if(err) {
      console.log(err);
    } else {
      medias.forEach(function(media){
        var mediaId = media._id
        media.remove();
      })
    }
  })
})

module.exports = {
  deleteOld: deleteOld
}
