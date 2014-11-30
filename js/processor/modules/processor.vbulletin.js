/*
  processor.vbulletin.js
  (c) 2014 by Purav
*/

;(function(processor, $) {
  processor.addModule({
    vbulletin: {
      initElements: "#postlist",
      container: ".postcontainer",

      getInfoFromContainer: function(element) {
        var user = $(element).find('.memberaction a').text();
        var userName = user.split(" ")[0];
        var post   = $(element).find('.content div');
        var postId = post.attr("id");
        //console.log("  postId is: ", postId, "userName is : ", userName );

        return {postId: postId, userName: userName};
      },

      initializeUpdateEvent: function() {
      console.log("init update event");

      }
    }
  });
})(processor, jQuery);
