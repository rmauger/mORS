//bgloader.js
//@ts-check

"use strict";

function getBrowser() {
  return new Promise((resolve) => {
    try {
      //@ts-ignore
      let manifest = chrome.runtime.getManifest();
      if (manifest.manifest_version == "3") {
        //@ts-ignore
        resolve("chrome");
      } else {
        //@ts-ignore
        resolve("browser");
      }
    } catch (error) {
      //@ts-ignore
      resolve("browser");
    }
  });
}

const scriptListChrome = [
  "/background/helpchromebg.js",
  "/background/storage.js",
  "/background/webresources.js",
  "/background/querytabs.js",
  "/background/orlaws.js",
  "/background/styles.js",
  "/background/omnibox.js",
  "/background/msgreceived.js",
];

const scriptListFireFox = [
  "/background/helpfirefoxbg.js",
  "/background/storagefox.js",
  "/background/webresources.js",
  "/background/querytabs.js",
  "/background/orlaws.js",
  "/background/styles.js",
  "/background/omnibox.js",
  "/background/omnifox.js",
  "/background/msgreceived.js",
];
let browser
function loadScripts() {
  getBrowser().then((resolve) => {
    let scriptList;
    if (resolve == "chrome") {
      //@ts-ignore
      browser=chrome
      scriptList = scriptListChrome;
    } else {
      scriptList = scriptListFireFox;
    }
    for (let i = 0; i < scriptList.length; i++) {
      const aScript = scriptList[i];
      try {
        importScripts(aScript);
        console.info(`${aScript} successfully loaded.`)
      } catch (e) {
        console.warn(`${aScript} err: ${e}`);
      }
    }
  });
}
loadScripts()