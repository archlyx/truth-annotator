/*
  jquery.popline.opinion.js 0.0.1

  Version: 0.0.1
  Updated: May 18th, 2013

  (c) 2013 by archlyx
*/

;(function($) {

  /* User opinion for the highlighted annotation */
  var opinion = 0;

  /* The opinions of the user in this popline instance */
  var userOpinions = {};

  /* A table mapping the original opinion and new opinion to 
   * the increment/decrement of the number of agree/disagree */
  var updateNumberTable = {"0,1":  [1, 0],  "0,-1": [0, 1],
                           "1,-1": [-1, 1], "-1,1": [1, -1],
                           "1,0":  [-1, 0], "-1,0": [0, -1]};

  var calcOpinion = function(buttonType) {
    if (buttonType === "thumbsUp") {
      newOpinion = opinion > 0 ? 0 : 1;
    } else if (buttonType === "thumbsDown") {
      newOpinion = opinion < 0 ? 0 : -1;
    }
    return newOpinion;
  };

  var toggleButton = function(popline, newOpinion) {
    var bar = popline.bar;
    var thumbsUpButton = bar.find(".popline-thumbsUp-button");
    var thumbsDownButton = bar.find(".popline-thumbsDown-button");

    thumbsUpButton.toggleClass("button-selected", (newOpinion > 0));
    thumbsDownButton.toggleClass("button-selected", (newOpinion < 0));
  };

  var updateNumberDisplay = function(popline, newOpinion) {
    var bar = popline.bar;
    var numThumbsUp = bar.find(".popline-thumbsUp-button").find(".numTrue");
    var numThumbsDown = bar.find(".popline-thumbsDown-button").find(".numFalse");

    var increment = updateNumberTable[[opinion, newOpinion]];
    numThumbsUp.text(parseInt(numThumbsUp.text()) + increment[0]);
    numThumbsDown.text(parseInt(numThumbsDown.text()) + increment[1]);

    var annotation = popline.settings.post.annotations[popline.currentAnnotation.id];
    annotation.numberOfAgree += increment[0];
    annotation.numberOfDisagree += increment[1];

    $.extend(userOpinions[popline.currentAnnotation.id], {increment: increment});
  };

  var isAnnotatedChanged = function(objectId) {
    if (!(objectId in processor.user.opinions)) {
      processor.user.opinions[objectId] = {opinion: userOpinions[objectId].opinion};
      return true;
    } else if (processor.user.opinions[objectId].opinion !== userOpinions[objectId].opinion) {
      processor.user.opinions[objectId].opinion = userOpinions[objectId].opinion;
      return true;
    }
    return false;
  };
  
  $.popline.addButton({
    thumbsUp: {
      text: "T<span class=\"suffix\">RUE</span>",
      textClass: "trueIcon",
      mode: "always",
      beforeShow: function(popline) {
        if (popline.settings.mode === "display") {
          popline.bar.addClass("popline-display");
          $(this).find(".pop-btn").append("<span class=\"text numTrue\">0</span>");
        } else if (popline.settings.mode === "annotation") {
          popline.bar.addClass("popline-annotation");
          opinion = 0;
          toggleButton(popline, 0);
          $(this).data('selection', window.getSelection().getRangeAt(0));
        }

        // Bind the click behavior of the button if not set yet
        if (!this.data("click-event-binded") && !popline.settings.displayOnly) {
          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsUp");
            toggleButton(popline, newOpinion);
            
            if (popline.settings.mode === "display") {
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumberDisplay(popline, newOpinion);
            }
            opinion = newOpinion;
            $.popline.hideAllBar();
          });

          this.mouseenter(function(event) {
            $(this).find(".suffix").fadeIn(200);
          });

          this.mouseleave(function(event) {
            $(this).find(".suffix").fadeOut(100);
          });

          var _this = this;
          this.on("slideChange", function() {
            var newOpinion = 0;
            if (popline.currentAnnotation.opinion) {
              newOpinion = popline.currentAnnotation.opinion;
            }
            toggleButton(popline, newOpinion);
            opinion = newOpinion;

            $(_this).parent().find(".numTrue").text(popline.currentAnnotation.numberOfAgree);
          });

          this.data("click-event-binded", true);
        }

      },

      afterHide: function(popline) {
        var mode = popline.settings.mode;

        if (mode === "annotation") {
          $.extend($.popline.selection, {
            numberOfAgree: opinion > 0 ? 1 : 0,
            numberOfDisagree: opinion < 0 ? 1 : 0,
            opinion : opinion
          });
          window.getSelection().removeAllRanges();
        
          /* For iframe, the window.lcoation.host
           * only return iframe domain, not the host domain */
          var $_this = $(this);
          chrome.runtime.sendMessage({question:"what is the host domain?"}, function(response){
            $.extend($.popline.selection, {sourceURL: response.answer}, {hostDomain: window.location.host});
            if ($.popline.selection.opinion === 1 || $.popline.selection.opinion === -1) {
              window.getSelection().addRange($_this.data("selection"));
              processor.database.saveAnnotation($.popline.selection);
            }
          });
          
        } else if (mode === "display" && !popline.settings.displayOnly) {
          var newUserOpinions = {};
          var post = popline.settings.post;
          for (var objectId in userOpinions) {
            var annotation = post.annotations[objectId];
            if (isAnnotatedChanged(objectId)) {
              newUserOpinions[objectId] = userOpinions[objectId];

              if ((annotation.numberOfAgree === 0) && (annotation.numberOfDisagree === 0)) {
                processor.utils.removeAnnotation(post, annotation);
              }              
            }
          }

          processor.utils.refreshAnnotationDisplay(post);

          for (var objectId in newUserOpinions) {
            processor.database.updateAnnotation(objectId, newUserOpinions[objectId]);
          }
        }

      }
    },

    thumbsDown: {
      text: "F<span class=\"suffix\">ALSE</span>",
      textClass: "falseIcon",
      mode: "always",
      beforeShow: function(popline) {
        if (popline.settings.mode === "display") {
          $(this).find(".pop-btn").append("<span class=\"text numFalse\">0</span>");
        }

        if (!this.data("click-event-binded") && !popline.settings.displayOnly) {
          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsDown");
            toggleButton(popline, newOpinion);

            if (popline.settings.mode === "display") {
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumberDisplay(popline, newOpinion);
            }
            opinion = newOpinion;
            $.popline.hideAllBar();
          });

          this.mouseenter(function(event) {
            $(_this).find(".suffix").fadeIn(400);
          });

          this.mouseleave(function(event) {
            $(this).find(".suffix").fadeOut(50);
          });

          var _this = this;
          this.on("slideChange", function() {
            $(_this).parent().find(".numFalse").text(popline.currentAnnotation.numberOfDisagree);
          });

          this.data("click-event-binded", true);
        }

      }
    }

  });
})(jQuery);
