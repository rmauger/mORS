//popup.js
//@ts-check
"use strict";

/** Message passing to background.js (send message & resolves response)
 * @param {string|object} requestMsg
 */
function promiseBackgroundRequest(requestMsg) {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: requestMsg }, (response) => {
        infoLog(
          `Received response to ${requestMsg} : ${response.response}`,
          `promiseReqBackgroundJs(${requestMsg})`
        );
        resolve(response.response);
      });
    } catch (e) {
      reject(
        `Failed sending {message: ${requestMsg}} to background.js. Error: ${e}`
      );
    }
  });
}
// Message passing to ORS tabs (no response)
async function sendMsgToOrsTabs(msg) {
  const orsTabs = await getOrsTabs();
  for (const aTab of orsTabs) {
    //@ts-ignore
    chrome.tabs.sendMessage(aTab.id, { toMORS: msg });
  }
}

//Retrieves data from chrome.storage.sync & puts it in userform
async function displayUserOptions() {
  function storedDataFinder() {
    return Promise.all([
      promiseBackgroundRequest("getCssSelector"),
      promiseBackgroundRequest("getOrLaw"),
      promiseBackgroundRequest("getShowBurnt"),
      promiseBackgroundRequest("getShowSNs"),
      promiseBackgroundRequest("getCollapsed"),
      promiseBackgroundRequest("getShowMenu")
    ]);
  }
  try {
    console.groupCollapsed();
    const data = await storedDataFinder();
    // @ts-ignore
    for (let i = 0; i < formCssSelector.options.length; i++) {
      // @ts-ignore
      if (formCssSelector.options[i].value == data[0]) {
        // @ts-ignore
        formCssSelector.selectedIndex = i;
        break;
      }
    }
    // @ts-ignore
    for (let i = 0; i < orLawSelector.options.length; i++) {
      // @ts-ignore
      if (orLawSelector.options[i].value == data[1]) {
        // @ts-ignore
        orLawSelector.selectedIndex = i;
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
    console.groupEnd();
  } catch (e) {
    alert(e);
  }
}
//setup event listeners for form dropdowns & buttons
function addAllListeners() {
  orsLaunchButton.addEventListener("click", () => {
    // @ts-ignore
    const orsSection = document.getElementById("orsChapter").value;
    let orsChapter = `00${orsSection}`.match(/\d{3}[A-C]?\b/)[0]; // pad to exactly 3 digits
    let orsURL = `https://www.oregonlegislature.gov/bills_laws/ors/ors${orsChapter}.html#${orsSection}`;
    //@ts-ignore
    chrome.tabs.create({ url: orsURL });
  });
  orLawsLaunchButton.addEventListener("click", async () => {
    // @ts-ignore
    const orLawsYear = document.getElementById("orLawsYear").value;
    // @ts-ignore
    const orLawsChp = document.getElementById("orLawsChapter").value;
    try {
      const orLawsReader = await promiseBackgroundRequest("getOrLaw");
      const orLawObj = {
        year: orLawsYear,
        chap: orLawsChp,
        reader: orLawsReader,
      };
      const orLawUrl = await promiseBackgroundRequest({ orLawObj });
      if (/(oregonlegislature\.gov|heinonline)/.test(orLawUrl)) {
        infoLog(
          `Creating new tab for ${orLawUrl}`,
          `orLawsLaunch.EventListener`
        );
        errorMsg.innerHTML = "";
        //@ts-ignore
        chrome.tabs.create({ url: orLawUrl }), 2000;
      } else {
        errorMsg.innerHTML = orLawUrl;
      }
    } catch (e) {
      errorMsg.innerHTML = e;
    }
  });
  formCssSelector.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { cssSelectorStored: formCssSelector.value },
      () => {
        sendMsgToOrsTabs("css")
      }
    );
  });
  orLawSelector.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { lawsReaderStored: orLawSelector.value },
      () => {
        reloadORS();
      }
    );
  });
  showBurntCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { showBurntStored: showBurntCheck.checked },
      () => {
        // @ts-ignore
        sendMsgToOrsTabs({burnt:showBurntCheck.checked});
      }
    );
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { showSNsStored: showSNsCheck.checked },
      () => {
        //@ts-ignore
        sendMsgToOrsTabs({sn:showSNsCheck.checked});
      }
    );
  });
  collapseCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { collapseDefaultStored: collapseCheck.checked },
      () => {}
    );
  });
  showMenuCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { showMenuStored: showMenuCheck.checked },
      () => {
        reloadORS()
      }
    );
  });
}

// Returns list of tabs in active window displaying ORS pages
function getOrsTabs() {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.tabs.query(
        { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html*" },
        (tabs) => {
          resolve(tabs);
        }
      );
    } catch (e) {
      reject(`Failed while looking for tabs with ORS. Error ${e}`);
    }
  });
}


//reloading ORS tabs
async function reloadORS() {
  const orsTabs = await getOrsTabs();
  for (const aTab of orsTabs) {
    //@ts-ignore
    chrome.tabs.reload(aTab.id);
  }
}


/**
 * @param {string} infoTxt
 * @param {string} aFunction
 */
function infoLog(infoTxt, aFunction) {
  console.info(`%cpopup.js/${aFunction}: ${infoTxt}`, "color:orange");
}

// popup.js MAIN
const errorMsg = document.getElementById("errorMsg");
const formCssSelector = document.getElementById("cssSelector");
const orLawSelector = document.getElementById("OrLaws");
const orsLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const collapseCheck = document.getElementById("collapseDefault");
const showMenuCheck = document.getElementById("showMenu")

displayUserOptions();
addAllListeners();
window.addEventListener("focus", () => {
  infoLog(
    "Refreshed user options", "window.addEventListener('focus')"
  );
  displayUserOptions();
});
