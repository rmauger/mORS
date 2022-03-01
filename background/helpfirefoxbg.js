//helpfirefox.js
//@ts-check

function sendAwaitResponseBG(messageItem) {
    return new Promise((resolve, reject) => {
      try {
        browser.runtime.sendMessage({ message: messageItem }, (response) => {
          resolve(response);
        });
      } catch (error) {
        warnCS(error, "helpfirefox.js", "sendAwaitResponseBG");
        reject(error);
      }
    });
  }

//Set initial variables on installation
browser.management.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    browser.storage.sync.clear();
    browser.storage.sync.set([
      { cssSelectorStored: "Dark" },
      { lawsReaderStored: "OrLeg" },
      { collapseDefaultStored: false },
      { showSNsStored: true },
      { showBurntStored: true },
      { showFullWidth: false},
      { showMenuCheck: true },
    ]);
    browser.management.onInstalled.removeListener(details);
  }
});

// Resolves promise and sends it as response to message.
// Chrome cannot return promise in response to msg, must resolve first
/**
 * @param {Promise<any>} referencedPromise
 * @param {(arg0: {response: any;}) => void} response
 */
async function msgHandler(referencedPromise, response) {
  try {
    const resolvedPromise = await referencedPromise;
    response({ response: await resolvedPromise });
  } catch (e) {
    response({ response: `Error: ${e}` });
  }
}