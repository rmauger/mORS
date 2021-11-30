// background.js
// @ts-check

"use strict";

//@ts-ignore
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    //@ts-ignore
    chrome.storage.sync.clear();
    //@ts-ignore
    chrome.storage.sync.set({ cssSelectorStored: "Dark" });
    //@ts-ignore
    chrome.storage.sync.set({ lawsReaderStored: "OrLeg" });
    //@ts-ignore
    chrome.storage.sync.set({ collapseDefaultStored: false });
    //@ts-ignore
    chrome.storage.sync.set({ showSNsStored: true });
    //@ts-ignore
    chrome.storage.sync.set({ showBurntStored: true });
    //@ts-ignore
    chrome.storage.sync.set({ showMenuCheck: true });
  }
});

/**
 * @param {string} aUrl
 */
function navigate(aUrl) {
  //@ts-ignore
  chrome.tabs.create({ url: aUrl });
}

//@ts-ignore
chrome.omnibox.onInputEntered.addListener((omniText) => {
  async function getOrLaw() {
    const year = omniText.match(/(19|20)\d{2}/)[0];
    const chap = omniText.match(/\d{1,4}$/)[0];
    try {
      const reader = await promiseGetChromeStorage("lawsReaderStored");
      const orsLawUrl = await promiseGetOrLegUrl(year, chap, reader);
      navigate(orsLawUrl);
    } catch (e) {
      logOrWarn(e, "Invalid OrLaw Request");
    }
  }
  const orlaw = /[^]*((?:19|20)\d{2})\s*?([/|&]|\s|c\.)\s*?(\d{1,4}$)[^]*/g;
  const ors = /[^.|&/123456789]*(\b\d{1,3}[A-C]?)(?:\.?$|.\d{3,4}$)[^]*/g;
  console.info(orlaw);
  console.info(ors)
  console.info(omniText);
  if (orlaw.test(omniText)) {
    getOrLaw();
    return
  } 
  if (ors.test(omniText)) {
    let orsSearch = omniText.replace(ors, "00$1.html#$&");
    orsSearch = orsSearch.replace(/\d{1,2}(\d{3}[A-C]?\.html)/, "$1");
    navigate(
      `https://www.oregonlegislature.gov/bills_laws/ors/ors${orsSearch}`
    );
    return
  } 
  logOrWarn(`Type 'mORS' + ORS '{chapter}' or '{section}' or '{year} c.{chapter#}\n
    (E.g., '659A', '174.010', or '2015 c.614')`);
  }
);

/**
 * @param {number} year
 * @param {number} chapter
 * @param {string} reader
 */
function promiseGetOrLegUrl(year, chapter, reader) {
  function orLawErrorCheck() {
    let errMsg = "";
    if ((year > 1859 && year < 2030) == false) {
      errMsg += "Oregon Laws volume must be a year after 1859.\n";
      // @ts-ignore
    } else if (year > 1999 == false && reader == "OrLeg") {
      errMsg +=
        "Oregon Laws on the Oregon Legislature's website are only available after 1999.\n";
    }
    if ((chapter < 2001 && chapter > 0) == false) {
      errMsg += "Chapter must be a number between 1 and 2000.\n";
    }
    // @ts-ignore
    if (reader == "None") {
      errMsg += "A session law lookup source is required.";
    }
    return errMsg;
  }
  return new Promise((resolve, reject) => {
    const errorMessage = orLawErrorCheck();
    if (errorMessage.length < 1) {
      try {
        if (reader == "OrLeg") {
          let orLawFileName = orLawOrLegLookup["OL" + year].replace(
            /~/,
            "000" + chapter
          );
          orLawFileName = orLawFileName.replace(
            /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
            "$1$2"
          );
          resolve(
            `https://www.oregonlegislature.gov/bills_laws/lawsstatutes/${orLawFileName}`
          );
        } else if (reader == "Hein") {
          resolve(
            `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chapter}&sgo=Search&collection=ssl&search=go`
          );
        }
      } catch (e) {
        reject(e);
      }
    } else {
      reject(errorMessage);
    }
  });
}

function promiseGetActiveTab(source) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        logOrWarn(`Active tab is #${tabs[0].id}, url: ${tabs[0].url}; requested by ${source}`);
        resolve(tabs[0]);
      } else {
        reject("Unable to determine active tab");
      }
    });
  });
}
/**
 * @param {string} objKey
 */
