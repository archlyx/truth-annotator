$(document).ready(function() {
    var mark;
    var highlight;
    var word;

    readLocalStorage();
  
    // Switch toggle
      $('.Switch.mark').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          mark = 1 - mark;
          chrome.storage.local.set({'mark': mark}, function() {
            console.log("optioin saved to local storage");
          });
      });
      
      $('.Switch.highlight').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          highlight = 1 - highlight;
          chrome.storage.local.set({'highlight': highlight}, function() {
            console.log("optioin saved to local storage");
          });
      });
      
      $('.Switch.word').click(function() {
          $(this).toggleClass('On').toggleClass('Off');
          word = 1 - word; 
          chrome.storage.local.set({'word': word}, function() {
            console.log("optioin saved to local storage");
          });
      });
  
      $("#close").click(function(){
          window.close();
      });

      function readLocalStorage(){
        chrome.storage.local.get(['mark', 'highlight','word'], function(result){
          console.log("the inital read is ", result);
          mark = result.mark;
          highlight = result.highlight;
          word = result.word;
          adjustButton();
        });
      }

      function adjustButton(){
        //console.log("adjusting button");
        if (!mark)
          $('.Switch.mark').toggleClass('Off');
        if (mark)
          $('.Switch.mark').toggleClass('On');
        if (!highlight)
          $('.Switch.highlight').toggleClass('Off');
        if (highlight)
          $('.Switch.highlight').toggleClass('On');
        if (!word)
          $('.Switch.word').toggleClass('Off');
        if (word)
          $('.Switch.word').toggleClass('On');
      }
              
});
