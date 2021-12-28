const scriptList=[
    "/background/bg-helper.js",
    "/background/console.js",
    "/background/installer.js",
    "/background/storage.js",
    "/background/querytabs.js",
    "/background/orlaws.js",
    "/background/styles.js",
    "/background/omnibox.js",
    "/background/msgreceived.js",
]

for (let i = 0; i < scriptList.length; i++) {
    const aScript = scriptList[i];
    try {
        importScripts(aScript);
      } catch (e) {
        console.log(`${aScript} err: ${e}`);
      }
}
