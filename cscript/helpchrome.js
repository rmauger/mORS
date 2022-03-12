//helpChrome.js
//@ts-check

//@ts-ignore
const browser = chrome;

/** Send message to background and await response
 * @param {any} messageItem
 */
const sendAwaitResponse = (messageItem) => {
  if (typeof messageItem == "string") {
    console.info(`Sent request to background: '${messageItem}'`);
  }
  return new Promise((resolve, reject) => {
    try {
      browser.runtime.sendMessage({ message: messageItem }, (response) => {
        resolve(response);
      });
    } catch (error) {
      warnCS(error, "helpChrome.js", "sendAwaitResponse");
      reject(error);
    }
  });
};
/** Loads in CSS style sheet from \data folder */
const createStyleSheet = () => {
  window.addEventListener("load", () => {
    infoCS("loading CSS", "helpChrome.js", "createStyleSheet");
    styleSheetCreate(); // stylesheet.js
  });
};

const startUp = () => {
  window.addEventListener("load", () => {
    infoCS("html loaded; running script", "helpChrome.js", "startup");
    runMain(); // mORS.js
  });
};

infoCS("Running chrome", "helpChrome.js");
