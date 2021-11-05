//background.js
// @ts-check

"use strict";

//Creating Listeners
//listening for mORS.js to reqeust removal or update of CSS
//@ts-ignore
chrome.runtime.onMessage.addListener((received) => {
  switch (received.message) {
    case "updateCSS":
      updateCSS();
      break;
    case "removeCSS":
      removeCSS();
      break;
    default:
      break;
  }
});

// @ts-ignore
chrome.runtime.onConnect.addListener((port) => {
  // responding to mORS.js request for stored OrLaws source or current tab's URL
  port.onMessage.addListener((msg) => {
    switch (msg.message) {
      case "RequestOrLawsSource":
        let promiseGetOrLaw = new Promise((resolve, reject) => {
          // @ts-ignore
          chrome.storage.sync.get("lawsReaderStored", (retrievedLawReader) => {
            if (retrievedLawReader) {
              resolve(retrievedLawReader.lawsReaderStored);
            } else {
              reject(true);
            }
          });
        });
        promiseGetOrLaw
          .then((resolve) => {
            port.postMessage({ response: resolve });
          })
          .catch(() => {
            logOrWarn(
              "Error broke from orLawsSource Function in background.js",
              "orLawsSource Error"
            );
          });
        break;
      case "RequestTagURL":
        let promiseGetActiveTab = new Promise((activeTab, reject) => {
          // @ts-ignore
          chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            if (tabs) {
              activeTab(tabs[0]);
            } else {
              reject(true);
            }
          });
        });
        promiseGetActiveTab
          .then((activeTab) => {
            port.postMessage({ response: activeTab.url });
          })
          .catch((reject) => {
            if (reject) {
              logOrWarn(
                "Broke attempting to retrieve tab URL.",
                "promiseGetURL"
              );
            }
          });
        break;
      default:
        break;
    }
  });
});

//removes any existing css and adds css from stored value
function updateCSS() {
  let promiseGetDark = new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.storage.sync.get("isDarkStored", (darkStoredObj) => {
      if (darkStoredObj) {
        resolve(darkStoredObj.isDarkStored); // isDarkStored is index of key of stored object
      } else {
        reject(true);
      }
    });
  });
  promiseGetDark
    .then((resolve) => {
      let insertCssFile = "";
      if (resolve) {
        insertCssFile = "./mORS_dark.css";
      } else {
        insertCssFile = "./mORS_light.css";
      }
      removeCSS();
      let promiseGetActiveTab = new Promise((activeTab, reject) => {
        // @ts-ignore
        chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
          if (tabs) {
            activeTab(tabs[0]);
          } else {
            reject(true);
          } 
        });
      });
      promiseGetActiveTab.then((activeTab) => {
        logOrWarn(
          `CSS injection attempt is happening with ${insertCssFile} on tabId: ${activeTab.id}`
        );
        //@ts-ignore
        chrome.scripting.insertCSS({
          target: { tabId: activeTab.id },
          files: [insertCssFile],
        });
      }).catch((reject)=> {
        if (reject) {
          logOrWarn ("Did not update tabs", "insertCSS")
        }
      });
    })
    .catch((reject) => {
      if (reject) {
        // @ts-ignore
        logOrWarn("Error. Didn't find stored 'dark' status.", "Dark");
      }
    });
}

function removeCSS() {
  let promiseGetActiveTab = new Promise((activeTab, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        activeTab(tabs[0]);
      } else {
        reject(true);
      }
    });
  });
  promiseGetActiveTab.then((activeTab) => {
    try {
      // @ts-ignore
      chrome.scripting.removeCSS({
        target: { tabId: activeTab.id },
        files: ["./mORS_dark.css", "./mORS_light.css"],
      });
    } catch (error) {
      logOrWarn("Could not remove css files.", "RemoveCSS");
    }
  });
}

/**
 * @param {string} warningId
 * @param {string} msgTxt
 */
function logOrWarn(msgTxt, warningId = "") {
  console.log(msgTxt);
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
