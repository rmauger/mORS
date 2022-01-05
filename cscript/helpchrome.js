//helpchrome.js
//@ts-check

//@ts-ignore
browser = chrome;

const sendAwaitResponse = (messageItem) => {
  console.log(`Request sent to background '${messageItem}'`);
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

const createStyleSheet =() => {
  window.addEventListener("load", () => {
    styleSheetCreate();
  });
}

const startUp = () => {
  window.addEventListener("load", () => {
    runMain();
  });
}