//popup.js
//@ts-check

let browser;
/** Determine if Chrome or Firefox, based on manifest version */
const getBrowserPopup = () => {
  try {
    //@ts-ignore (chrome undefined)
    let manifest = chrome.runtime.getManifest();
    return (manifest.manifest_version == "3" && "chrome") || "firefox";
  } catch (error) {
    return "firefox";
  }
};
/** Sets up sync setting based on browser
 * @param browserName {string}  */
const setPromiseStorage = (browserName) => {
  if (browserName == "chrome") {
    return (/** @type {{}} */ keyAndValueObj) => {
      return new Promise((resolve, reject) => {
        infoPU(`storing: ${Object.keys(keyAndValueObj)}`);
        try {
          browser.storage.sync.set(keyAndValueObj, () => {
            resolve(true);
          });
        } catch (e) {
          reject(e);
        }
      });
    };
  } else {
    return (/** @type {{}} */ keyAndValueObj) => {
      return new Promise((resolve) => {
        infoPU(`seeking: ${keyAndValueObj}`);
        resolve(browser.storage.sync.set(keyAndValueObj));
      });
    };
  }
};

/** Sets up sending messages based on browser
 * @param browserName {string}
 */
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
      return new Promise((resolve, reject) => {
        browser.runtime.sendMessage(messageObj, (result) => {
          resolve(result);
        });
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
        resolve(response.response);
      })
      .catch((e) => {
        warnPU(requestMsg);
        warnPU(e);
        reject(
          `Failed msg:{message: ${requestMsg}} sent to background.js. ${e}`
        );
      });
  });
};

/** Message passing to ORS tabs (string only, no response requested)
 * @param {string} message
 */
function sendMsgToOrsTabs(message) {
  promiseBGMessage("getOrsTabs")
    .then((response) => {
      const orsTabs = response;
      for (const aTab of orsTabs) {
        browser.tabs.sendMessage(aTab.id, { toMORS: message }); // no callback so chrome and firefox commands same
        infoPU(`Sent '${message}' to tab #${aTab.id}`, "sendMsgToOrsTabs");
      }
    })
    .catch((e) => warnPU(`getOrsTabs ${e}`));
}

/**Retrieves list of options from background (webresources.js) & puts it in userform
 */
function promiseRefreshOptions() {
  return new Promise((resolve, reject) => {
    promiseBGMessage("getCssObjectJson")
      .then((response) => {
        let css;
        try {
          css = response;
          //@ts-ignore
          cssDropDown.options.length = 0;
          for (var i = 0; i < Object.keys(css).length; i++) {
            var newOption = document.createElement("option");
            newOption.value = Object.keys(css)[i];
            newOption.innerHTML = Object.keys(css)[i];
            cssDropDown.appendChild(newOption);
          }
        } catch (e) {
          warnPU(`Error displaying css options: ${e}`, "promiseRefreshOptions");
          reject(`getCssObjectJson => ${e}`);
        }
        resolve(css);
      })
      .catch((e) => {
        warnPU(`Error retrieving css options: ${e}`, "promiseRefreshOptions");
        reject(`promiseRefreshOptions ${e}`);
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
    const storedData = await storedDataFinder();
    // @ts-ignore
    for (let i = 0; i < cssDropDown.options.length; i++) {
      // @ts-ignore
      if (cssDropDown.options[i].value == storedData[0]) {
        // @ts-ignore
        cssDropDown.selectedIndex = i;
        break;
      }
    }
    // @ts-ignore  (property exists)
    for (let i = 0; i < orLawDropDown.options.length; i++) {
      // @ts-ignore  (value exists)
      if (orLawDropDown.options[i].value == storedData[1]) {
        // @ts-ignore  (property exists)
        orLawDropDown.selectedIndex = i;
        break;
      }
    }
    // @ts-ignore (value exists)
    showBurntCheck.checked = storedData[2];
    // @ts-ignore (value exists)
    showSNsCheck.checked = storedData[3];
    // @ts-ignore (value exists)
    collapseCheck.checked = storedData[4];
    // @ts-ignore (value exists)
    showMenuCheck.checked = storedData[5];
    let manifest = browser.runtime.getManifest();
    versionID.innerHTML = `v.${manifest.version}`      
  } catch (e) {
    warnPU(e);
  }
}
const userMsg=(text, color='default') => {
  htmlMsgBox.innerHTML=`<span style='color:${color}'>${text}</span>`
}
/**setup event listeners for form dropdowns & buttons*/
function addAllListeners() {
  launchButton.addEventListener("click", () => {
    //@ts-ignore (value exists)
    infoPU(`Search for '${orsSearch.value}`);
    //@ts-ignore (value exists)
    promiseBGMessage({ navToOrs: orsSearch.value });
  });
  helpButton.addEventListener("click", () => {
    htmlMsgBox 
  })
  colorOptions.addEventListener("click", () => {
    if (getBrowserPopup() == "chrome") {
      browser.tabs.create({
        url: browser.runtime.getURL(`/options/chrome/options.html`),
      });
    } else {
      htmlMsgBox.innerHTML = 
        "<span style='color:red'>Custom colors don't work in firefox (as of 1/15/22)</span>";
    }
  });
  cssDropDown.addEventListener("change", () => {
    //@ts-ignore (value exists)
    promiseStoreKey({ cssSelectorStored: cssDropDown.value })
      .then(() => {
        sendMsgToOrsTabs("css"); // alert tabs that css sheet has changed
      })
      .catch((e) => {
        warnPU(`error storing css from dropdown ${e}`);
      });
  });
  orLawDropDown.addEventListener("change", () => {
    //@ts-ignore (value exists)
    promiseStoreKey({ lawsReaderStored: orLawDropDown.value })
      .then(() => {
        reloadORS(); // reload all the pages looking at ORS sites using new reader
      })
      .catch((e) => {
        warnPU(`store lawReader dropdown: ${e}`);
      });
  });
  showBurntCheck.addEventListener("change", async () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ showBurntStored: showBurntCheck.checked })
      .then(() => {
        //@ts-ignore (checked value exists)
        sendMsgToOrsTabs({ burnt: showBurntCheck.checked }); // alert tabs that visibility of rsecs has changed
      })
      .catch((e) => {
        warnPU(`store burnt sec check ${e}`);
      });
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ showSNsStored: showSNsCheck.checked })
      .then(() => {
        //@ts-ignore (checked value exists)
        sendMsgToOrsTabs({ sn: showSNsCheck.checked }); // alert tabs that visibility of source notes has changed
      })
      .catch((e) => {
        warnPU(`store source note checkbox: ${e}`);
      });
  });
  showFWCheck.addEventListener("change", ()=> {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ showFullWidth: showFWCheck.checked})
    .then (() => {
      htmlMsgBox.innerHTML = '"Full Width" changes will only display on new or reloaded tabs'
    })
  })
  collapseCheck.addEventListener("change", () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ collapseDefaultStored: collapseCheck.checked })
      .then(() => {
        htmlMsgBox.innerHTML =
          '"Collapse all" changes will only display on new or reloaded tabs';
      })
      .catch((e) => {
        warnPU(`store collapse checkbox: ${e}`);
      });
  });
  showMenuCheck.addEventListener("change", () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ showMenuStored: showMenuCheck.checked })
      .then(() => {
        reloadORS(); // reload ORS tabs using new state of menu
      })
      .catch((e) => {
        warnPU(`store Menu checkbox: ${e}`);
      });
  });
}

