//bgloader.js
//@ts-check

const infoLog = (infoTxt, script, calledBy, color) => {
  if (color==undefined) color = "green"
  if (calledBy==undefined) calledBy = ""
  if (script==undefined) script = "bgloader.js"
  console.info(`%c${script}%c:${calledBy} ${infoTxt}`, `color:${color}`, "color:default")
}

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

//@ts-ignore (duplicated in popup & content script & maybe options)
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
    console.groupCollapsed("Background Scripts Loading [>status]...")
    for (let i = 0; i < scriptList.length; i++) {
      const aScript = scriptList[i];
      try {
        importScripts(aScript);
        infoLog(`$'{aScript}' successfully loaded.`)
      } catch (e) {
        console.warn(`$'{aScript}' loading error: ${e}`);
      }
    }
    console.groupEnd()
  });
}
loadScripts()