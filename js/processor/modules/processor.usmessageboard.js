/*
  processor.usmessageboard.js
  (c) 2014 by Purav
*/

;(function(processor, $) {
  processor.addModule({
    usmessageboard: {
      initElements: "#messageList",
      container: ".primaryContent",

      getInfoFromContainer: function(element) {
        var thisParent = $(element).parent();
        var postByLine = thisParent.find('.username');
        var postId = thisParent.attr("id");
        
        var userName   = $(postByLine).html();
        console.log("userName is : ", userName, "  postId is: ", postId);

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