/**Send command to tabs displaying ORS to reload (after setting update)*/
function reloadORS() {
  promiseBGMessage("getOrsTabs")
    .then((response) => {
      const orsTabs = response;
      for (const aTab of orsTabs) {
        browser.tabs.reload(aTab.id);
      }
    })
    .catch((e) => {
      warnPU(`get ORS tab list ${e}`);
    });
}

/** Info message handling (Log to service worker inspection)
 * @param {string} infoTxt
 * @param {string} [calledBy]
 */
function infoPU(infoTxt, calledBy) {
  if (calledBy == undefined) {
    try {
      calledBy = infoPU.caller.name;
    } catch {
      calledBy = "null";
    }
  }
  promiseBGMessage({
    info: {
      script: "popup.js",
      txt: infoTxt,
      aCaller: calledBy,
      color: "orange",
    },
  });
}

/**  Warning message handling (Log to service worker inspection)
 * @param {string} warnTxt
 */
function warnPU(warnTxt, calledBy) {
  if (calledBy == undefined) {
    try {
      calledBy = warnPU.caller.name;
    } catch {
      calledBy = "null";
    }
  }
  if (calledBy != undefined) {
    calledBy = calledBy + ":";
  }
  promiseBGMessage({
    warn: {
      script: "popup.js",
      txt: warnTxt,
      aCaller: calledBy,
      color: "color:orange",
    },
  });
}

// POPUP.js MAIN

// set variables to match elements on popup.html
const htmlMsgBox = document.getElementById("userMsg");
const orsSearch = document.getElementById("mORSnavigate");
const launchButton = document.getElementById("launchButton");
const helpButton = document.getElementById("helpButton");
const exampleButton = document.getElementById("exampleButton");
const cssDropDown = document.getElementById("cssSelector");
const colorOptions = document.getElementById("colorOptions");
const orLawDropDown = document.getElementById("OrLaws");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const showFWCheck = document.getElementById("showFullWidth")
const collapseCheck = document.getElementById("collapseDefault");
const showMenuCheck = document.getElementById("showMenu");
const versionID = document.getElementById("version");
//@ts-ignore (chrome undefined)
browser = chrome;
console.clear();
// set message response & storage sync set function based on browser
const promiseMsgResponse = setMsgResponse(getBrowserPopup());
const promiseStoreKey = setPromiseStorage(getBrowserPopup());
// then set up popup displays and functions
Promise.all([promiseMsgResponse, promiseStoreKey]).then(() => {
  displayUserOptions(); // display saved info
  addAllListeners(); // set up logic for buttons, dropdowns & checkboxes
});
