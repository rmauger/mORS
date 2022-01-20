//background/storage.js
//@ts-check

/**
 * @param {string} objKey
 */
function promiseGetFromStorage(objKey) {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      browser.storage.sync.get(objKey, (storedObj) => {
        if (storedObj) {
          infoLog(`${objKey} => ${storedObj[objKey]}`,
           'storage.js',
           'promiseGetFromStorage'
          );
          resolve(storedObj[objKey]);
        } else {
          warnLog("Unable to retrieve stored user preference");
          reject("Unable to retrieve stored user preference");
        }
      });
    } catch (e) {
      warnLog(`Error: ${e}`, "Storage Retrieval");
      reject(`Storage retrieval error. Error: ${e}`);
    }
  });
}
