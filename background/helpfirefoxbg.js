//helpfirefox.js
//@ts-check

function sendAwaitResponseBG(messageItem) {
    return new Promise((resolve, reject) => {
      try {
        browser.runtime.sendMessage({ message: messageItem }, (response) => {
          resolve(response);
        });
      } catch (error) {
        console.warn(error);
        reject(error);
      }
    });
  }

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
    const newNotice = new Notification(`Warning! ${warningId}`, {
      body: msgTxt,
    });
  }
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