function promiseGetChromeStorage(objKey) {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.storage.sync.get(objKey, (storedObj) => {
        if (storedObj) {
          console.info(
            `background.js/PromiseGetChromeStorage : Retrieved from ${objKey} : ${storedObj[objKey]}`
          );
          resolve(storedObj[objKey]);
        } else {
          logOrWarn("Unable to retrieve stored user preference");
          reject("Unable to retrieve stored user preference");
        }
      });
    } catch (e) {
      logOrWarn(`Error: ${e}`, "ChromeStorage");
      reject(`Chrome storage retrieval error. Error: ${e}`);
    }
  });
}

/**
 * @param {Promise<any>} referencedPromise
 * @param {(arg0: {response: any;}) => void} response
 */
async function messageHandler(referencedPromise, response) {
  try {
    const resolvedPromise = await referencedPromise
    //console.info(`Response: ${resolvedPromise}`)
    response({ response: await resolvedPromise });
  } catch (e) {
    response({ response: `Error: ${e}` });
  }
}

//@ts-ignore
chrome.runtime.onMessage.addListener((msg, _sender, response) => {
  const received = msg.message;
  if (typeof received == "string") {
    switch (received) {
      case "getOrLaw":
        messageHandler(promiseGetChromeStorage("lawsReaderStored"), response);
        break;
      case "getCssSelector":
        messageHandler(promiseGetChromeStorage("cssSelectorStored"), response);
        break;
      case "getShowSNs":
        messageHandler(promiseGetChromeStorage("showSNsStored"), response);
        break;
      case "getShowBurnt":
        messageHandler(promiseGetChromeStorage("showBurntStored"), response);
        break;
      case "getShowMenu":
        messageHandler(promiseGetChromeStorage("showMenuStored"), response);
        break;
      case "getCollapsed":
        messageHandler(
          promiseGetChromeStorage("collapseDefaultStored"),
          response
        );
        break;
      case "getCurrentTab":
        messageHandler(promiseGetActiveTab("msgHandler"), response);
        break;
      case "getCssObject":
        messageHandler(promiseGetCssObject(), response);
        break;
      default:
        logOrWarn(
          "Received message made no sense.",
          "Invalid message to script; no response sent."
        );
        break;
    }
  } else if (received) {
    try {
      messageHandler(
        promiseGetOrLegUrl(
          received["orLawObj"].year,
          received["orLawObj"].chap,
          received["orLawObj"].reader
        ),
        response
      );
    } catch (e) {
      console.log(`received message:`)
      console.log(received)
      response(`Received message ${received}; err: ${e}`);
    }
  }
  return true;
});

/**
 * @param {string} warningId
 * @param {string} msgTxt
 */
function logOrWarn(msgTxt, warningId = "") {
  console.warn(`%cNotification: ${msgTxt}`, "color:pink");
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
const orLawOrLegLookup = {
  OL2021: "2021orlaw~.pdf",
  OL2020: "2020orlaw~.pdf",
  OL2019: "2019orlaw~.pdf",
  OL2018: "2018orlaw~.pdf",
  OL2017: "2017orlaw~.pdf",
  OL2016: "2016orlaw~.pdf",
  OL2015: "2015orlaw~.pdf",
  OL2014: "2014R1orLaw~ss.pdf",
  OL2013: "2013orlaw~.pdf",
  OL2012: "2012adv~ss.pdf",
  OL2011: "2011orLaw~.html",
  OL2010: "2010orLaw~.html",
  OL2009: "2009orLaw~.html",
  OL2008: "2008orLaw~.html",
  OL2007: "2007orLaw~.html",
  OL2006: "2006orLaw~ss1.pdf",
  OL2005: "2005orLaw~ses.html",
  OL2003: "2003orLaw~ses.html",
  OL2001: "2001orLaw~ses.html",
  OL1999: "1999orLaw~.html",
};

// OMNIBOX Items not yet ready for Manifest v3.
//  @ts-ignore
// chrome.omnibox.onInputChanged.addListener(
//   (_text, suggest) => {
//     let results = []
//     results.push({
//       content:'content',
//       description:'description'
//     })
//     suggest(results);
//   }
// )

// //@ts-ignore
// chrome.omnibox.setDefaultSuggestion(
//   {description:'A default description'}
// )

/* 
//@ts-ignore
chrome.omnibox.onInputEntered.addListener((text) => {
  updateDefaultSuggestion('')
})

//@ts-ignore
chrome.omnibox.onInputCancelled.addListener(function() {
  resetDefaultSuggestion();
});
 */
const promiseGetCssObject = () => {
  return new Promise(async (resolve, reject)=>{
    //@ts-ignore
    const cssObjectFile = chrome.runtime.getURL('/data/cssObject.json')
    console.log(cssObjectFile)
    fetch(cssObjectFile)
    .then((response) => response.json())
    .then((data) => {
      console.log(data) 
      resolve(data)
    })
  })
}