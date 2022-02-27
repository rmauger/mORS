//helpchrome.js
//@ts-check

//@ts-ignore
const browser = chrome;

const sendAwaitResponse = (messageItem) => {
  if (typeof messageItem=="string") {
    console.log(`Sent request to background: '${messageItem}'`);
  }
  return new Promise((resolve, reject) => {
    try {
      browser.runtime.sendMessage({ message: messageItem }, (response) => {
        resolve(response);
      });
    } catch (error) {
      warnCS(error, "helpchrome.js", "sendAwaitResponse");
      reject(error);
    }
  });
}
/** Loads in CSS style sheet from \data folder */
const createStyleSheet =() => {
  window.addEventListener("load", () => {
    infoCS("loading CSS", 'helpchrome.js', 'createStyleSheet')
    styleSheetCreate(); // stylesheet.js
  });
}

const startUp = () => {
  window.addEventListener("load", () => {
    infoCS("html loaded; running script", 'helpchrome.js', 'startup')
    runMain(); // mORS.js
  });
}

infoCS("Running chrome", 'helpchrome.js')