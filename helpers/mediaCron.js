var CronJob = require('cron').CronJob;
var Media = require("../models/media");
var UserRecord = require("../models/userRecord");
var MediaRecord = require("../models/mediaRecord");
var Comment = require("../models/comment");

var cronInterval = "0 */10 * * * *"; // should be run every ten minutes "0 */10 * * * *"

var deleteOld = new CronJob(cronInterval, function() {
  console.log("Running cron media deletion.");
  var currentTime = new Date().getTime();
  var duration = 1000*60*60*24; // should be 1000*60*60*24
  var deletionQuery =  {
    time: {
      $lte: currentTime - duration // should be $lte
    }
  }
  Media.find(deletionQuery, function(err, medias){
    if(err) {
      console.log(err);
    } else {
      medias.forEach(function(media){
        media.remove();
      })
    }
  })
})

module.exports = {
  deleteOld: deleteOld
}
