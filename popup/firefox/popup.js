//popup.js
//@ts-check
"use strict";

/** Message passing to background.js (send message & resolves response)
 * @param {string|object} requestMsg
 */
function promiseBackgroundRequest(requestMsg) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    browser.runtime
      .sendMessage({ message: requestMsg })
      .then((response) => {
        infoLog(
          `Received response to ${requestMsg} : ${response.response}`,
          `promiseReqBackgroundJs(${requestMsg})`
        );
        resolve(response.response);
      })
      .catch((e) => {
        reject(
          `Failed sending {message: ${requestMsg}} to background.js. Error: ${e}`
        );
      });
  });
}
// Message passing to ORS tabs (no response requested)
async function sendMsgToOrsTabs(message) {
  //@ts-ignore
  browser.runtime
    .sendMessage({ message: "getOrsTabs" })
    .then((response) => {
      const orsTabs = response.response;
      for (const aTab of orsTabs) {
        //@ts-ignore
        browser.tabs.sendMessage(aTab.id, { toMORS: message });
      }
    })
    .catch((e) => console.warn(e));
}

//Retrieves data from storage.sync & puts it in userform
function promiseRefreshOptions() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    browser.runtime
      .sendMessage({ message: "getCssObjectJson" })
      .then((response) => {
        const css = response.response;
        //@ts-ignore
        formCssSelector.options.length = 0;
        for (var i = 0; i < Object.keys(css).length; i++) {
          var newOption = document.createElement("option");
          newOption.value = Object.keys(css)[i];
          newOption.innerHTML = Object.keys(css)[i];
          formCssSelector.appendChild(newOption);
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
      promiseBackgroundRequest("getCssUserOption"),
      promiseBackgroundRequest("getOrLaw"),
      promiseBackgroundRequest("getShowBurnt"),
      promiseBackgroundRequest("getShowSNs"),
      promiseBackgroundRequest("getCollapsed"),
      promiseBackgroundRequest("getShowMenu"),
      promiseRefreshOptions(),
    ]);
  }
  // MAIN displayUserOptions
  try {
    const data = await storedDataFinder();
    console.groupCollapsed("Stored data retrieved -->");
    for (let i = 0; i < data.length; i++) {
      console.info(data[i]);
    }
    console.groupEnd();
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
    browser.tabs.create({ url: orsURL });
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
        browser.tabs.create({ url: orLawUrl }), 2000;
      } else {
        errorMsg.innerHTML = orLawUrl;
      }
    } catch (e) {
      errorMsg.innerHTML = e;
    }
  });
  formCssSelector.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync
      //@ts-ignore
      .set({ cssSelectorStored: formCssSelector.value })
      .then(sendMsgToOrsTabs("css"));
  });
  orLawSelector.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync
      // @ts-ignore
      .set({ lawsReaderStored: orLawSelector.value })
      .then(reloadORS());
  });
  showBurntCheck.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync.set({ showBurntStored: showBurntCheck.checked }).then(
      // @ts-ignore
      sendMsgToOrsTabs({ burnt: showBurntCheck.checked })
    );
  });
  showSNsCheck.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync.set({ showSNsStored: showSNsCheck.checked }).then(
      //@ts-ignore
      sendMsgToOrsTabs({ sn: showSNsCheck.checked })
    );
  });
  collapseCheck.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync.set(
      // @ts-ignore
      { collapseDefaultStored: collapseCheck.checked }
    );
  });
  showMenuCheck.addEventListener("change", () => {
    //@ts-ignore
    browser.storage.sync
      .set(
        // @ts-ignore
        { showMenuStored: showMenuCheck.checked }
      )
      .then(reloadORS());
  });
}

//reloading ORS tabs
function reloadORS() {
  //@ts-ignore
  browser.runtime
    .sendMessage({ message: "getOrsTabs" })
    .then((response) => {
      const orsTabs = response.response;
      for (const aTab of orsTabs) {
        //@ts-ignore
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

// popup.js MAIN
const errorMsg = document.getElementById("errorMsg");
const formCssSelector = document.getElementById("cssSelector");
const orLawSelector = document.getElementById("OrLaws");
const orsLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const showBurntCheck = document.getElementById("showRSec");
const showSNsCheck = document.getElementById("showSNote");
const collapseCheck = document.getElementById("collapseDefault");
const showMenuCheck = document.getElementById("showMenu");

displayUserOptions();
addAllListeners();
window.addEventListener("focus", () => {
  infoLog("Refreshed user options", "window.addEventListener('focus')");
  displayUserOptions();
});
