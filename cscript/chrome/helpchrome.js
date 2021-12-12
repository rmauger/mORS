//helpchrome.js
//@ts-check

//@ts-ignore
const browser=chrome

function sendAwaitResponse(messageItem) {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: messageItem }, (response) => {
        resolve(response);
      });
    } catch (error) {
      console.warn(error);
      reject(error);
    }
  });
}

function createStyleSheet() {
  window.addEventListener("load", ()=>
    {styleSheetCreate()});
}

function startUp() {
  window.addEventListener("load", ()=> {
    runMain()
  });
}
