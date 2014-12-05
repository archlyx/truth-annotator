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
        var $postByLine = $(element).find('.post-byline');
        var $postMeta = $(element).find('.post-meta');

        /********************* 
        find the deepest child text
        **********************
        var $target = $postByLine;
        while($target.length)
          $target = $target.children();
        var userName = ($target.end().html());
        */

        var commentURL = $($postMeta).find("a").attr("href");
        var userName = $($postByLine).find("a[data-role=username]").html();
        if (userName != undefined){
          if(userName.length){
            //console.log("find correct user name to be", userName);
            return {postId: commentURL, userName: userName};
          }
          else {
            console.log("could not find user name");
            return {};
          }
        }

        else{
          userName = $($postByLine).find("span[class=author]").html();
          if (userName != undefined){
            if(userName.length){
            //console.log("find correct user name to be", userName);
            return {postId: commentURL, userName: userName};
            }
          }
          else{
            console.log("could not find user name");
            return {};
          }          
        }
      },

      initializeUpdateEvent: function() {
      console.log("init update event");
      }
    }
  });
})(processor, jQuery);
