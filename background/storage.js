//background/storage.js
//@ts-check

/**
 * @param {string} objKey
 */
 function promiseGetFromStorage(objKey) {
    return new Promise((resolve, reject) => {
      try {
        //@ts-ignore
        chrome.storage.sync.get(objKey, (storedObj) => {
          if (storedObj) {
            console.info(
              `background.js/PromiseGetChromeStorage : Retrieved from ${objKey} : ${storedObj[objKey]}`
            );
            resolve(storedObj[objKey]);
          } else {
            logOrWarn("Unable to retrieve stored user preference");
            reject("Unable to retrieve stored user preference");
          }
        });
      } catch (e) {
        logOrWarn(`Error: ${e}`, "Storage Retrieval");
        reject(`Storage retrieval error. Error: ${e}`);
      }
    });
  }