//helpchrome.js
//@ts-check

//@ts-ignore
const browser = chrome;

const sendAwaitResponse = (messageItem) => {
  if (typeof messageItem=="string") {
    console.log(`Request sent to background '${messageItem}'`);
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

const createStyleSheet =() => {
  window.addEventListener("load", () => {
    infoCS("loading CSS", 'helpchrome.js', 'createStyleSheet')
    styleSheetCreate();
  });
}

const startUp = () => {
  window.addEventListener("load", () => {
    infoCS("html loaded; running script", 'helpchrome.js', 'startup')
    runMain();
  });
}

infoCS("Running chrome", 'helpchrome.js')