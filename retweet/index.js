var cron = require("cron");
var parser = require ("./parser");
var retweetCollector = require ("./retweetCollector");

var lastTime;
var newAnnotations = {};
var retweetNum = {};

//this specify how many annotation is used for each collection
var num = 1;

var cronjob = cron.job("*/5 * * * * *", function(){
  console.log ("**************collecting retweet *****************");
  //newAnnotations = parser.getAnnotations(lastTime);
  parser.getAnnotations(lastTime, num)(
    function(annotations){
      console.log("find annotation number:", annotations.length);
      if (annotations.length != 0){
        console.log("collecting retweets...");
        retweetCollector.collect(annotations, function(map_results){
            console.log("collected results:", map_results);
            /*
            console.log("updating to database...");
            parser.update(map_results, function(){
              console.log("+++++++++++ DONE: the retweet is collected for annotations created before:", lastTime);
            });
            */
          });
        lastTime = annotations[annotations.length-1].createdAt;
      }
      else{ 
        console.log("not new annotation has been added since last update");
      }
    }, function(err){
      throw err;
    });
  
  
  //retweetNum = retweetCollector(newAnnotations);
  //parser.updateDatabase(retweetNum);

});

cronjob.start();


