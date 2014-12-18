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

  var updateNumberDisplay = function(popline, newOpinion) {
    var bar = popline.bar;
    var numThumbsUp = bar.find(".popline-thumbsUp-button").find(".numTrue");
    var numThumbsDown = bar.find(".popline-thumbsDown-button").find(".numFalse");

    var increment = updateNumberTable[[opinion, newOpinion]];
    numThumbsUp.text(parseInt(numThumbsUp.text()) + increment[0]);
    numThumbsDown.text(parseInt(numThumbsDown.text()) + increment[1]);

    var post = processor.postList[popline.settings.postId];
    var annotation = post.annotations[popline.currentAnnotation.id];
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

  var hoverEvent = {
    expansion: function(width, animateTimeout, fadeTimeout) {
      $(this).animate({width: width}, animateTimeout, "linear");
      $(this).find(".suffix").fadeIn(fadeTimeout);
    },

    contraction: function(width, animateTimeout, fadeTimeout) {
      $(this).animate({width: width}, animateTimeout, "linear");
      $(this).find(".suffix").fadeOut(fadeTimeout);
    }
  };

  var toggleButton = function(popline, newOpinion) {
    var bar = popline.bar;
    var thumbsUpButton = bar.find(".popline-thumbsUp-button");
    var thumbsDownButton = bar.find(".popline-thumbsDown-button");

    thumbsUpButton.toggleClass("popline-unselected", (newOpinion < 0));
    thumbsDownButton.toggleClass("popline-unselected", (newOpinion > 0));
  };
  
  $.popline.addButton({
    thumbsUp: {
      text: "T<span class=\"suffix\">RUE</span>",
      textClass: "trueIcon",
      mode: "always",
      beforeShow: function(popline) {
        if (popline.settings.mode === "display") {
          popline.bar.addClass("popline-display");
          if (!this.data("number-appended")){
            $(this).find(".pop-btn").append("<span class=\"text numTrue\">0</span>");
            this.data("number-appended", true);
          }
        } else if (popline.settings.mode === "annotation") {
          popline.bar.addClass("popline-annotation");
          opinion = 0;
          toggleButton(popline, 0);
          $(this).data('selection', window.getSelection().getRangeAt(0));
        }

        /* Bind the click behavior of the button if not set yet */
        if (!this.data("click-event-binded") && !popline.settings.displayOnly) {
          this.mouseenter(function() {
            var width = (popline.settings.mode === "display") ? 130 : 100; 
            hoverEvent.expansion.call(this, width, 300, 200);
            popline.bar.find(".popline-prevArrow-button").animate({right: 150}, 300, "linear");
          });
          this.mouseleave(function() {
            var width = (popline.settings.mode === "display") ? 80 : 48; 
            hoverEvent.contraction.call(this, width, 300, 100);
            popline.bar.find(".popline-prevArrow-button").animate({right: 100}, 300, "linear");
          });

          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsUp");
            
            if (popline.settings.mode === "display") {
              toggleButton(popline, newOpinion);
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumberDisplay(popline, newOpinion);
            }
            $.popline.hideAllBar();
          
            opinion = newOpinion;
          });

          this.data("click-event-binded", true);
        }

        if (!this.data("slide-event-binded")) {
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
          this.data("slide-event-binded", true);
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
          var postId = popline.settings.postId;
          var post = processor.postList[postId];

          for (var objectId in userOpinions) {
            var annotation = post.annotations[objectId];
            if (isAnnotatedChanged(objectId)) {
              newUserOpinions[objectId] = userOpinions[objectId];

              if ((annotation.numberOfAgree === 0) && (annotation.numberOfDisagree === 0)) {
                delete userOpinions[objectId];
                processor.utils.removeAnnotation(postId, annotation);
              }              
            }
          }

          processor.utils.refreshAnnotationDisplay(postId);

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
        if (popline.settings.mode === "display" && !this.data("number-appended")) {
          $(this).find(".pop-btn").append("<span class=\"text numFalse\">0</span>");
          this.data("number-appended", true);
        }

        if (!this.data("click-event-binded") && !popline.settings.displayOnly) {
          this.mouseenter(function() {
            var width = (popline.settings.mode === "display") ? 139 : 100;
            hoverEvent.expansion.call(this, width, 300, 400);
            popline.bar.find(".popline-nextArrow-button").animate({left: 139}, 300, "linear");
          });
          this.mouseleave(function() {
            var width = (popline.settings.mode === "display") ? 80 : 48; 
            hoverEvent.contraction.call(this, width, 300, 50);
            popline.bar.find(".popline-nextArrow-button").animate({left: 80}, 300, "linear");
          });

          this.click(function(event) {
            var newOpinion = calcOpinion("thumbsDown");
            
            if (popline.settings.mode === "display") {
              toggleButton(popline, newOpinion);
              userOpinions[popline.currentAnnotation.id] = {opinion: newOpinion};
              updateNumberDisplay(popline, newOpinion);
            }
            $.popline.hideAllBar();
            opinion = newOpinion;
          });

          this.data("click-event-binded", true);
        }

        if (!this.data("slide-event-binded")) {
          var _this = this;
          this.on("slideChange", function() {
            $(_this).parent().find(".numFalse").text(popline.currentAnnotation.numberOfDisagree);
          });
          this.data("slide-event-binded", true);
        }

      }
    }

  });
})(jQuery);
