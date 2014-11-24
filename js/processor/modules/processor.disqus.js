/*
  processor.disqus.js
  (c) 2014 by Yu
*/

;(function(processor, $) {
  processor.addModule({
    disqus: {
      initElements: ".post",
      container: ".post-body",

      getInfoFromContainer: function(element) {
        var postByLine = $(element).find('.post-byline');
        var postMeta = $(element).find('.post-meta');
        
        var userName   = $(postByLine).find("a[data-role=username]").val();
        var commentURL = $(postMeta).find("a").attr("href");

        return {postId: commentURL, userName: userName};
      },

      initializeUpdateEvent: function() {
      console.log("init update event");
      }
    }
  });
})(processor, jQuery);
