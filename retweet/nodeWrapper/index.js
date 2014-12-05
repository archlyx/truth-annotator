var cron = require("cron");
var parser = require ("./parser");
var tweetInfoCollector = require ("./tweetInfoCollector");

var lastTime;
var newAnnotations = {};
var retweetNum = {};

//this specify how many annotation is used for each collection
var num = 50;

console.log("the program started");
var cronjob = cron.job("40 30 * * * *", function(){
  console.log ("**************collecting retweet *****************");
  parser.getAnnotations(lastTime, num)(
    function(annotations){
      console.log("find annotation number:", annotations.length);
      if (annotations.length != 0){
        console.log("collecting retweets...");
        tweetInfoCollector.collect(annotations, function(map){
            console.log("collected results in the main program:", map);
            console.log("updating parse database...");
            parser.update(map, function(){
              console.log("+++++++++++ DONE: the retweet is collected for annotations created before:", lastTime);
            });
          });
        lastTime = annotations[annotations.length-1].createdAt;
      }
      else{ 
        console.log("no new annotation has been added since last update");
      }
      var datetime = new Date();
      console.log("retweets status updated at", datetime);
    }, function(err){
      throw err;
    });
});

cronjob.start();


