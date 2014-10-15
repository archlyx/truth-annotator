/*
  processor.engadget.js
  (c) 2014 by Purav
*/

;(function(processor, $) {
  processor.addModule({
    engadget: {
      initElements: "#comments",
      container: ".fyre-comment-wrapper",

      getInfoFromContainer: function(element) {
        var thisParent = $(element).parent();
        var postByLine = $(element).find('.fyre-comment-username span');
        var postId = thisParent.attr("data-message-id");
        
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
