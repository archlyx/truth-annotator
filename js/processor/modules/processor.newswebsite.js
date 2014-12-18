/*
  processor.newswebsite.js
  (c) 2014 by TruthChalk team
*/

;(function(processor, $) {
  processor.addModule({
    newswebsite: {
      initElements: "body",
      container: "p",
      // the counting element is for couting the container element within it
      //countingElement:".body", 

      getInfoFromContainer: function(element) {
        //console.log(element);
        var index = $("p").index(element)
        //console.log("the index is ", index);
        return {postId: index.toString(), userName: "news-editor"};
      //index only counte in the "body" class element
      },

      initializeUpdateEvent: function() {
        console.log("init update event");
      }
    }
  });
})(processor, jQuery);
