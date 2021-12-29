/**
 * @param {string} objKey
 */
 function promiseGetFromStorage(objKey) {
    return new Promise((resolve, reject) => {
      //@ts-ignore
      browser.storage.sync.get(objKey
        ).then(
          (storedObj) => {
            if (storedObj) {
              console.info(
                `background.js/PromiseGetFromStorage : Retrieved from ${objKey} : ${storedObj[objKey]}`
              );
              resolve(storedObj[objKey]);
            } else {
              logOrWarn("Unable to retrieve stored user preference");
              reject("Unable to retrieve stored user preference");
            }
          }
        ).catch(
          (e) => {
            logOrWarn(`Error: ${e}`, "Storage Retrieval");
            reject(`Storage retrieval error. Error: ${e}`);
          }
        );
    });
  }
  