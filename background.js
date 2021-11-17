// background.js
// @ts-check

"use strict";

//@ts-ignore
chrome.runtime.onInstalled.addListener((details)=> {
  if (details.reason == "install") {
    //@ts-ignore
    chrome.storage.set([
      {cssSelectorStored: "Dark"},
      {lawsReaderStored: "OrLeg"},
      {collapseDefaultStored: false},
      {showSNsStored: true},
      {showBurntStored: true}
    ])
  }
})

/**
 * @param {string} aUrl
 */
function navigate(aUrl) {
  //@ts-ignore
  chrome.tabs.create({url:aUrl})
}

//@ts-ignore
chrome.omnibox.onInputEntered.addListener((omniText) =>{
  async function getOrLaw() {
    const year = omniText.match(/\b(19|20)\d{2}\b/)[0]
    const chap = omniText.match(/\d{1,4}$/)[0]
    const reader = await promiseGetChromeStorage("lawsReaderStored")
    console.log(year);
    console.log(chap);

    const navigateToOrLaw = await promiseGetOrLegUrl(year, chap, reader)
    navigate(navigateToOrLaw)
  }   
  const ors = /^ors:((\d{1,3}[A-C]?)(?:\.?$|.\d{3,4}$))/
  const orlaw = /^orlaw:\s?((?:19|20)\d{2})\s*?([/|&]|\s|c\.)\s*?(\d{1,4}$)/
    
  if (ors.test(omniText)) {
    let orsSearch = omniText.replace(ors, '00$2.html#$1')
    orsSearch = orsSearch.replace(/\d{1,2}(\d{3}[A-C]?)(\.html)/, "$1$2")
    navigate(`https://www.oregonlegislature.gov/bills_laws/ors/ors${orsSearch}`)
  } else if (orlaw.test(omniText)) {  
    getOrLaw()
  } else {
    console.log("No match")
  }    
  console.log('exited test function')  
})

/**
 * @param {number} year
 * @param {number} chapter
 * @param {string} reader
 */
function promiseGetOrLegUrl(year, chapter, reader) {
  function orLawErrorCheck() {
    let errMsg=""
    if ((year > 1859 && year < 2030) == false) {
      errMsg += "Oregon Laws volume must be a year after 1859.\n";
    // @ts-ignore
    } else if (year > 1999 == false && reader == "OrLeg") {
      errMsg +="Oregon Laws on the Oregon Legislature's website are only available before 1999.\n";
    }
    if ((chapter < 2001 && chapter > 0) == false) {
      errMsg += "Chapter must be a number between 1 and 2000.\n";
    }
    // @ts-ignore
    if (reader == "None") {
      errMsg += "A session law lookup source is required.";
    }
    return errMsg
  }
  return new Promise(async (resolve, reject)=>{
    const errorMessage=orLawErrorCheck()
    if(errorMessage.length < 1) {
      if (reader == 'OrLeg') {
        let orLawFileName = orLawOrLegLookup["OL" + year].replace(
          /~/,
          "000" + chapter
        );
        orLawFileName = orLawFileName.replace(
          /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
          "$1$2"
        );
        resolve(`https://www.oregonlegislature.gov/bills_laws/lawsstatutes/${orLawFileName}`)
      } else if (reader=='Hein') {
        resolve(`https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chapter}&sgo=Search&collection=ssl&search=go`);
      }
    } else {
      console.log(errorMessage)
      reject(errorMessage)
    }
  })
}



function promiseGetActiveTab() {
  return new Promise((activeTab, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        console.log(`Found tab id ${tabs[0].id} url: ${tabs[0].url}`)
        activeTab(tabs[0]);
      } else {
        reject("Unable to determine active tab");
      } 
    });
  });
}
/**
 * @param {string} objKey
 */
function promiseGetChromeStorage (objKey) {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.storage.sync.get(objKey, (storedObj) => {
        if (storedObj) {
          console.log(`Retrieved from ${objKey} : ${storedObj[objKey]}.`)
          resolve(storedObj[objKey]);
        } else {
          reject("Unable to retrieve stored user preference");
        }
      })
    } catch (e) {
      logOrWarn(`Error: ${e}`, 'ChromeStorage')
      reject(`chrome storage retrieval error. Error: ${e}`)
    }
  })
}

/**
 * @param {Promise<any>} referencedPromise
 * @param {(arg0: {response: any;}) => void} response
 */
 async function messageHandler(referencedPromise, response){
  response({response:await referencedPromise})
}

//@ts-ignore
chrome.runtime.onMessage.addListener((msg, _, response) => {
  const received = msg.message
  if (typeof received == 'string') {
    switch (received) {
      case "updateCSS":
        messageHandler(promiseDoUpdateCSS(), response)
        break;
      case "removeCSS":
        messageHandler(promiseDoRemoveCSS(), response);
        break;
      case "getOrLaw":
        messageHandler(promiseGetChromeStorage("lawsReaderStored"), response);
        break;
      case "getCssFile":
        messageHandler(promiseGetChromeStorage("cssSelectorStored"), response)
        break;
      case "getShowSNs":
        messageHandler(promiseGetChromeStorage("showSNsStored"), response)
        break;
      case "getShowBurnt":
        console.log('retrieving show Burn storage')
        messageHandler(promiseGetChromeStorage("showBurntStored"), response)
        break;
      case "getCollapsed":
        messageHandler(promiseGetChromeStorage("collapseDefaultStored"), response)
        break;
      case "getCurrentTab":
        console.log("retrieving active tab")
        messageHandler(promiseGetActiveTab(), response);
        break;
      case "Hello":
        console.log("Hello yourself.")
        break;
      default:
        console.log("message made no sense.")
        response("No response")
        break;
    }
  } else if (received.msgType=='orLaws') {
    console.log('orLaws...')
    const url=messageHandler(promiseGetOrLegUrl(received.year, received.chap, received.reader), response)
    console.log(`url: ${url}`)
    response(url)
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
            const resolve = await promiseGetChromeStorage("lawsReaderStored");
            port.postMessage({ response: resolve });
          }
        } catch (e) {
          logOrWarn(e, "orLawsSource Error");
        }
        break;
      case "RequestTagURL":
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
      const resolve = await promiseGetChromeStorage("cssSelectorStored");
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
    reject(`updateCSS error: ${e}`)
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
      reject(`RemoveCSS error: ${e}`)
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
let orLawOrLegLookup = { OL2021: "2021orlaw~.pdf",
  OL2020: "2020orlaw~.pdf", OL2019: "2019orlaw~.pdf",
  OL2018: "2018orlaw~.pdf", OL2017: "2017orlaw~.pdf",
  OL2016: "2016orlaw~.pdf", OL2015: "2015orlaw~.pdf",
  OL2014: "2014R1orLaw~ss.pdf", OL2013: "2013orlaw~.pdf",
  OL2012: "2012adv~ss.pdf", OL2011: "2011orLaw~.html",
  OL2010: "2010orLaw~.html", OL2009: "2009orLaw~.html",
  OL2008: "2008orLaw~.html", OL2007: "2007orLaw~.html",
  OL2006: "2006orLaw~ss1.pdf", OL2005: "2005orLaw~ses.html",
  OL2003: "2003orLaw~ses.html", OL2001: "2001orLaw~ses.html",
  OL1999: "1999orLaw~.html"};

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


///////////////////////////////////////////////