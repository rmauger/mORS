// background.js
// @ts-check

"use strict";

//@ts-ignore

function navigate(aUrl) {
  //@ts-ignore
  chrome.tabs.create({url:aUrl})
}

//@ts-ignore
chrome.omnibox.onInputEntered.addListener((omniText) =>{
  const ors = /^ors:((\d{1,3}[A-C]?)(?:\.?$|.\d{3,4}$))/
  const orlaw = /^orlaw:((?:19|20)\d{2})[ /|&](\d{1,4})/
  if (ors.test(omniText)) {
    let orsSearch = omniText.replace(ors, '00$2.html#$1')
    orsSearch = orsSearch.replace(/\d{1,2}(\d{3}[A-C]?)(\.html)/, "$1$2")
    navigate(`https://www.oregonlegislature.gov/bills_laws/ors/ors${orsSearch}`)
  } else if (orlaw.test(omniText)) {
    const year = omniText.match(/(19|20)\d{2}\b/)[0]
    const chap = omniText.match(/\d{1,4}\b/)[0]
    async ()=> {
      const orReader = await promiseGetChromeStorage("lawsReaderStored")
      if (orReader == 'OrLeg') {
        let orLawFileName = orLawOrLegLookup["OL" + year].replace(
          /~/,
          "000" + chap
        );
        orLawFileName = orLawFileName.replace(
          /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
          "$1$2"
        );
        let orLawURL =
          "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/" +
          orLawFileName;
        navigate(orLawURL)
      } else if (orReader=='Hein') {
        const heinURL =
        `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chap}&sgo=Search&collection=ssl&search=go`;    
        navigate(heinURL)
      }
``  }
    console.log('Matched in part' )
  } else {
    console.log("No match")
  }  
})

//@ts-ignore
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

function promiseGetActiveTab() {
  return new Promise((activeTab, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        //console.log(`Found tab id ${tabs[0].id} url: ${tabs[0].url}`)
        activeTab(tabs[0]);
      } else {
        reject("Unable to determine active tab");
      }
    });
  });
}
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
 * @param {Promise<any>} retrievalFunction
 * @param {(arg0: {response: any;}) => void} response
 */
 async function messageHandler(retrievalFunction, response){
  response({response:await retrievalFunction})
}

// ADDING LISTENERS
//@ts-ignore
// chrome.runtime.onMessage.addListner((msg, _, _response) => {
//   const command = msg.SecondChannel
//   console.log(command)
// })


//@ts-ignore
chrome.runtime.onMessage.addListener((msg, _, response) => {
  const command = msg.message
  switch (command) {
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
