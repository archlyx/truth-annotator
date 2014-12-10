//development 
Parse.initialize("Jbz8IatuSOpr7xmnNXBpnCcN1cj2ox9sPzsqggak", "anMcouVSWbzeHoJmFJBcJYrmg8XtzUatOt7hrgJX");

//production 
//Parse.initialize("9zbBFAKNInGHpiGfcBDxyVtziFJKTwi3vELXFSdh", "kLfoYlttXbR595lXVKBYuvwe87pFOILQrCMG23kQ");

$(document).ready(function(){
    var currentUserId = showNickname();
    generateToggleHTML(currentUserId, function(){
      bindEvent(currentUserId);
    });
});

function generateToggleHTML(currentUserId, _callback) {
  var Annotation = Parse.Object.extend("Annotation");
  var query = new Parse.Query(Annotation);
  query.descending("createdAt");
  query.limit(5);
  query.find({
    success: function(objects) {
      var inHtml_util = ' <a href="#" id="welcome-myboard">Myboard</a> <a> | </a> <a href="option.html" id="welcome-option">Option</a> <a> | </a> <a href="#" id="welcome-logout">Logout</a> <a> | </a> <a href="#" id="welcome-close">Close</a>';

      //var inHtml_img = '<img id="welcome-img" src="util/chalk1.jpg"/>';
      var inHtml_img = '';
      var inHtml_title = '<p class=stat-title id=stat-title>Recent Chalks<br></p><hr>'; 
      
      $("#welcome-util").html(inHtml_util);
      $("#welcome-image").html(inHtml_img);
      $("#post-stat-pop").html(inHtml_title);
      for (var i = 0; i < objects.length; i++){
        generateAnnotation(objects[i], i);
      }
      _callback();
    }
  });
}

function generateAnnotation(object, index){
    var source = object.get('hostDomain');
    var btnup_pop = makeButton ('btnup_pop', 'gray');
    var btndown_pop = makeButton ('btndown_pop', 'gray');
    var selectedText = object.get('selectedText');
    var author = object.get('userName');
    var agree = object.get('numberOfAgree');
    var disagree = object.get('numberOfDisagree');
    var retweet = object.get('retweet');
    var inHtml_source = '<p class=stat-source>' + source + ': </p>'; 
    var inHtml_text = '<p class=stat-text id=stat-text-'+ index +'> " ' + selectedText + ' "</p>';
    var inHtml_author = '<p class=stat-author>' +'--by '+ author + '</p>';
    var inHtml_agree = '<span class=stat-agree id=pop_agree>' + agree + '</span>';
    var inHtml_disagree = '<span class=stat-disagree id=pop_disagree>' + disagree + '</span>';
    var inHtml_retweet = '<span class=stat-disagree id=pop_retweet>' + retweet + '</span>';
    var agree_text = '<span class=agree-text id=agree-text style="display:none;"> agreed </span>';
    var disagree_text = '<span class=disagree-text id=disagree-text style="display:none;"> disagreed </span>';
    var retweet_text = '<span class=retweet-text id=retweet-text style="display:none;"> retweets </span>';
    if(source === "twitter.com" & retweet != undefined){
      retweetMark = '<span class=retweet_pop id=retweet_mark data-toggle="modal" data-target="#myModal"><i class="icon-retweet"></i></span>';
      var inHtml_pop = inHtml_source + inHtml_text + inHtml_author + btnup_pop + inHtml_agree  + agree_text + btndown_pop +
      inHtml_disagree + disagree_text + retweetMark + inHtml_retweet + retweet_text;
    }
    else 
      var inHtml_pop = inHtml_source + inHtml_text + inHtml_author + btnup_pop + inHtml_agree + btndown_pop + inHtml_disagree;

    var inHtml_goPost = '<span class=stat-goPost id=pop_goPost_'+ index+'> go to post </span>';
    inHtml_pop = inHtml_pop + inHtml_goPost + "<hr>";
    $("#post-stat-pop").append(inHtml_pop);
    var linkId = '#pop_goPost_' + index;
    $(linkId).data("annotation", object);
}

/* generating see the post link
*/
function generateNewTab(node){
  var hostDomain = node.data("annotation").get('hostDomain');
  var sourceURL = node.data("annotation").get('sourceURL');
  var postId = node.data("annotation").get('postId');
  var userName = node.data("annotation").get('userName');
  if (hostDomain === 'twitter.com')
    url = 'https://twitter.com/' + userName + '/status/' + postId;
  else 
    url = sourceURL;
  window.open(url);
}

function bindEvent(userId){
/** generating original post link
*/
  for (var i = 0; i < 5; i++){
    var linkId = '#pop_goPost_' + i;
    $(linkId).click(function(){
      generateNewTab($(this));
    });
  }
 
  $("#welcome-logout").click(function(){
      Parse.User.logOut();
      removeStorage();
      chrome.browserAction.setIcon({path:'../../img/T-400_white.png'}, function()
      {
        window.close();
      });
  });
  
  $("#welcome-myboard").click(function(){
    var newURL = "http://www.truthchalk.com/personal.html";
    chrome.tabs.create({ url: newURL });
  });
    
  
  $("#welcome-close").click(function(){
    window.close();
  });
}

