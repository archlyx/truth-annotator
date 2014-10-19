// Initialize parse database 

Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

Parse.Cloud.run('hello', {}, {
  success: function(result) {
    console.log(result);
  // result is 'Hello world!'
    },
  error: function(error) {
  }
});

var para = {"para":"hahaha"};
Parse.Cloud.run('twitter', para, {
    success: function(result) {
      console.log(result);
    // result is 'Hello world!'
      },
    error: function(error) {
  }
});


