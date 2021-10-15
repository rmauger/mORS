//background.js
// @ts-nocheck - only "errors" found were in chrome

"use strict";
chrome.runtime.onMessage.addListener((received)=>{
  switch (received.message) {
    case 'updateCSS':
      updateCSS();
      break;
    case 'removeCSS':
      removeCSS();
      break;
    default:
      break; 
  }
});

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(function(msg) {
    if (msg.message == "RequestOrLawsSource") {
      let promiseGetOrLaw = new Promise((resolve, reject) => {
        chrome.storage.sync.get('lawsReaderStored', (object) => {
          if (object) {resolve(object.lawsReaderStored);
          } else {
            reject(true);
          }
        })
      });
      promiseGetOrLaw.then((resolve)=>{
        if (resolve) {port.postMessage({response:resolve})}
      }).catch((reject)=> {
        if (reject) {
          alert("Error broke from orLawsSource Function in background.js")
        };
      });
    };
  });
});

function updateCSS() {
  let promiseGetDark = new Promise((resolve, reject) => {
    chrome.storage.sync.get('isDarkStored', (object) => {
      if (object) {
        resolve(object.isDarkStored);
      } else {
        reject(true);
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
  }).catch((reject)=> {
    if (reject) {
    alert("Error. Didn't find dark status.")
  }});
};

function removeCSS(){
  chrome.tabs.removeCSS({file:"mORS_dark.css"});
  chrome.tabs.removeCSS({file:"mORS_light.css"});
}
