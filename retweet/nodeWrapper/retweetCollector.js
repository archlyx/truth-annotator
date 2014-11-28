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

//function collect(annotations){return function(callback, errback){
function collect(annotations, callback){
    var map = {};
    var counter = 0;
    for(var i = 0; i < annotations.length; i++){
      var objectId = annotations[i].id;
      var tweetId = annotations[i].get("postId");
      var request = 'https://api.twitter.com/1.1/statuses/retweets/' + tweetId + '.json?count=100&trim_user=1';
      //`console.log("the tweet id is :", tweetId);
      //console.log("collecting retweets for object : ", objectId, " ......");
      setMap(request, objectId, function(objectId, jsonData) {
        map[objectId] = jsonData.length;
        //console.log("the map in the main loop", map);
        //console.log("the counter in the main loop", counter);
        counter++;
        if(counter === annotations.length){
          //map_result = JSON.parse(map);
          //callback(map_result);
          callback(map);
        }
      });
    }//end of for
}// function
      
function setMap(request, objectId, callback) {
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
      callback(objectId, jsonData);
    }
  );
}

exports.collect = collect;
