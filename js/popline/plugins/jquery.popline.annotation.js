/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  var slideChange = function(popline, current, previous) {
    var currentAnnotation = popline.settings["selectedText"][current];
    var currentId = currentAnnotation.id;
    popline.currentAnnotation = $.extend(currentAnnotation, {order: current});

    var element = popline.settings["element"];
    if (previous !== null) {
      var previousAnnotation = popline.settings["selectedText"][previous];
      processor.utils.removeInnerHighlight(element, previousAnnotation.range);
    }
    processor.utils.innerHighlight(element, currentAnnotation.range);

    var bar = popline.bar;
    bar.find(".popline-thumbsUp-button").find("i").trigger("slideChange");
    bar.find(".popline-numThumbsUp-button").find(".text").trigger("slideChange");
    bar.find(".popline-numThumbsDown-button").find(".text").trigger("slideChange");
  };

  $.popline.addButton({
    nextArrow: {
      iconClass: "ta-chevron-right",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings["selectedText"].length == 1)
          this.css("display", "none");

        if (!this.data("click-event-binded")) {
          slideChange(popline, 0, null);
          this.click(function() {
            var numAnnotations = popline.settings["selectedText"].length;
            var current = popline.currentAnnotation.order;
            var next = (current === (numAnnotations - 1)) ? 0 : (current + 1);
            slideChange(popline, next, current);
          });
          this.data("click-event-binded", true);
        } else {
          processor.utils.innerHighlight(popline.settings["element"], popline.currentAnnotation.range);  
        }
      },
      afterHide: function(popline) {
        processor.utils.removeInnerHighlight(popline.settings["element"], popline.currentAnnotation.range);
      }
    },

    prevArrow: {
      iconClass: "ta-chevron-left",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings["selectedText"].length == 1)
          this.css("display", "none");

        if (!this.data("click-event-binded")) {
          this.click(function() {
            var numAnnotations = popline.settings["selectedText"].length;
            var current = popline.currentAnnotation.order;
            var previous = (current === 0) ? (numAnnotations - 1) : (current - 1);
            slideChange(popline, previous, current);
          });
          this.data("click-event-binded", true);
        }
      }
    }

  });
})(processor, jQuery);
