//popup.js
//@ts-check
"use strict";

/**
 * @param {string|object} requestMsg
 */
function promiseReqBackgroundJs(requestMsg) {
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
//setup event listeners for form dropdowns & buttons
function addAllListeners() {
  formCssNew.addEventListener("change", async () => {
    const getOldCss = await promiseReqBackgroundJs("getCssFile");
    setAfterGet(getOldCss);
    function setAfterGet(formOldCss) {
      //@ts-ignore
      chrome.storage.sync.set(
        // @ts-ignore
        { cssSelectorStored: formCssNew.value },
        () => {
          infoLog(
            // @ts-ignore
            `Retrieved OldCSS: ${formOldCss}, replacing with ${formCssNew.value}`,
            "formCssNew.eventListener"
          );
          //@ts-ignore
          refreshPage(formOldCss, formCssNew.value);
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
        sendMsgTabs();
      }
    );
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore
    chrome.storage.sync.set(
      // @ts-ignore
      { showSNsStored: showSNsCheck.checked },
      () => {
        sendMsgTabs();
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
  chpLaunchButton.addEventListener("click", () => {
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
      const orLawsReader = await promiseReqBackgroundJs("getOrLaw");
      const orLawObj = {
        year: orLawsYear,
        chap: orLawsChp,
        reader: orLawsReader,
      };
      const orLawUrl = await promiseReqBackgroundJs({ orLawObj });
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
}
async function displayUserOptions() {
  function storedDataFinder() {
    return Promise.all([
      promiseReqBackgroundJs("getCssFile"),
      promiseReqBackgroundJs("getOrLaw"),
      promiseReqBackgroundJs("getShowBurnt"),
      promiseReqBackgroundJs("getShowSNs"),
      promiseReqBackgroundJs("getCollapsed"),
    ]);
  }

  try {
    console.groupCollapsed();
    const data = await storedDataFinder();
    // @ts-ignore
    for (let i = 0; i < formCssNew.options.length; i++) {
      // @ts-ignore
      if (formCssNew.options[i].value == data[0]) {
        // @ts-ignore
        formCssNew.selectedIndex = i;
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
    console.groupEnd();
  } catch (e) {
    alert(e);
  }
}

function getTabsWithOrs() {
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

async function sendMsgTabs() {
  const orsTabs = await getTabsWithOrs();
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

async function reloadORS() {
  const orsTabs = await getTabsWithOrs();
  for (const aTab of orsTabs) {
    //@ts-ignore
    chrome.tabs.reload(aTab.id);
  }
}

/**
 * @param {string} oldCSS
 * @param {string} newCSS
 */
async function refreshPage(oldCSS, newCSS) {
  const oldCssFile = `/css/${cssSourceLookup[oldCSS]}`;
  const newCssFile = `/css/${cssSourceLookup[newCSS]}`;
  const orsTabs = await getTabsWithOrs();
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
// MAIN
const errorMsg = document.getElementById("errorMsg");
const formCssNew = document.getElementById("cssSelector");
const orLawSelector = document.getElementById("OrLaws");
const chpLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const collapseCheck = document.getElementById("collapseDefault");
const cssSourceLookup = {
  Dark: "dark.css",
  Light: "light.css",
  DarkGrey: "darkgrey.css",
};
addAllListeners();
window.addEventListener("focus", () => {
  infoLog(
    "Displaying user options & adding event listeners",
    "window.addEventListener"
  );
  displayUserOptions();
});
