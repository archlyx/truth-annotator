//development 

Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

//production 
//Parse.initialize("9zbBFAKNInGHpiGfcBDxyVtziFJKTwi3vELXFSdh", "kLfoYlttXbR595lXVKBYuvwe87pFOILQrCMG23kQ");

$(document).ready(function(){
    var currentUser = Parse.User.current();
    if(currentUser){
        window.location.href = 'welcome.html';
    }

    $("#login-password").focus();

          $("#login").click(function(){ 
          console.log("login in");
          var email = $("#login-email").val();
          var password = $("#login-password").val();

          if (email === "") {
              $('#login-info').html('<p>Please enter your registed email</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
          }

          else if (password === "") {
              $('#login-info').html('<p>Please enter your password</p>');
              setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
          }
            
          else {
            console.log("log in function");
            login(); 
          }
      });

          $(document).keypress(function(e) {
            if(e.which == 13) {
              var email = $("#login-email").val();
              var password = $("#login-password").val();

              if (email === "") {
                  $('#login-info').html('<p>Please enter your registed email</p>');
                  setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
              }

              else if (password === "") {
                  $('#login-info').html('<p>Please enter your password</p>');
                  setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
              }
                
              else 
                login(); 
            }
          });
    
          $("#close").click(function(){window.close();}); 
    
    $("#logout").click(function(){ 
        Parse.User.logOut();
        window.location.reload();
        });

      function login(){
          var email = $("input[name=email]").val();
          var password = $("input[name=pass]").val();
          
          Parse.User.logIn(email.toLowerCase(), password.toLowerCase(), {
              success: function(user) {
                console.log(user);
                var nickname = user.get("nickname");
                var username = user.get("username");
                var objectId = user.id;
                console.log(objectId);
                //sendToContentLogin(objectId, username, nickname);
                saveToStorage(objectId, username, nickname);
                chrome.browserAction.setIcon({path:'../../img/T-400.png'}, function()
                { 
                  window.location.reload();
                });
              },
              error: function(user, error){
                console.log("Error: ", error);
                  $('#login-info').html('<p>email or password is incorrect</p>');
                setTimeout( function(){$('#login-info').html('<p style="visibility:hidden">info</p>');}, 5000 );
              },
          });
        }
        
        /*
        function sendToContentLogin(objectId, username, nickname){
            console.log("sending to content");
            //chrome.tabs.query({url:'*://twitter.com/'}, function(tabs) {
            chrome.tabs.query({}, function(tabs) {
              for (var i = 0; i < tabs.length; i++){
                //console.log("the nick name will be sent ", nickname);
                chrome.tabs.sendMessage(tabs[i].id, {objectId: objectId, username: username, nickname:nickname}, function() {
                  console.log('login change sent to content script');
                });
              }
            }); 
        }
        */
        
        function saveToStorage(objectId, username, nickname){
          chrome.storage.local.set({'objectId': objectId, 'username': username, 'nickname': nickname}, function() {
             console.log('Settings saved to local storage');
          });
        } 
});
