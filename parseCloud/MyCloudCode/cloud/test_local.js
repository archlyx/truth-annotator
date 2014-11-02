var Twitter = require('../twitter').Twitter;
var fs = require('fs');

function getUserTimeline(){
    twitter = new Twitter(config);

    var params = { screen_name: 'BoyCook', count: '10'};
    twitter.getUserTimeline(params, error,
        function (data) {
            expect(JSON.parse(data).length).toEqual(10);
            done();
        }
    );
