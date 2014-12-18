/*
  TruthChalk
  Version 0.0.1
  (c) 2014 by TruthChalk team
*/

// Initialize parse database 
//development 

Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

//production 
//Parse.initialize("9zbBFAKNInGHpiGfcBDxyVtziFJKTwi3vELXFSdh", "kLfoYlttXbR595lXVKBYuvwe87pFOILQrCMG23kQ");

// Initialize rangy 
rangy.init();

$(document).ready(function() {
  var iframe = false;
  var host = window.location.host;

  switch(host){
    case "twitter.com":
      processor.useModule("twitter");
      break;
    case "disqus.com":
      processor.useModule("disqus");
      break;
    case "www.engadget.com":
      processor.useModule("engadget");
      break;
    case "www.usmessageboard.com":
      processor.useModule("usmessageboard");
      break;
    /* 
    case "vbulletin.com":
      processor.useModule("vbulletin");
      break;
    */
    case "www.cnn.com":
    case "www.foxnews.com":
    case "www.nbcnews.com":
    case "www.nytimes.com":
    case "www.dailymail.co.uk":
    case "news.yahoo.com":
    case "www.huffingtonpost.com":
      processor.useModule("newswebsite");
      break;
  }
  
  processor.option.initializeOptions(function(){
    //console.log("init option loaded");
  });
  
  //There may be multiple disqus domain iframe running on the page
  processor.user.getLoginUser(function(user) {
    var waitingTime = 0;
    var waitIframe = window.setInterval(function(){
      var postListEle = $(processor.initElements);
        initElementNum = postListEle.length;
        if (initElementNum != 0){
          processor.refreshAnnotations(user);
          clearInterval(waitIframe);
        }
        waitingTime ++;
        //if waiting the iframe for too long, cancel waiting
        if(waitingTime > 10)
          clearInterval(waitIframe);
      }, 3000);
  });


  processor.initializeUpdateEvent();

  $(window).on("postUpdated", function() {
    processor.clearAnnotations();
    processor.refreshAnnotations();
  });
  
  /* 
    Listen to popup page login/logout, update user info
    depends on if it is an iframe
  */ 
  if (!window.isTop || !iframe) {
  //console.log("listener added");
   chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      //console.log("the key is ", key);
      switch(key){
        case 'enable':
          //console.log("the enable is changed to", storageChange.newValue);
            processor.option._enable = storageChange.newValue;
            processor.clearAnnotations();        
            processor.user.getLoginUser(function(user) {
              processor.refreshAnnotations(user);        
            });
          break;
        case 'wholeWord':
          processor.option._wholeWord = storageChange.newValue;
          break;
        default:
          processor.clearAnnotations();
          processor.user.getLoginUser(function(user) {
            processor.refreshAnnotations(user);        
          });
          break;
      }
    }//close of for

    });
  }
});
