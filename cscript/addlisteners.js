//cscript/addlisteners.js
//FIREFOX=CHROME
//@ts-check

/**Receives information sent from popup.js - no response given */
const listenToPopup = () => {
  //@ts-ignore
  browser.runtime.onMessage.addListener((msg, _sender, _reponse) => {
    const msgText = msg.toMORS;
    try {
      infoCS(
        `Received query from popup on ${Object.keys(msgText)}`,
        'addlisteners.js',
        'listenToPopup'
      );
      if (msgText["burnt"] != undefined) {
        doShowRSecs(msgText["burnt"]);   //helper.js
      } else if (msgText["sn"] != undefined) {
        doShowSourceNotes(msgText["sn"]);   //helper.js
      } else if (msgText == "css") {
        infoCS(
          "Refreshing Stylesheet",
          "addlisteners.js",
          "listenToPopUp"
          );
        styleSheetRefresh(); //stylesheet.js
      } else {
        warnCS(`Error unidentified message from popup.html: ${msgText}`, "addlisteners.js");
      }
    } catch (e) {
      warnCS(`Error w/ display rSecs or sourceNotes: ${e}`, "addlisteners.js");
    }
  });
}

//MAIN ADD LISTENERS (button listeners in javadom.js):
createStyleSheet() // on helpchrome.js or helperfox.js
listenToPopup();
