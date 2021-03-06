/*
  processor.cnn.js
  (c) 2014 by TruthChalk team
*/

;(function(processor, $) {
  processor.addModule({
    cnn: {
      initElements: "body",
      container: "p",
      // the counting element is for couting the container element within it
      countingElement:"", 
      
      getInfoFromContainer: function(element) {
        //FIXME the "p" should be the container element
        var index = $("p").index(element)
        //console.log("the index is ", index);
        return {postId: index.toString(), userName: "cnn-editor"};
      },

      initializeUpdateEvent: function() {
        console.log("this is a static webpage");
      }
    }
  });
})(processor, jQuery);
