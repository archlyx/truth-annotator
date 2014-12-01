/*
  TruthChalk
  Version 0.0.1
  (c) 2014 by Yu Zhou, Shuangping Liu
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

  if (host === "twitter.com"){
    processor.useModule("twitter");
  } else if (host === "disqus.com") {
    processor.useModule("disqus");
    iframe = true;
  } else if (host === "www.engadget.com") {
    processor.useModule("engadget");
  } else if (host === "www.usmessageboard.com") {
    processor.useModule("usmessageboard");
  } else {  
    processor.useModule("vbulletin");
  }
  
  processor.option.initializeOptions(function(){
    console.log("init option loaded");
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
  if (!window.isTop | !iframe) {
  console.log("listener added");
   chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (key in changes) {
      var storageChange = changes[key];
      console.log("the key is ", key);
      switch(key){
        case 'enable':
          console.log("the enable is changed to", storageChange.newValue);
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
