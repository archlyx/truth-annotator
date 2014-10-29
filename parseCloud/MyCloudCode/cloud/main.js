//Lebron tweet eg
//tweetId = "521660698162905088"

var Twitter = require('cloud/lib/Twitter.js').Twitter;
var config =
              {
                  "consumerKey": "Aey8cEiIJcp02HjbUl74M2JrV",
                  "consumerSecret": "bHDf717W4IQgOx42g4g5uCT8ffZwqrtaNJBDOiSl4qrqgFXquq",
                  "accessToken": "2600799996-TUJf2enCDoUSVCwAl9ahBFs1Cuit01XgACn9e70",
                  "accessTokenSecret": "MJWzdkgYkPBvrhIVNrf0zTSqSefh1gqa9XmY9dqTcEWSd"
              }
//var fs = require('fs');

Parse.Cloud.define("hello", function(request, response) {
  //var result = getRetweets();
  var result = config.consumerKey;
  response.success(result);
});

function getRetweets(){
  return "hello twitter";
}

Parse.Cloud.define("twitter", function(request, response) {
  twitter = new Twitter(config);
  response.success(request);

/*
    var params = { screen_name: 'BoyCook', count: '10'};
    twitter.getUserTimeline(params, error,
        function (data) {
          response.success(data);
        }
    );
  */
  
});
