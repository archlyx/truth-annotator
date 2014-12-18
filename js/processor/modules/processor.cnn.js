/*
  processor.cnn.js
  (c) 2014 by TruthChalk 
*/

;(function(processor, $) {
  processor.addModule({
    cnn: {
      initElements: "body",
      container: "p",

      getInfoFromContainer: function(element) {
        console.log("getting info from container");
      },

      initializeUpdateEvent: function() {
        console.log("init update event");
      }
    }
  });
})(processor, jQuery);
