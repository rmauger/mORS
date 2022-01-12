//background/helpchrome.js
//@ts-check
"use strict";

function sendAwaitResponseBG(messageItem) {
  return new Promise((resolve, reject) => {
    try {
      browser.runtime.sendMessage({ message: messageItem }, (response) => {
        resolve(response);
      });
    } catch (error) {
      warnLog(error, "helpchrome.js", "sendAwaitResponseBG");
      reject(error);
    }
  });
}

//Set initial variables on installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    browser.storage.sync.clear();
    browser.storage.sync.set(
      {
        cssSelectorStored: "Dark",
        lawsReaderStored: "OrLeg",
        showBurntStored: true,
        showSNsStored: true,
        collapseDefaultStored: false,
        showMenuStored: true,
      },
      () => {}
    );
  }
});

/**
 * @param {Promise<any>} soughtPromise
 * @param {(arg0: {response: any;}) => void} response
 */
async function msgHandler(soughtPromise, response) {
  try {
    const resolvedPromise = await soughtPromise;
    response({ response: await resolvedPromise });
  } catch (e) {
    response({ response: `Error: ${e}` });
  }
}