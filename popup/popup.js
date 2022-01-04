//popup.js
//@ts-check

"use strict";

const getBrowserPopup = () => {
  try {
    //@ts-ignore
    let manifest = chrome.runtime.getManifest();
    if (manifest.manifest_version == "3") {
      return "chrome";
    } else {
      return "firefox";
    }
  } catch (error) {
    return "firefox";
  }
};

const setPromiseSetter = (/** @type {string} */ browserName) => {
  if (browserName == "chrome") {
    return (keyAndValueObj) => {
      new Promise((resolve, reject) => {
        console.log(keyAndValueObj);        
        try {
          browser.storage.sync.set(keyAndValueObj, () => {
            console.log("success")
            resolve(true)
          });
        } catch (e) {
          reject(e);
        }
      });
    };
  } else {
    return (keyAndValueObj) => {
      return new Promise((resolve) => {
        resolve(browser.storage.sync.set(keyAndValueObj))
      });
    };
  }
};

const setMsgResponse = (browserName) => {
  if (browserName == "chrome") {
    return (messageObj) => {
      return new Promise((resolve, reject) => {
        try {
          browser.runtime.sendMessage(messageObj, (response) =>
            resolve(response)
          );
        } catch (e) {
          reject(e);
        }
      });
    };
  } else {
    return (messageObj) => {
      return new Promise((resolve) => {
        resolve(browser.runtime.sendMessage(messageObj))
      });
    };
  }
};


/** Message passing to background.js (send message & resolves response)
 * @param {string|object} requestMsg
 */
const promiseBGMessage = (requestMsg) => {
  return new Promise((resolve, reject) => {
    promiseMsgResponse({ message: requestMsg })
      .then((response) => {
        if (typeof response.response==='string'){
          infoLog(
            `Received response to ${requestMsg} : ${response.response}:`,
            `promiseReqBackgroundJs(${requestMsg})`
          );

        } else {
          console.log(`Received response to ${requestMsg}: <next line>`)
          console.log(response.response)
        }
       resolve(response.response);
      })
      .catch((e) => {
        reject(
          `Failed sending {message: ${requestMsg}} to background.js. Error: ${e}`
        );
      });
  });
};

// Message passing to ORS tabs (no response requested)
function sendMsgToOrsTabs(message) {
  //@ts-ignore
  promiseBGMessage("getOrsTabs")
    .then((response) => {
      const orsTabs = response;
      for (const aTab of orsTabs) {
        browser.tabs.sendMessage(aTab.id, { toMORS: message });
      }
    })
    .catch((e) => console.warn(e));
}

//Retrieves list of options from background & puts it in userform
function promiseRefreshOptions() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    promiseBGMessage("getCssObjectJson")
      .then((response) => {
        console.log(response)
        const css = response;
        //@ts-ignore
        cssDropDown.options.length = 0;
        for (var i = 0; i < Object.keys(css).length; i++) {
          var newOption = document.createElement("option");
          newOption.value = Object.keys(css)[i];
          newOption.innerHTML = Object.keys(css)[i];
          cssDropDown.appendChild(newOption);
        }
        resolve(css);
      })
      .catch((e) => {
        reject(e);
      });
  });
}
async function displayUserOptions() {
  function storedDataFinder() {
    return Promise.all([
      promiseBGMessage("getCssUserOption"),
      promiseBGMessage("getOrLaw"),
      promiseBGMessage("getShowBurnt"),
      promiseBGMessage("getShowSNs"),
      promiseBGMessage("getCollapsed"),
      promiseBGMessage("getShowMenu"),
      promiseRefreshOptions(),
    ]);
  }
  // MAIN displayUserOptions
  try {
    console.groupCollapsed("Stored data retrieved -->");
    const data = await storedDataFinder();
    console.groupEnd();
    // @ts-ignore
    for (let i = 0; i < cssDropDown.options.length; i++) {
      // @ts-ignore
      if (cssDropDown.options[i].value == data[0]) {
        // @ts-ignore
        cssDropDown.selectedIndex = i;
        break;
      }
    }
    // @ts-ignore
    for (let i = 0; i < orLawDropDown.options.length; i++) {
      // @ts-ignore
      if (orLawDropDown.options[i].value == data[1]) {
        // @ts-ignore
        orLawDropDown.selectedIndex = i;
        break;
      }
    }
    // @ts-ignore
    showBurntCheck.checked = data[2];
    // @ts-ignore
    showSNsCheck.checked = data[3];
    // @ts-ignore
    collapseCheck.checked = data[4];
    // @ts-ignore
    showMenuCheck.checked = data[5];
  } catch (e) {
    alert(e);
  }
}

