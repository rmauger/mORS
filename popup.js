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
//Retrieves data from chrome.storage.sync & puts it in userform
async function displayUserOptions() {
  function storedDataFinder() {
    return Promise.all([
      promiseBackgroundRequest("getCssFile"),
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
  formCssSelector.addEventListener("change", async () => {
    const getOldCss = await promiseBackgroundRequest("getCssFile");
    setAfterGet(getOldCss);
    function setAfterGet(formOldCss) {
      //@ts-ignore
      chrome.storage.sync.set(
        // @ts-ignore
        { cssSelectorStored: formCssSelector.value },
        () => {
          infoLog(
            // @ts-ignore
            `Retrieved OldCSS: ${formOldCss}, replacing with ${formCssSelector.value}`,
            "formCssNew.eventListener"
          );
          //@ts-ignore
          injectCssOrsTabs(formOldCss, formCssSelector.value);
        }
      );
    }
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
        sendMsgToOrsTabs();
      }
    );
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { showSNsStored: showSNsCheck.checked },
      () => {
        sendMsgToOrsTabs();
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

// Sends message to ORS tabs (no response)
// TODO: #33 separate messages for change in rSec & sourcenote; maybe use for show menu
async function sendMsgToOrsTabs() {
  const orsTabs = await getOrsTabs();
  for (const aTab of orsTabs) {
    const message = {
      // @ts-ignore
      rsec: showBurntCheck.checked,
      // @ts-ignore
      sN: showSNsCheck.checked,
    };
    //@ts-ignore
    chrome.tabs.sendMessage(aTab.id, { toMORS: message });
  }
}

//reloading ORS tabs
async function reloadORS() {
  const orsTabs = await getOrsTabs();
  for (const aTab of orsTabs) {
    //@ts-ignore
    chrome.tabs.reload(aTab.id);
  }
}

/** injecting newly selected stylesheet into existing ORS tabs
 * @param {string} oldCSS
 * @param {string} newCSS
 */
async function injectCssOrsTabs(oldCSS, newCSS) {
  const oldCssFile = `/css/${cssSourceLookup[oldCSS]}`;
  const newCssFile = `/css/${cssSourceLookup[newCSS]}`;
  const orsTabs = await getOrsTabs();
  for (const aTab of orsTabs) {
    try {
      //@ts-ignore
      chrome.scripting.removeCSS(
        {
          target: { tabId: aTab.id },
          files: [oldCssFile],
        },
        () => {}
      );
    } catch (error) {
      console.warn(`Error refreshing page: ${error}`);
    }
    //@ts-ignore
    chrome.scripting.insertCSS(
      {
        target: { tabId: aTab.id },
        files: [newCssFile],
      },
      () => {}
    );
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

//TODO #32 move css lookup to background.js to avoid duplication
const cssSourceLookup = {
  Dark: "dark.css",
  Light: "light.css",
  DarkGrey: "darkgrey.css",
};
displayUserOptions();
addAllListeners();
window.addEventListener("focus", () => {
  infoLog(
    "Refreshed user options", "window.addEventListener('focus')"
  );
  displayUserOptions();
});
