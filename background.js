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
  port.onMessage.addListener((msg) => {
    switch (msg.message) {
      case "RequestOrLawsSource":
        let promiseGetOrLaw = new Promise((resolve, reject) => {
          chrome.storage.sync.get('lawsReaderStored', (retrievedLawReader) => {
            if (retrievedLawReader) {
              resolve(retrievedLawReader.lawsReaderStored);
            } else {
              reject(true);
            }
          })
        });
        promiseGetOrLaw.then((resolve)=>{
          if (resolve) { //TODO:can I just get rid of if(resolve)?
            port.postMessage({response:resolve})
          } 
        }).catch(()=> {
          alert("Error broke from orLawsSource Function in background.js")
        });
        break;
      case "RequestTagURL":
        let promiseGetURL = new Promise((resolve, reject) => {
          chrome.tabs.query({currentWindow:true, active:true}, (tabs) => {
            if (tabs) {
              resolve(tabs[0].url);
            } else {
              reject(true);
            }
          })
        })
        promiseGetURL.then((resolve)=>{
          if (resolve) {
            port.postMessage({response:resolve})
            alert("Sending: " +resolve)
          };
        }).catch(()=> {
          alert("Error. Broke attempting to retrieve tab URL.")
        });        
        break;
      default:
        break;
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