//setup event listeners for form dropdowns & buttons
function addAllListeners() {
  orsLaunchButton.addEventListener("click", () => {
    // @ts-ignore
    promiseBGMessage({ navToOrs: document.getElementById("orsChapter").value });
  });
  orLawsLaunchButton.addEventListener("click", async () => {
    // @ts-ignore
    const orLawsYear = document.getElementById("orLawsYear").value;
    // @ts-ignore
    const orLawsChp = document.getElementById("orLawsChapter").value;
    try {
      const orLawsReader = await promiseBGMessage("getOrLaw");
      const orLawObj = {
        year: orLawsYear,
        chap: orLawsChp,
        reader: orLawsReader,
      };
      const orLawUrl = await promiseBGMessage({ orLawObj });
      if (/(oregonlegislature\.gov|heinonline)/.test(orLawUrl)) {
        infoLog(
          `Creating new tab for ${orLawUrl}`,
          `orLawsLaunch.EventListener`
        );
        errorMsg.innerHTML = "";
        browser.tabs.create({ url: orLawUrl }), 2000;
      } else {
        errorMsg.innerHTML = orLawUrl;
      }
    } catch (e) {
      errorMsg.innerHTML = e;
    }
  });
  cssDropDown.addEventListener("change", () => {
    //@ts-ignore
    promiseSetKey({ cssSelectorStored: cssDropDown.value }).then(() => sendMsgToOrsTabs("css")) // alert tabs that css sheet has changed
    .catch((e) => console.log(e))
  });
  orLawDropDown.addEventListener("change", () => {
    //@ts-ignore
    promiseSetKey({ lawsReaderStored: orLawDropDown.value }).then(() => reloadORS())
    .catch((e) => console.warn(e));
  });
  showBurntCheck.addEventListener("change", async () => {
    //@ts-ignore
    promiseSetKey({ showBurntStored: showBurntCheck.checked })
    //.then(() => 
    const resolution = await getAllStorageSyncData();
    console.log(resolution)
    sendMsgToOrsTabs({ burnt: showBurntCheck.checked })
    //.catch((e) => console.warn(e));
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore
    promiseSetKey({ showSNsStored: showSNsCheck.checked }).then(sendMsgToOrsTabs({ sn: showSNsCheck.checked }))
    .catch((e) => console.warn(e));
  });
  collapseCheck.addEventListener("change", () => {
    //@ts-ignore
    promiseSetKey({ collapseDefaultStored: collapseCheck.checked }).then(() => {})
    .catch((e) => console.warn(e));
  });
  showMenuCheck.addEventListener("change", () => {
    //@ts-ignore
    promiseSetKey({ showMenuStored: showMenuCheck.checked }).then(() => reloadORS())
    .catch((e) => console.warn(e));
  });
}

//reloading ORS tabs
function reloadORS() {
  promiseBGMessage("getOrsTabs")
    .then((response) => {
      const orsTabs = response;
      for (const aTab of orsTabs) {
        browser.tabs.reload(aTab.id);
      }
    })
    .catch((e) => console.warn(e));
}

/**
 * @param {string} infoTxt
 * @param {string} aFunction
 */
function infoLog(infoTxt, aFunction) {
  console.info(`%cpopup.js/${aFunction}: ${infoTxt}`, "color:orange");
}

//TEMP GET ALL FROM STORAGE -->

// Where we will expose all the data we retrieve from storage.sync.
const storageCache = {};
const initStorageCache = getAllStorageSyncData().then(items => {
  // Copy the data retrieved from storage into storageCache.
  console.log(storageCache)
  Object.assign(storageCache, items);
});

// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
function getAllStorageSyncData() {
  // Immediately return a promise and start asynchronous work
  return new Promise((resolve, reject) => {
    // Asynchronously fetch all data from storage.sync.
    browser.storage.sync.get(null, (items) => {
      // Pass any observed errors down the promise chain.
      if (browser.runtime.lastError) {
        return reject(browser.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(items);
    });
  });
}

// < END


// POPUP.js MAIN
const errorMsg = document.getElementById("errorMsg");
const orsLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const cssDropDown = document.getElementById("cssSelector");
const orLawDropDown = document.getElementById("OrLaws");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const collapseCheck = document.getElementById("collapseDefault");
const showMenuCheck = document.getElementById("showMenu");

//@ts-ignore
let browser;
if (getBrowserPopup() == "chrome") {
  //@ts-ignore
  browser = chrome;
}

const promiseMsgResponse = setMsgResponse(getBrowserPopup());
const promiseSetKey = setPromiseSetter(getBrowserPopup());
console.log(promiseMsgResponse);
console.log(promiseSetKey);

addAllListeners();
displayUserOptions();
