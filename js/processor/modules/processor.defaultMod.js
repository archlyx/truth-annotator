/*
  processor.defaultMod.js
  (c) 2014 by Purav
*/

;(function(processor, $) {
  processor.addModule({
    defaultMod: {
      initElements: "div",
      container: "p",

      getInfoFromContainer: function(element) {
        console.log("element:", element);
        var postId = window.location.href;
        console.log(("url:" + window.location.href));  
        var userName   = null;
        
        //console.log("userName is : ", userName, "  postId is: ", postId);
        if($( "p:contains('Egypt')" )) {
         console.log("Found: Egypt"); 
        }
        //console.log("Found:" , foundin);
        return {postId: postId, userName: userName};
      },

      initializeUpdateEvent: function() {
      console.log("init update event");
      
      /*
        $(window).scroll(function() {
          var origTweetNumber = Object.keys(processor.postList).length;
          var newTweetNumber = $(processor.container).length;

          if (newTweetNumber > origTweetNumber) {
            $(window).trigger("postUpdated");
          }
        });
        */

      }
    }
  });
})(processor, jQuery);