/*
function queryCurrentUser(objects, userId, _callback){
  var UserAnnotation = Parse.Object.extend("UserAnnotation");
  var query = new Parse.Query(UserAnnotation);
  query.equalTo('annotationId', annotationId);
  query.equalTo('userId', userId);
  query.find({
      success: function(results) {
        _callback(results);
      },
      error: function(error) {
        alert("Error: " + error.code + " " + error.message);
      }
  });
}
*/

  
function makeButton(btn, color){
  var btnClass;
  var font;
  var id;
  var button;
  if (btn === 'btnup_pop' | btn === 'btnup_con'){
    btnClass = '"btnup"';
    font = 'ta-check-mark';
    if(btn === 'btnup_pop')
    id = '"thumbup_pop"';
    else
    id = '"thumbup_con"';
  }
  else {
    btnClass = '"btndown"';
    font = 'ta-x';
    if(btn === 'btndown_pop')
    id = '"thumbdown_pop"';
    else
    id = '"thumbdown_con"';
  }
  button = '<span class=' + btnClass + ' id=' + id + ' style="color:'+ color + '"; data-toggle="modal" data-target="#myModal"><i class="fa ' + font + '"></i></span>';
  return button;
}

/*
function generateModal(node){
  if (node.attr('id') === 'thumbup_pop'){
    var wholePost = _popObject.get('wholePost');
    var textRange = _popObject.get('textRange');
  }
  else{
    var wholePost = _conObject.get('wholePost');
    var textRange = _conObject.get('textRange');
  }
  //console.log(wholePost);
  $(".modal-body").html(wholePost);

    //highlight the annotation
    var classApplierModule = rangy.modules.ClassApplier || rangy.modules.CssClassApplier;
    if (rangy.supported && classApplierModule && classApplierModule.supported) {
      var cssApplier = rangy.createCssClassApplier("whole-post-highlight");
    }
    var element = $(".modal-body").get(0);
    if (typeof(element) != "undefined" && typeof(textRange) != "undefined") {
      var range = rangy.createRange();
      console.log(textRange);
      startOffset = textRange.characterRange.start;
      endOffset = textRange.characterRange.end;
      range.setStart(element.firstChild, startOffset);
      range.setEnd(element.firstChild, endOffset);
      cssApplier.applyToRange(range);
    } else return;
}

function processVote(node,userId){
  var num;
  var numNode;

  var counterBtn; 
  var counterNumNode;
  var counterNum;

  var annotationObject;
  if (node.attr('id') === 'thumbup_pop'){
    numNode = $("#pop_agree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbdown_pop');
    counterNumNode = $('#pop_disagree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostAgree").data("object");
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbup_pop: 0});
    else
      chrome.storage.sync.set({thumbup_pop: 1});
  }

  else if (node.attr('id') === 'thumbdown_pop'){
    numNode = $("#pop_disagree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbup_pop');
    counterNumNode = $('#pop_agree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostAgree").data("object");
    if(node.css("color") === "rgb(0, 0, 255)") 
      chrome.storage.sync.set({thumbdown_pop: 0});
    else
      chrome.storage.sync.set({thumbdown_pop: 1});
  }
  
  else if (node.attr('id') === 'thumbup_con'){
    numNode = $("#con_agree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbdown_con');
    counterNumNode = $('#con_disagree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostDisagree").data("object");
  }
  
  else {
    numNode = $("#con_disagree");
    num = parseInt(numNode.html());
    counterBtn = $('#thumbup_con');
    counterNumNode = $('#con_agree');
    counterNum = parseInt(counterNumNode.html());
    annotationObject = $("stat-mostDisagree").data("object");
  }

  if(node.css("color") === "rgb(0, 0, 255)") {
    node.css({"color" : "gray"});
    num--;
    numNode.html(num);
  }
  else {
    if(counterBtn.css("color") === "rgb(0, 0, 255)") {
      counterNum--;
      counterNumNode.html(counterNum);
    }
      node.css({"color" : "blue"});
      num++;
      //console.log(counterBtn);
      counterBtn.css({"color":"gray"});
      numNode.html(num);
  }
    // need better logic to update parse
    //chrome.storage.sync.set({popAnnotation: object});
    //counterBtn.css({"color":""});
}
*/

function removeStorage(){
  chrome.storage.local.set({objectId: "", username: "", nickname:""}, function(){
  console.log('local nickname removed');
  });
}

function showNickname(){
  var currentUser = Parse.User.current();
  if(!currentUser){
      window.location.href = "login.html";
  }

  var inHtml1 = '<h1>Hello, '; 
  var inHtml2 = currentUser.get("nickname") + ' !' + '</h1>';
  var inHtml = inHtml1 + inHtml2;
  $("#welcome-toggle").html(inHtml);
  return currentUser.id;
}

