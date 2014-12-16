/*
  jquery.popline.vote.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function(processor, $) {

  var slideChange = function(popline, current, previous) {
    var currentAnnotation = popline.settings.annotations[current];
    var currentId = currentAnnotation.id;
    popline.currentAnnotation = $.extend(currentAnnotation, {order: current});

    var element = popline.settings["post"].element;
    if (previous !== null) {
      var previousAnnotation = popline.settings.annotations[previous];
      processor.utils.removeInnerHighlight(element, previousAnnotation.textRange);
    }
    processor.utils.innerHighlight(element, currentAnnotation.textRange);

    popline.bar.find(".popline-thumbsUp-button").find(".trueIcon").trigger("slideChange");
  };

  $.popline.addButton({
    nextArrow: {
      iconClass: "ta-caret-right",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings["annotations"].length == 1)
          this.css("display", "none");

        if (!this.data("click-event-binded")) {
          slideChange(popline, 0, null);
          this.click(function() {
            var numAnnotations = popline.settings.annotations.length;
            var current = popline.currentAnnotation.order;
            var next = (current === (numAnnotations - 1)) ? 0 : (current + 1);
            slideChange(popline, next, current);
          });
          this.data("click-event-binded", true);
        } else {
          processor.utils.innerHighlight(popline.settings.post.element, popline.currentAnnotation.textRange);  
        }
      },
      afterHide: function(popline) {
        processor.utils.removeInnerHighlight(popline.settings.post.element, popline.currentAnnotation.textRange);
      }
    },

    prevArrow: {
      iconClass: "ta-caret-left",
      mode: "display",
      beforeShow: function(popline) {
        if (popline.settings.annotations.length == 1)
          this.css("display", "none");

        if (!this.data("click-event-binded")) {
          this.click(function() {
            var numAnnotations = popline.settings.annotations.length;
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
