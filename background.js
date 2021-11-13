// background.js
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
function chromeStorageRetrieval (retrievalKey) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    chrome.storage.sync.get(retrievalKey, (key) => {
      if (key) {
        resolve(key.value);
      } else {
        reject("Unable to retrieve stored user preference");
      }
    })
  })
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
function promiseGetCss() {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.storage.sync.get("cssSelectorStored", (CssStoredObj) => {
      if (CssStoredObj) {
        resolve(CssStoredObj.cssSelectorStored); // get index of key of stored object
      } else {
        reject("Unable to retrieve stored user preference for css Template");
      }
    });
  });
}

//Creating Listeners
//listening for mORS.js to reqeust removal or update of CSS
//@ts-ignore
/**
 * @param {Promise<any>} retrievalFunction
 * @param {(arg0: {response: any;}) => void} response
 * @param {string} command
 */
async function messageHandler(retrievalFunction, response, command){
  console.log(`Executing : ${command}`)
  response({response:await retrievalFunction})
}

//@ts-ignore
chrome.runtime.onMessage.addListener((msg, _, response) => {
  const command = msg.message
  switch (command) {
    case "updateCSS":
      messageHandler(promiseDoUpdateCSS(), response, command)
      break;
    case "removeCSS":
      messageHandler(promiseDoRemoveCSS(), response, command);
      break;
    case "getOrLaw":
      messageHandler(chromeStorageRetrieval("lawsReaderStored"), response, command);
    case "getCssFile":
      messageHandler(chromeStorageRetrieval("cssSelectorStored"), response, command)
      break;
    case "getShowRNs":
      messageHandler(chromeStorageRetrieval("showRNsStored"), response, command)
      break;
    case "getShowBurnt":
      messageHandler(chromeStorageRetrieval("showBurntStored"), response, command)
      break;
    default:
      break;  
  }
  return true;
});

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
async function promiseDoUpdateCSS() {
  return new Promise(async (UpdateCSS, reject)=>  {
    try {
      const resolve = await promiseGetCss();
      let insertCssFile = "";
      switch (resolve) {
        case 'Dark':
          insertCssFile = "/css/dark.css";        
          break;
        case 'Light':
          insertCssFile = "/css/light.css";
          break;
        case 'DarkGrey':
          insertCssFile = "/css/darkgrey.css";
          break;
        default:
          insertCssFile = "/css/light.css";
          break;
      }
    await promiseDoRemoveCSS();
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

async function promiseDoRemoveCSS() {
  return new Promise(async (removeCSS, reject)=> {
    try {
      const cssFileList = ["/css/dark.css", "/css/light.css", "/css/darkgrey.css"]
      const activeTab = await promiseGetActiveTab();
      // @ts-ignore
      chrome.scripting.removeCSS({
        target: { tabId: activeTab.id },
        files: cssFileList,
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
