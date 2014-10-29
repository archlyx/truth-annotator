var Parse = require('parse').Parse;

var ANNOTATION_TABLE_NAME= "Annotation";
var USER_TABLE_NAME = "User";
var USER_ANNOTATION_TABLE_NAME = "UserAnnotation";

Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

function getAnnotations(lastTime, num) {return function (callback, errback){

  var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
  var query = new Parse.Query(Annotation);
    query.equalTo("hostDomain", "twitter.com");

    if (lastTime != undefined){
      query.greaterThan("createdAt", lastTime);
    }

    query.ascending("createdAt");

    //limit each time we get how many annotations, for the reason of limite API call per hour
    query.limit(num);
    query.find({
      success: function(results) {
        callback(results);
      },
      error: function(error){
        errback(error);
      }
    });
}}

function update(map, callback){
  var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
}
  

exports.getAnnotations = getAnnotations;
