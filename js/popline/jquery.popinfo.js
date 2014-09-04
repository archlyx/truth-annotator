/*
  jquery.popinfo.js 0.0.1

  Version: 0.0.1

  jquery.popinfo.js is an open source project, contribute at GitHub:
  https://github.com/kenshin54/popinfo.js

  (c) 2013 by kenshin54
*/

;(function($) {

  var LEFT = -2, UP = -1, RIGHT = 2, DOWN = 1, NONE = 0, ENTER = 13;
  
  var timerShow;
  var timerHide;

  var isIMEMode = false;
  $(document).on('compositionstart', function(event) {
    isIMEMode = true;
  });
  $(document).on('compositionend', function(event) {
    isIMEMode = false;
  });

  var toggleBox = function(event) {
    if ($.popinfo.utils.isNull($.popinfo.current)) {
      return;
    }
    var isTargetOrChild = $.contains($.popinfo.current.target.get(0), event.target) || $.popinfo.current.target.get(0) === event.target;
    var isBarOrChild = $.contains($.popinfo.current.bar.get(0), event.target) || $.popinfo.current.bar.get(0) === event.target;
    if (isTargetOrChild || isBarOrChild) {
      var target= $.popinfo.current.target, bar = $.popinfo.current.bar;
      if (bar.is(":hidden") || bar.is(":animated")) {
        bar.stop(true, true);
        var pos = Position().mouseup(event);
        clearTimeout(timerHide);
        timerShow = setTimeout(function(){
          $.popinfo.current.show(pos);
          }, 1);
      }
    } else {
      clearTimeout(timerShow);
      timerHide = setTimeout(function(){
        $.popinfo.hideAllBar();
        }, 1);
    }
  };

  var targetEvent = {
    mousedown: function(event) {
      $.popinfo.current = $(this).data("popinfo");
      $.popinfo.hideAllBar();
      event.stopPropagation();
    },

    click: function(event) {
      event.stopPropagation();
    }

    /*
    keyup: function(event) {
      var popinfo = $(this).data("popinfo"), bar = popinfo.bar;
      //if (!isIMEMode && window.getSelection().toString().length > 0 && !popinfo.keepSlientWhenBlankSelected()) {
      if (!isIMEMode) {
        var pos = Position().keyup(event);
        $.popinfo.current.show(pos);
      } else {
        $.popinfo.current.hide();
      }
    },
    keydown: function(event) {
      $.popinfo.current = $(this).data("popinfo");
//      var rects = window.getSelection().getRangeAt(0).getClientRects();
      var rects = $.popinfo.current.target.get(0).getClientRects();
      if (rects.length > 0) {
        $(this).data('lastKeyPos', $.popinfo.boundingRect());
      }
    }
    */
  }

  var Position = function() {
    var target= $.popinfo.current.target, bar = $.popinfo.current.bar, positionType = $.popinfo.current.settings.position;

    var positions = {
      "fixed": {
        mouseup: function(event) {
          //var rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
          var rect = $.popinfo.current.target.get(0).getBoundingClientRect();
          var left = rect.left + 120;
          var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
          if (left < 0) left = 10;
          var top = scrollTop + rect.top - bar.outerHeight();
          return {left: left, top: top};
        },
        keyup: function(event) {
          var left = null, top = null;
          var rect = $.popinfo.getRect(), keyMoved = $.popinfo.current.isKeyMove();
          if (keyMoved === DOWN || keyMoved === RIGHT) {
            left = rect.right - bar.width() / 2;
          }else if (keyMoved === UP || keyMoved === LEFT) {
            left = rect.left - bar.width() / 2;
          }
          var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
          top = scrollTop + rect.top - bar.outerHeight() - 10;
          return {left: left, top: top};
        }
      },
      "relative": {
        mouseover: function(event) {
          var left = event.pageX - bar.width() / 2;
          if (left < 0) left = 10;
          var top = event.pageY - bar.outerHeight() - parseInt(target.css('font-size')) / 2;
          return {left: left, top: top};
        },
        keyup: function(event) {
          var left = null, top = null;
          var rect = $.popinfo.getRect(), keyMoved = $.popinfo.current.isKeyMove();
          if (keyMoved === DOWN || keyMoved === RIGHT) {
            left = rect.right - bar.width() / 2;
            top = $(document).scrollTop() + rect.bottom - bar.outerHeight() - parseInt(target.css("font-size"));
          }else if (keyMoved === UP || keyMoved === LEFT) {
            left = rect.left - bar.width() / 2;
            top = $(document).scrollTop() + rect.top - bar.outerHeight();
          }
          return {left: left, top: top};
        }
      }
    };

    return positions[positionType];
  };

  $.fn.popinfo = function(options) {

    if ($.popinfo.utils.browser.ie) {
      return;
    }

    _arguments = arguments;
    this.each(function() {
      if (_arguments.length >= 1 && typeof(_arguments[0]) === "string" && $(this).data("popinfo")) {
        var func = $(this).data("popinfo")[_arguments[0]];
        if (typeof(func) === "function") {
          func.apply($(this).data("popinfo"), Array.prototype.slice.call(_arguments, 1));
        }
      }else if (!$(this).data("popinfo")) {
        var popinfo = new $.popinfo(options, this);
      }
    });

    if (!$(document).data("popinfo-global-binded")) {
      $(document).mouseup(function(event){
      //$(document).mouseover(function(event){
        var _this = this;
        setTimeout((function(){
              toggleBox.call(_this, event);
            }), 1);
        });
      $(document).data("popinfo-global-binded", true);
    }
  };

  $.popinfo = function(options, target) {
    this.settings = $.extend(true, {}, $.popinfo.defaults, options);
    this.setPosition(this.settings.position);
    this.target = $(target);

    this.beforeShowCallbacks = [];
    this.afterHideCallbacks = [];

    this.init();

    $.popinfo.addInstance(this);
  };

  $.extend($.popinfo, {

    defaults: {
      zIndex: 9999,
      mode: "edit",
      enable: null,
      disable: null,
      position: "fixed",
      keepSlientWhenBlankSelected: true
    },

    instances: [],

    current: null,

    prototype: {
      init: function() {
        this.bar = $("<ul class='popinfo' style='z-index:" + this.settings.zIndex + "'></ul>").appendTo("body");
        this.bar.data("popinfo", this);
        this.target.data("popinfo", this);
        var me = this;

        var isEnable = function(array, name) {
          if (array === null) {
            return true;
          }
          for (var i = 0, l = array.length; i < l; i++) {
            var v = array[i];
            if (typeof(v) === "string" && name === v) {
              return true;
            }else if ($.isArray(v)) {
              if (isEnable(v, name)) {
                return true;
              }
            }
          }
          return false;
        }


        var isDisable = function(array, name) {
          if (array === null) {
            return false;
          }
          for (var i = 0, l = array.length; i < l; i++) {
            var v = array[i];
            if (typeof(v) === "string" && name === v) {
              return true;
            }else if ($.isArray(v)) {
              if ((v.length === 1 || !$.isArray(v[1])) && isDisable(v, name)) {
                return true;
              }else if (isDisable(v.slice(1), name)) {
                return true;
              }
            }
          }
          return false;
        }

        var makeButtons = function(parent, buttons) {
          for (var name in buttons) {
            var button = buttons[name];
            var mode = $.popinfo.utils.isNull(button.mode) ? $.popinfo.defaults.mode : button.mode;

            if (mode !== me.settings.mode
                || !isEnable(this.settings.enable, name)
                || isDisable(this.settings.disable, name)) {
              continue;
            }
            var $button = $("<li><span class='pop-btn'></span></li>");

            $button.addClass("popinfo-button popinfo-" + name + "-button")

            if (button.iconClass) {
              $button.children(".pop-btn").append("<i class='" + button.iconClass + "'></i>");
            }

            if (button.text) {
              $button.children(".pop-btn").append("<span class='text " + (button.textClass || '') + "'>" + button.text + "</span>");
            }

            if (button.bgColor) {
              $button.css({'background-color': button.bgColor});
            }

            if ($.isFunction(button.beforeShow)) {
              this.beforeShowCallbacks.push({name: name, callback: button.beforeShow});
            }

            if ($.isFunction(button.afterHide)) {
              this.afterHideCallbacks.push({name: name, callback: button.afterHide});
            }

            $button.appendTo(parent);

            if (button.buttons) {
              $subbar = $("<ul class='subbar'></ul>");
              $button.append($subbar);
              makeButtons.call(this, $subbar, button.buttons);
              $button.click(function(event) {
                var _this = this;
                if (!$(this).hasClass("boxed")) {
                  me.switchBar($(this), function() {
                    $(_this).siblings("li").hide().end()
                         .children(".pop-btn").hide().end()
                         .children("ul").show().end()
                  });
                  event.stopPropagation();
                }
              });
            } else if($.isFunction(button.action)) {
              $button.click((function(button) {
                  return function(event) {
                    button.action.call(this, event, me);
                  }
                })(button)
              );
            }
            $button.mousedown(function(event) {
              if (!$(event.target).is("input")) {
                event.preventDefault();
              }
            });
            $button.mouseup(function(event) {
              event.stopPropagation();
            });
          }
        }

        makeButtons.call(this, this.bar, $.popinfo.buttons);

        this.target.bind(targetEvent);

        // this.bar.on("mouseenter", "li", function() {
        //   if (!($(this).hasClass("boxed"))) {
        //     $(this).addClass("hover");
        //   }
        // });
        // this.bar.on("mouseleave", "li", function() {
        //   if (!($(this).hasClass("boxed"))) {
        //     $(this).removeClass("hover");
        //   }
        // });
      },
      
      show: function(options) {
        for (var i = 0, l = this.beforeShowCallbacks.length; i < l; i++) {
          var obj = this.beforeShowCallbacks[i];
          var $button = this.bar.find("li.popinfo-" + obj.name + "-button");
          obj.callback.call($button, this);
        }
        this.bar.css('top', options.top + "px").css('left', options.left + "px").stop(true, true).fadeIn();
        this.bar.resize();
      },

      hide: function() {
        var _this = this;
        if (this.bar.is(":visible") && !this.bar.is(":animated")) {
          this.bar.fadeOut(function(){
            _this.bar.find("li").removeClass("boxed").show();
            _this.bar.find(".subbar").hide();
            _this.bar.find(".textfield").hide();
            _this.bar.find(".pop-btn").show();
            for (var i = 0, l = _this.afterHideCallbacks.length; i < l; i++) {
              var obj = _this.afterHideCallbacks[i];
              var $button = _this.bar.find("li.popinfo-" + obj.name + "-button");
              obj.callback.call($button, _this);
            }
          });
        }
      },

      destroy: function() {
        this.target.unbind(targetEvent);
        this.target.removeData("popinfo");
        this.target.removeData("lastKeyPos");
        this.bar.remove();
      },

      switchBar: function(button, hideFunc, showFunc) {
        if (typeof(hideFunc) === "function") {
          var _this = this;
          var position = parseInt(_this.bar.css('left')) + _this.bar.width() / 2;
          _this.bar.animate({ opacity: 0, marginTop: -_this.bar.height() + 'px' }, function() {
            hideFunc.call(this);
            button.removeClass('hover').addClass('boxed').show();
            _this.bar.css("margin-top", _this.bar.height() + "px")
            _this.bar.css("left", position - _this.bar.width() / 2 + "px");
            if (typeof(showFunc) === "function") {
              _this.bar.animate({ opacity: 1, marginTop: 0 }, showFunc)
            }else {
              _this.bar.animate({ opacity: 1, marginTop: 0 })
            }
          });
        }
      },

      keepSlientWhenBlankSelected: function() {
        if (this.settings.keepSlientWhenBlankSelected && $.trim(window.getSelection().toString()) === ""){
          return true;
        }else {
          return false;
        }
      },

      isKeyMove: function() {
        var lastKeyPos = this.target.data('lastKeyPos');
        currentRect = $.popinfo.boundingRect();
        if ($.popinfo.utils.isNull(lastKeyPos)) {
          return null;
        }
        if (currentRect.top === lastKeyPos.top && currentRect.bottom !== lastKeyPos.bottom) {
          return DOWN;
        }
        if (currentRect.bottom === lastKeyPos.bottom && currentRect.top !== lastKeyPos.top) {
          return UP;
        }
        if (currentRect.right !== lastKeyPos.right) {
          return RIGHT;
        }
        if (currentRect.left !== lastKeyPos.left) {
          return LEFT;
        }
        return NONE;
      },

      setPosition: function(position) {
        this.settings.position = position === "relative" ? "relative" : "fixed";
      },

      //beforeShowCallbacks: [],

      //afterHideCallbacks: []

    },

    hideAllBar: function() {
      for (var i = 0, l = $.popinfo.instances.length; i < l; i++) {
        $.popinfo.instances[i].hide();
      }
    },

    addInstance: function(popinfo){
      $.popinfo.instances.push(popinfo);
    },

    boundingRect: function(rects) {
      if ($.popinfo.utils.isNull(rects)) {
        //rects = window.getSelection().getRangeAt(0).getClientRects();
        rects = $.popinfo.current.target.get(0).getClientRects();
      }
      return {
        top: parseInt(rects[0].top),
        left: parseInt(rects[0].left),
        right: parseInt(rects[rects.length -1].right),
        bottom: parseInt(rects[rects.length - 1].bottom)
      }
    },

    webkitBoundingRect: function() {
//      var rects = window.getSelection().getRangeAt(0).getClientRects();
      var rects = $.popinfo.current.target.get(0).getClientRects();

      var wbRects = [];
      for (var i = 0, l = rects.length; i < l; i++) {
        var rect = rects[i];
        if (rect.width === 0) {
          continue;
        }else if ((i === 0 || i === rects.length - 1) && rect.width === 1) {
          continue;
        }else {
          wbRects.push(rect);
        }
      }
      return $.popinfo.boundingRect(wbRects);
    },

    getRect: function() {
      if ($.popinfo.utils.browser.firefox || $.popinfo.utils.browser.opera) {
        return $.popinfo.boundingRect();
      } else if ($.popinfo.utils.browser.chrome || $.popinfo.utils.browser.safari) {
        return $.popinfo.webkitBoundingRect();
      }
    },

    utils: {
      isNull: function(data) {
        if (typeof(data) === "undefined" || data === null) {
          return true;
        }
        return false;
      },
      randomNumber: function() {
        return Math.floor((Math.random() * 10000000) + 1);
      },
      trim: function(string) {
        return string.replace(/^\s+|\s+$/g, '');
      },
      browser: {
        chrome: navigator.userAgent.match(/chrome/i) ? true : false,
        safari: navigator.userAgent.match(/safari/i) && !navigator.userAgent.match(/chrome/i) ? true : false,
        firefox: navigator.userAgent.match(/firefox/i) ? true : false,
        opera: navigator.userAgent.match(/opera/i) ? true : false,
        ie: navigator.userAgent.match(/msie/i) ? true : false,
        webkit: navigator.userAgent.match(/webkit/i) ? true : false
      },
      findNodeWithTags: function(node, tags) {
        if (!$.isArray(tags)) {
          tags = [tags];
        }
        while (node) {
          if (node.nodeType !== 3) {
            var index = tags.indexOf(node.tagName);
            if (index !== -1) {
              return node;
            }
          }
          node = node.parentNode;
        }
        return null;
      }
    },

    addButton: function(button) {
      $.extend($.popinfo.buttons, button);
    },

    buttons: {}

  });
})(jQuery);
