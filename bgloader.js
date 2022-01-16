//bgloader.js
//@ts-check

//@ts-ignore (duplicated in popup & content script & maybe options)
const browser = chrome;
const scriptList = [
  "/background/helperbg.js",
  "/background/helpchromebg.js",
  "/background/storage.js",
  "/background/webresources.js",
  "/background/querytabs.js",
  "/background/orlaws.js",
  "/background/styles.js",
  "/background/omnibox.js",
  "/background/msgreceived.js",
];
console.groupCollapsed("Background Scripts Loading [>status]...");
for (let i = 0; i < scriptList.length; i++) {
  const aScript = scriptList[i];
  try {
    importScripts(aScript);
    infoLog(`'${aScript}' successfully loaded.`);
  } catch (e) {
    warnCS(`'${aScript}' loading error: ${e}`);
  }
}
console.groupEnd();