//backgroung.storagefox.js
//@ts-check

/**
 * @param {string} objKey
 */
function promiseGetFromStorage(objKey) {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    browser.storage.sync.get(objKey)
      .then((storedObj) => {
        if (storedObj) {
          infoLog(
            `Fetched ${objKey} : ${storedObj[objKey]}`,
            'storagefox.js',
            'promiseGetFromStorage (firefox)'
          );
          resolve(storedObj[objKey]);
        } else {
          warnLog("Unable to retrieve stored user preference");
          reject("Unable to retrieve stored user preference");
        }
      })
      .catch((e) => {
        warnLog(`Error: ${e}`, "Storage Retrieval");
        reject(`Storage retrieval error. Error: ${e}`);
      });
  });
}
