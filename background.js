//background.js
// @ts-check

"use strict";

//setting out promises
function promiseGetActiveTab() {
  return new Promise((activeTab, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        activeTab(tabs[0]);
      } else {
        reject("Unable to determine active tab");
      }
    });
  });
}
function promiseGetOrLaw() {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.storage.sync.get("lawsReaderStored", (retrievedLawReader) => {
      if (retrievedLawReader) {
        resolve(retrievedLawReader.lawsReaderStored);
      } else {
        reject("Unable to retrieve stored user preference for Oregon Laws");
      }
    });
  });
}
function promiseGetDark() {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.storage.sync.get("isDarkStored", (darkStoredObj) => {
      if (darkStoredObj) {
        resolve(darkStoredObj.isDarkStored); // isDarkStored is index of key of stored object
      } else {
        reject("Unable to retrieve stored user preference for css Template");
      }
    });
  });
}

//Creating Listeners
//listening for mORS.js to reqeust removal or update of CSS
//@ts-ignore
/* chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  switch (msg.message) {
    case "updateCSS":
      const updateCSS = await promiseUpdateCSS();
      sendResponse({response:updateCSS})
      break;
    case "removeCSS":
      const removeCSS = await promiseRemoveCSS();
      console.log(removeCSS)
      sendResponse({response:await myTestPromise()})
      break;
    default:
      break;
  }
  return true;
}); */

//@ts-ignore
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.message=="Please Respond") {
      const testMessage = await myTestPromise();
      //const testMessage = "Success  "
      console.log(testMessage) // returns "Success"
      sendResponse({response:testMessage})
  }
  return true;
});

function myTestPromise() {
  return new Promise((resolve)=> {
    console.log("I'm working, give me .01 seconds")  // returns phrase via inspect view: service worker
    setTimeout(()=> {
      resolve("Success")
    }, 10)
  })
}

// responding to mORS.js request for stored OrLaws source or current tab's URL
//@ts-ignore
chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((msg) => {
    switch (msg.message) {
      case "RequestOrLawsSource":
        try {
          orLawReply();
          async function orLawReply() {
            const resolve = await promiseGetOrLaw();
            port.postMessage({ response: resolve });
          }
        } catch (e) {
          logOrWarn(e, "orLawsSource Error");
        }
        break;
      case "RequestTagURL":
        try {
          urlReply();
          async function urlReply() {
            const activeTab = await promiseGetActiveTab();
            port.postMessage({ response: activeTab.url });
          }
        } catch (e) {
          logOrWarn(e, "promiseGetURL");
        }
        break;
      default:
        break;
    }
  });
});

//removes any existing css and adds css from stored value
function promiseUpdateCSS() {
  return new Promise(async (UpdateCSS, reject)=>  {
    try {
      const resolve = await promiseGetDark();
      let insertCssFile = "";
      if (resolve) {
        insertCssFile = "./mORS_dark.css";
      } else {
        insertCssFile = "./mORS_light.css";
      }
      await promiseRemoveCSS();
      const activeTab = await promiseGetActiveTab();
      //@ts-ignore
      chrome.scripting.insertCSS({
        target: { tabId: activeTab.id },
        files: [insertCssFile],
      });
      UpdateCSS("Success")
    } catch (e) {
      logOrWarn(e, "updateCSS")
      reject(e)
    }
  })
}

function promiseRemoveCSS() {
  return new Promise(async (removeCSS, reject)=> {
    try {
      const activeTab = await promiseGetActiveTab();
      // @ts-ignore
      chrome.scripting.removeCSS({
        target: { tabId: activeTab.id },
        files: ["./mORS_dark.css", "./mORS_light.css"],
      });
      removeCSS("Success")
    } catch (e) {
      logOrWarn(`Could not remove css files. Err: ${e}`, "removeCSS()");
      reject(e)
    }
  })
}

/**
 * @param {string} warningId
 * @param {string} msgTxt
 */
function logOrWarn(msgTxt, warningId = "") {
  console.log(`MESSAGE: ${msgTxt}`);
  if (warningId != "") {
    const newDate = new Date();
    const myId =
      warningId +
      newDate.getHours() +
      newDate.getMinutes +
      newDate.getMilliseconds;
    // @ts-ignore
    chrome.notifications.create(
      myId,
      {
        // @ts-ignore
        iconUrl: chrome.runtime.getURL("images/icon48.png"),
        title: `Warning! ${warningId}`,
        type: "basic",
        message: msgTxt,
        priority: 1,
      },
      () => {}
    );
  }
}
