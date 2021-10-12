//background.js

"use strict";
chrome.runtime.onMessage.addListener((received)=>{
  if (received.message == "updateCSS") {
    updateCSS();}
  if (received.message == "removeCSS") {
    removeCSS();
  };
});

function updateCSS() {
  let promiseGetDark = new Promise((resolve, reject) => {
    chrome.storage.sync.get('isDarkStored', (object) => {
      if (object) {
        resolve(object.isDarkStored);
      } else {
        reject(false);
      }
    })
  });
  promiseGetDark.then((resolve)=>{
    if (resolve) {
      removeCSS()
      chrome.tabs.insertCSS({file:"mORS_dark.css"});
    } else {
      removeCSS()
      chrome.tabs.insertCSS({file:"mORS_light.css"});
    }
  }).catch();
};

function removeCSS(){
  chrome.tabs.removeCSS({file:"mORS_dark.css"});
  chrome.tabs.removeCSS({file:"mORS_light.css"});
}
