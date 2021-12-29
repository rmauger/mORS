//background/helpchrome.js
//@ts-check
"use strict";

//@ts-ignore
const browser=chrome

function sendAwaitResponseBG(messageItem) {
    return new Promise((resolve, reject) => {
      try {
        browser.runtime.sendMessage({ message: messageItem }, (response) => {
          resolve(response);
        });
      } catch (error) {
        console.warn(error);
        reject(error);
      }
    });
  }
  
  /**
 * @param {string} warningId
 * @param {string} msgTxt
 */
 function logOrWarn(msgTxt, warningId = "") {
    console.warn(`%cNotification: ${msgTxt}`, "color:pink");
    if (warningId != "") {
      const newDate = new Date();
      const myId =
        warningId +
        newDate.getHours() +
        newDate.getMinutes +
        newDate.getMilliseconds;
      // @ts-ignore
      browser.notifications.create(
        myId,
        {
          // @ts-ignore
          iconUrl: chrome.runtime.getURL("images/icon48.png"),
          title: `Warning! ${warningId}`,
          type: "basic",
          message: msgTxt,
          priority: 2,
        },
        () => {}
      );
    }
  }

//Set initial variables on installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    browser.storage.sync.clear();
    browser.storage.sync.set(
      {
        cssSelectorStored: "Dark" ,
        lawsReaderStored: "OrLeg" ,
        collapseDefaultStored: false ,
        showSNsStored: true ,
        showBurntStored: true ,
        showMenuCheck: true, 
      }
      , ()=>{}
    );
  }
});

/**
 * @param {Promise<any>} soughtPromise
 * @param {(arg0: {response: any;}) => void} response
 */
 async function msgHandler(soughtPromise, response) {
  try {
    const resolvedPromise = await soughtPromise;
    response({ response: await resolvedPromise });
  } catch (e) {
    response({ response: `Error: ${e}` });
  }
}

/**
 * @param {{ url?: string; currentWindow?: boolean; active?: boolean; }} queryObj
 */
function queryPromise (queryObj) {
  return new Promise((resolve, reject) => {
    try {
      browser.tabs.query(queryObj), 
      tabs => resolve(tabs)
    } catch (e) {
      logOrWarn (`Error: ${e}`)
      reject(e)
    }
  })
}