//add listener for any tab change
chrome.tabs.onUpdated.addListener(pullLocalStorage);

//set browser action icon based on user login .
function pullLocalStorage(){
  //pull from local storage to determine the icon
  chrome.storage.sync.get(['objectId', 'username','nickname'], function(data){
    if (data.objectId !== "" & data.username !== "" & data.nickname !== "" & 
        data.objectId !== undefined & data.username !== undefined & data.nickname !== undefined){
        chrome.browserAction.setIcon({path:'../../img/T-400.png'}, function(){console.log("icon changed")});
    }
  });
}

//add listener for request of getting current host domain
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.question === "what is the host domain?"){
      console.log("question received");
      sendResponse({answer: sender.tab.url});
    }
    else
      console.log(request);
});

/*
chrome.cookies.onChanged.addListener(
  function(){
    console.log("cookie changed");
  });
*/

