//popup.js
//@ts-check

//@ts-ignore
let browser;
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

const setPromiseStorage = (/** @type {string} */ browserName) => {
  if (browserName == "chrome") {
    return (keyAndValueObj) => {
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
    return (keyAndValueObj) => {
      return new Promise((resolve) => {
        infoPU(`seeking: ${keyAndValueObj}`);
        resolve(browser.storage.sync.set(keyAndValueObj));
      });
    };
  }
};

const setMsgResponse = (/** @type {string} */ browserName) => {
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
        //  infoPU(`Response to ${requestMsg} : ${response.response}`);
        resolve(response.response);
      })
      .catch((e) => {
        warnPU(requestMsg);
        warnPU(e);
        reject(
          `Failed msg:{message: ${requestMsg}} to background.js. Error: ${e}`
        );
      });
  });
};

// Message passing to ORS tabs (no response requested)
function sendMsgToOrsTabs(message) {
  promiseBGMessage("getOrsTabs")
    .then((response) => {
      const orsTabs = response;
      for (const aTab of orsTabs) {
        browser.tabs.sendMessage(aTab.id, { toMORS: message }); // no callback so chrome and firefox commands same
        infoPU(`sent '${message}' to tab #${aTab.id}`);
      }
    })
    .catch((e) => warnPU(`getOrsTabs ${e}`));
}

//Retrieves list of options from background & puts it in userform
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
          reject(`getCssObjectJson => ${e}`);
        }
        resolve(css);
      })
      .catch((e) => {
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
  } catch (e) {
    warnPU(e);
  }
}

//setup event listeners for form dropdowns & buttons
function addAllListeners() {
  orsLaunchButton.addEventListener("click", () => {
    //@ts-ignore (value exists)
    infoPU(`launching ORS for '${orsSearch.value}`);
    //@ts-ignore (value exists)
    promiseBGMessage({ navToOrs: orsSearch.value });
  });
  orLawsLaunchButton.addEventListener("click", async () => {
    //@ts-ignore (value exists)
    const orLawsYear = document.getElementById("orLawsYear").value;
    //@ts-ignore (value exists)
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
        infoPU(
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
  colorOptions.addEventListener("click", () => {
    if (getBrowserPopup() == "chrome") {
      browser.tabs.create({
        url: browser.runtime.getURL(`/options/chrome/options.html`),
      });
    } else {
      errorMsg.innerHTML =
        "Custom colors don't work in firefox (as of 1/15/22)";
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
  collapseCheck.addEventListener("change", () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ collapseDefaultStored: collapseCheck.checked })
      .then(() => {}) // nothing changes immediately when initial collapse state is changed; only when ORS reloaded
      .catch((e) => {
        warnPU(`store collapse checkbox: ${e}`);
      });
  });
  showMenuCheck.addEventListener("change", () => {
    //@ts-ignore (checked value exists)
    promiseStoreKey({ showMenuStored: showMenuCheck.checked })
      .then(() => {
        reloadORS(); // reload all the ORS tab using new state of menu
      })
      .catch((e) => {
        warnPU(`store Menu checkbox: ${e}`);
      });
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
    .catch((e) => {
      warnPU(`get ORS tab list ${e}`);
    });
}

// Info and error message handling (msg sent to background, logged to console)
/**
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

/**
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
console.clear();

// set variables to match elements on popup.html
const errorMsg = document.getElementById("errorMsg");
const orsSearch = document.getElementById("orsChapter");
const orsLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const cssDropDown = document.getElementById("cssSelector");
const colorOptions = document.getElementById("colorOptions");
const orLawDropDown = document.getElementById("OrLaws");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const collapseCheck = document.getElementById("collapseDefault");
const showMenuCheck = document.getElementById("showMenu");

//@ts-ignore (chrome undefined)
browser = chrome;

// set message response & storage sync set function based on browser
const promiseMsgResponse = setMsgResponse(getBrowserPopup());
const promiseStoreKey = setPromiseStorage(getBrowserPopup());

// making sure ready to go first
Promise.all([promiseMsgResponse, promiseStoreKey]).then(() => {
  addAllListeners(); // set up logic for buttons, dropdowns & checkboxes
  displayUserOptions(); // display saved info
});
