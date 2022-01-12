//cscript/addlisteners.js
//FIREFOX=CHROME
//@ts-check

function listenToPopup() {
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

function windowResizeEvent() {
  const resizeSectionDivs = () => {
    try {
      //@ts-ignore
      const sectionList = document.body.getElementsByClassName("section");
      let maxHeightList = [];
      for (let i = 0; i < sectionList.length; i++) {
        const aSection = sectionList[i];
        //@ts-ignore
        if (aSection.style.maxHeight != "none") {
          maxHeightList.push(`${aSection.firstElementChild.scrollHeight}px`);
          //@ts-ignore
        } else maxHeightList.push("none");
      }
      for (let j = sectionList.length - 1; j >= 0; j--) {
        //@ts-ignore
        sectionList[j].style.maxHeight = maxHeightList[j];
      }
      infoCS(
        "Resized section title boxes",
        'addlisteners.js',
        "resizedFinished");
    } catch (error) {
      warnCS(`Error in Resizing collapsed divs: ${error}`, "addlisteners.js");
    }
  };

 let resizedFinished;
  window.addEventListener("resize", () => {
    clearTimeout(resizedFinished);
    resizedFinished = setTimeout(resizeSectionDivs, 500); // waits 1/2 sec after resize ends to execute
  });
}

//MAIN ADD LISTENERS:
windowResizeEvent();
createStyleSheet() // on helperchrome.js or helperfox.js
listenToPopup();
