//background.js

"use strict";
chrome.runtime.onMessage.addListener((received, sender, response)=>{
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
  console.assert(port.name === "OrLawsSource");
  port.onMessage.addListener(function(msg) {
    console.log ("B: Channel open");
    if (msg.message == "RequestOrLawsSource") {
      let promiseGetOrLaw = new Promise((resolve, reject) => {
        chrome.storage.sync.get('lawsReaderStored', (object) => {
          if (object) {resolve(object.lawsReaderStored);
          } else {reject(false);}
        })
      });
      promiseGetOrLaw.then((resolve)=>{
        if (resolve) {port.postMessage({response:resolve})}
      }).catch(console.log("Error broke from orLawsSource Function in background.js"));
    };
  });
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

