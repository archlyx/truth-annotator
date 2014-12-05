$(document).ready(function() {
    var enable = 1;
    //var highlight = 1;
    var wholeWord = 1;

    readLocalStorage();
  
    // Switch toggle
      $('.Switch.mark').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          enable = 1 - enable;
          chrome.storage.local.set({'enable': enable}, function() {
            console.log("optioin saved to local storage");
          });
      });
      
      /*
      $('.Switch.highlight').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          highlight = 1 - highlight;
          chrome.storage.local.set({'highlight': highlight}, function() {
            console.log("optioin saved to local storage");
          });
      });
      */
      
      $('.Switch.word').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          wholeWord = 1 - wholeWord; 
          chrome.storage.local.set({'wholeWord': wholeWord}, function() {
            console.log("optioin saved to local storage");
          });
      });
  
      $("#close").click(function(){
          window.close();
      });

      function readLocalStorage(){
        chrome.storage.local.get(['enable', 'wholeWord'], function(result){
          console.log("the inital read is ", result);
          if (result.enable != undefined)
            enable = result.enable;
          if (result.wholeWord != undefined)
            wholeWord = result.wholeWord;
          adjustButton();
        });
      }
      
      function testLocalStorage(){
        chrome.storage.local.set({'word': word, 'mark': mark, 'highlight': highlight}, function() {
          console.log("optioin saved to local storage");
          chrome.storage.local.get(['mark', 'highlight','word'], function(result){
            console.log("the inital read is ", result);
          });
        });
      }

      function adjustButton(){
        //console.log("adjusting button");
        if (!enable)
          $('.Switch.mark').toggleClass('Off');
        else
          $('.Switch.mark').toggleClass('On');
        if (!wholeWord)
          $('.Switch.word').toggleClass('Off');
        else
          $('.Switch.word').toggleClass('On');
      }
              
});
