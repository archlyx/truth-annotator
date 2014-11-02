var OAuth = require("oauth");

var oauth = new OAuth.OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  'Aey8cEiIJcp02HjbUl74M2JrV',
  'bHDf717W4IQgOx42g4g5uCT8ffZwqrtaNJBDOiSl4qrqgFXquq',
  '1.0A',
  null,
  'HMAC-SHA1'
);

var map_results = {};
var counter = 0;
//function collect(annotations){return function(callback, errback){
function collect(annotations, callback){
    for(var i = 0; i < annotations.length; i++){
      var objectId = annotations[i].id;
      var tweetId = annotations[i].get("postId");
      var request = 'https://api.twitter.com/1.1/statuses/retweets/' + tweetId + '.json?count=100&trim_user=1';
      console.log("the tweet id is :", annotations[i].get("postId"));
      console.log("collecting retweets for object : ", objectId, " ......");
      setMap(map_results, request, objectId, counter);
      //console.log("the counter in the main loop", counter);
      console.log("the map_result in the main loop", map_results);
      console.log("the map_result length in the main loop", map_results.length);
      if(counter === annotations.length){
        callback(map_results);
      }
    }//end of for
}// function
      
function setMap(map, request, objectId, counter) {
  oauth.get(
    request,
    '2600799996-TUJf2enCDoUSVCwAl9ahBFs1Cuit01XgACn9e70', //test user token
    'MJWzdkgYkPBvrhIVNrf0zTSqSefh1gqa9XmY9dqTcEWSd', //test user secret  
    function (e, data, ers){
      if(e) {
        throw(e);
        return;
      }
      var jsonData = JSON.parse(data);
      map[objectId] = jsonData.length;
      counter++;
    }
  );
}

exports.collect = collect;
