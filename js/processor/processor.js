;(function(processor, toastr, rangy, Parse, $) {

  var ANNOTATION_TABLE_NAME= "Annotation";
  var USER_TABLE_NAME = "User";
  var USER_ANNOTATION_TABLE_NAME = "UserAnnotation";

  $.extend(processor, {

    useModule: function(moduleName) {
      $.extend(processor, processor.modules[moduleName]);
    },

    addModule: function(module) {
      $.extend(processor.modules, module);
    },

    modules: {},

    postList: {},

    refreshPostList: function() {
      processor.postList = {};
      $(processor.container).each(function() {
        var info = processor.getInfoFromContainer(this)
        processor.postList[info.postId] = {username: info.userName, element: this};
      });
    },

    refreshAnnotations: function(user) {
      var isUserValidate = !processor.user.isUserLogOut(user);
      
      var initDisplay = function(annotationsInPosts, opinions) {
        for (var id in annotationsInPosts) {
          processor.utils.initAnnotationDisplay(processor.postList[id], opinions);
        }
      };

      processor.refreshPostList();

      if (isUserValidate) {
        $(processor.initElements).popline();
      }

      processor.database.queryAnnotation(function(annotationsIdList, annotationsInPosts) {
        if (isUserValidate) {
          processor.database.queryUserAnnotation(annotationsIdList, function(opinions) {
            initDisplay(annotationsInPosts, opinions);
          });
        } else {
          initDisplay(annotationsInPosts, {});
        }
      });
    },

    clearAnnotations: function() {
      var annotator = $(processor.initElements).data("popline");
      if (annotator) {
        annotator.destroy();
      }
      for (id in processor.postList) {
        processor.utils.destroyAnnotationDisplay(processor.postList[id]);
      }
    },

    /* 
      user: {objectId, username, nickname, opinions: {opinion, link}}
    */
    user: {
      objectId: null,
      username: null,
      nickname: null,

      /* The user opinions in current web page */
      opinions: {},

      _wholeWord: null,
      _mark: null,
      _highlight: null,     

      /*
        isUserLogOut:
          Here input user should only have three keys: [objectId, username, nickname]
      */
      isUserLogOut: function(newUser) {
        var user = newUser || this;
        var keys = ['objectId', 'username', 'nickname'];
        for (var i = 0; i < keys.length; i++) {
          var value = user[keys[i]];
          if (value === "" || typeof(value) === "undefined") {
            return true;
          }
        }
        return false;
      },
      
      getLoginUser: function(callback) {
        chrome.storage.local.get(['objectId', 'username', 'nickname'], function(user) {
          $.extend(processor.user, user, {opinions: {}});
          callback(user);
        });
      },

      /* 
        Initialize options
      */
      initializeOptions: function(_callback){
        chrome.storage.local.get(['mark', 'highlight', 'word'], function(result) {
          processor.user._wholeWord = result.word;
          processor.user._mark = result.mark;
          processor.user._highlight = result.highlight;
          console.log("the whole word option is ",processor.user._wholeWord); 
          _callback();
        });
      }

    },

    utils: {

      getContainerFromRange: function(containerClass, range) {
        var element = range.commonAncestorContainer;
        while (element) {
          if ($(element).is(containerClass)) {
            return element;
          }
          element = element.parentNode;
        }
        return null;
      },

      initAnnotationDisplay: function(post, opinions) {
        var element = post.element, annotations = post.annotations;
        var displayOnly = processor.user.isUserLogOut();

        var annotationArray = [];
        for (annotationId in annotations) {
          annotationArray.push(annotations[annotationId]);
        }

        annotationArray.sort(function(a, b) {
           return parseInt(a.textRange.characterRange.start) -
                  parseInt(b.textRange.characterRange.start)
        }); 

        var groupTexts = processor.utils.groupTextRanges(annotationArray);
        $(element).data("annotation-groups", groupTexts);

        for (var i = 0; i < groupTexts.length; i++) {
          var groupSel = groupTexts[i].selections;
          console.log(groupTexts[i]);
          processor.utils.highlight(element, groupTexts[i], {"annotation-group": i});
          for (var j = 0; j < groupSel.length; j++) {
            $.extend(groupSel[j], opinions[groupSel[j].id]);
          }
          $(element).find(".tc-annotation-group-" + i).popline({
            mode: "display",
            annotations: groupSel, 
            post: post,
            displayOnly: displayOnly,
            enable: ["prevArrow", "thumbsUp", "numThumbsUp", "thumbsDown", "numThumbsDown", "nextArrow"]
          });
        }
      },

      destroyAnnotationDisplay: function(post) {
        var element = post.element;
        var groupTexts = $(element).data("annotation-groups");

        if (groupTexts) {
          for (var i = 0; i < groupTexts.length; i++) {
            var groupSel = groupTexts[i].selections;
            var $annotationGroup = $(element).find(".tc-annotation-group-" + i);
            $annotationGroup.data("popline").destroy();
            processor.utils.removeHighlight(element, groupTexts[i], {"annotation-group": i});
          }
          $(element).removeData("groupTexts");
        }
      },

      refreshAnnotationDisplay: function(post) {
        processor.utils.destroyAnnotationDisplay(post);
        if (Object.keys(post.annotations).length > 0) {
          processor.utils.initAnnotationDisplay(post, processor.user.opinions);
        }
      },

      insertAnnotation: function(entry, result) {
        var annotation = {
          id: result.id,
          selectedText: entry.selectedText,
          textRange: entry.textRange,
          numberOfAgree: entry.numberOfAgree,
          numberOfDisagree: entry.numberOfDisagree
        };
        processor.user.opinions[result.id] = {opinion: entry.opinion, link: entry.link};

        var post = processor.postList[entry.postId];
        post.annotations = post.annotations || {};
        post.annotations[annotation.id] = annotation;
      },

      removeAnnotation: function(post, annotation) {
        delete post.annotations[annotation.id];
        delete processor.user.opinions[annotation.id];
      },

      groupTextRanges: function(textRanges) {
        var groupRanges = [{
          characterRange: {
            end: textRanges[0].textRange.characterRange.end,
            start: textRanges[0].textRange.characterRange.start
          },
          selections: [textRanges[0]]
        }];
        var groupOrder = 0;
        for (var i = 1; i < textRanges.length; i++) {
          var characterRange = textRanges[i].textRange.characterRange;
          var group = groupRanges[groupOrder];

          if (characterRange.start < group.characterRange.end) {
            group.selections.push(textRanges[i]);
            group.characterRange.end = (characterRange.end < group.characterRange.end) ?
                                       group.characterRange.end : characterRange.end;
          } else {
            groupRanges.push({
              characterRange: characterRange,
              selections: [textRanges[i]]
            });
            groupOrder = groupOrder + 1;
          }
        }
        return groupRanges;
      },


      highlight: function(element, textRange, group) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          if (group) {
            // var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight", {elementAttributes : group});
            var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight " + 
                                                         "tc-annotation-group-" + group["annotation-group"]);
          } else {
            var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight");
          }
          
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.applyToRange(range);
            } else if (window.getSelection().toString().length > 0) {
              cssApplier.applyToSelection();
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }
      },

      innerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.applyToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }
      },

      removeInnerHighlight: function(element, textRange) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          var cssApplier = rangy.createCssClassApplier("ta-annotation-inner-highlight");
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.undoToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }

      },

      removeHighlight: function(element, textRange, group) {
        var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;

        if (rangy.supported && classApplierModule && classApplierModule.supported) {
          // var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight", {elementAttributes : group});
          var cssApplier = rangy.createCssClassApplier("ta-annotation-highlight " + 
                                                       "tc-annotation-group-" + group["annotation-group"]);
          try {
            if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
              var range = rangy.createRange(element);
              var characterRange = textRange.characterRange;
              range.selectCharacters(element, characterRange.start, characterRange.end);
              cssApplier.undoToRange(range);
            }
          }
          catch(error) {
            console.log("DOM mutation!");
          }
        }

      }

    },

    database: {
    /*
      processor.database.saveAnnotation:
    */
      saveAnnotation: function(entry) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();

        annotation.save(entry,
        {
          success: function(result) {
            window.getSelection().removeAllRanges();

            processor.utils.insertAnnotation(entry, result);
            processor.utils.refreshAnnotationDisplay(processor.postList[entry.postId]);
            processor.database.saveUserAnnotation(entry, result);
          },
          error: function(result, error) {
            toastr.error(error.message, "Oops, failed to save this opinion...");
          }
        });
      },

      saveUserAnnotation: function(entry, result) {
        // Here result is the result return from Parse
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var userAnnotation = new UserAnnotation();

        var annotationId = result ? result.id : entry.annotationId;
        var entrySave = {
          userId: processor.user.objectId,
          username: processor.user.username,
          annotationId: annotationId,
          opinion: entry.opinion,
          link: entry.link
        };

        userAnnotation.save(entrySave, {
          success: function(newUserEntry){
            toastr.success("Opinion Saved", "Thank you");
          },
          error: function(newUserEntry, error){
            toastr.error(error.message, "Oops, failed to save your opinion...");
          }
        });
      },
    
    /*
      processor.database.update:
    */
      updateAnnotation: function(objectId, userOpinion) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);
        var annotation = new Annotation();
        annotation.id = objectId;
        
        if (userOpinion.increment[0] !== 0) {
          annotation.increment("numberOfAgree", userOpinion.increment[0]);
        }

        if (userOpinion.increment[1] !== 0) {
          annotation.increment("numberOfDisagree", userOpinion.increment[1]);
        }        

        annotation.save(null, {
          success: function(annotation) {
            processor.database.updateUserAnnotation(objectId, userOpinion.opinion);
          },
          error: function(annotation, error) {
            toastr.error(error.message, "Oops, failed to update this opinion...");
          }
        });

      },

      updateUserAnnotation: function(objectId, opinion) {
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(UserAnnotation);

        query.equalTo("userId", processor.user.objectId);
        query.equalTo("annotationId", objectId);

        query.first({
          success: function(result) {
            if (result) {
              result.set("opinion", opinion);
              result.save();
            } else {
              var entry = {annotationId: objectId, opinion: opinion}
              processor.database.saveUserAnnotation(entry);
            }
            toastr.success("Opinion Updated", "Thank you");
          },
          error: function(annotation, error) {
            toastr.error(error.message, "Oops, failed to update your opinion...");
          }
        });
      },

      /*
        processor.database.query: 

        INPUT: The posts are organized as followed:
        {
          postId : {
            username: [String],
            element: [HTML Element],
          },
          ...
        }
      */
      queryAnnotation: function(callback) {
        var Annotation = Parse.Object.extend(ANNOTATION_TABLE_NAME);

        var generateAnnotationsIdList = function(results) {
          var annotationsIdList = [];
          for (var j = 0; j < results.length; j++) {
            if (!(results[j].id in annotationsIdList) &&
                ((results[j].get("numberOfAgree") > 0) ||
                 (results[j].get("numberOfDisagree") > 0))) {
              annotationsIdList.push(results[j].id);
            }
          }
          return annotationsIdList;
        };

        var mapAnnotationsToPosts = function(results) {
          var postId, annotationsInPosts = {};

          for (var j = 0; j < results.length; j++) {
            var annotation = {
              id: results[j].id,
              selectedText: results[j].get("selectedText"),
              textRange: results[j].get('textRange'),
              numberOfAgree: results[j].get("numberOfAgree"),
              numberOfDisagree: results[j].get("numberOfDisagree")
            };

            postId = results[j].get("postId");
            annotationsInPosts[postId] = annotationsInPosts[postId] || {annotations: {}};
            if ((annotation.numberOfAgree > 0) || (annotation.numberOfDisagree > 0)) {
              annotationsInPosts[postId].annotations[results[j].id] = annotation;
            }
          }
          return annotationsInPosts;
        };

        var query = new Parse.Query(Annotation);
        query.containedIn("postId", Object.keys(processor.postList));

        query.find({
          success: function(results) {
            if (results.length > 0) {
              var annotationsInPosts = mapAnnotationsToPosts(results);
              var annotationsIdList = generateAnnotationsIdList(results);
              $.extend(true, processor.postList, annotationsInPosts);

              toastr.info(" ", results.length.toString() + " annotations found");
              callback(annotationsIdList, annotationsInPosts);
            }
          },
          error: function(error) {
            toastr.error(error.message, "Oops, something goes wrong...");
          }
        });
      },
      
      queryUserAnnotation: function(annotationsIdList, callback) {
        var UserAnnotation = Parse.Object.extend(USER_ANNOTATION_TABLE_NAME);
        var query = new Parse.Query(UserAnnotation);

        query.equalTo("userId", processor.user.objectId);
        query.containedIn("annotationId", annotationsIdList);

        query.find({
          success: function(results) {
            for (var i = 0; i < results.length; i++) {
              var annotationId = results[i].get("annotationId");
              var opinion = results[i].get("opinion");
              var link = results[i].get("link");
              processor.user.opinions[annotationId] = {opinion: opinion, link: link};
            }
            callback(processor.user.opinions);
          },
          error: function(error) {
            toastr.error(error.message, "Oops, something goes wrong...");
          }
        });
      },

      integrityCheck: function(keyList, object) {
        for (var i = 0; i < keyList.length; i++) {
          var key = keyList[i];
          if (typeof(object[key]) === "undefined"){
            return false;
          } else if ($.trim(object[key]) === "") {
            return false;
          }
        }
        return true;
      }

    }

  });

})(window.processor = window.processor || {}, toastr, rangy, Parse, jQuery);
