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
  var map_results = {};
  var couter = 0;
    for(var i = 0; i < annotations.length; i++){
      console.log("the object id is :", annotations[i].id);
      var objectId = annotations[i].id;
      console.log("collecting retweets for tweet : ", tweetId, " ......");
      var request = 'https://api.twitter.com/1.1/statuses/retweets/' + tweetId + '.json?count=100&trim_user=1';
      setMap(map_results, request, objectId, counter);
      if(counter === annotations.length){
        callback(map_results);
      }
    }//end of for
}// function
      
function setMap(map, request, objectId) {
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
