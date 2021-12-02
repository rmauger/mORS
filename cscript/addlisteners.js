(function listenToPopup() {
  //@ts-ignore
  chrome.runtime.onMessage.addListener((msg, _sender, _reponse) => {
    const msgText = msg.toMORS;
    try {
      console.log(`${msgText} received`)
      if (msgText["burnt"] != undefined) {
        doShowRSecs(msgText["burnt"]); //helper.js
      } else if (msgText["sn"] != undefined) {
        doShowSourceNotes(msgText["sn"]); //helper.js
      } else if (msgText=="css") {
        console.log('refresh stylesheet')
        styleSheetRefresh(); //stylesheet.js
      } else {
        console.warn("Error unidentified message received from popup.html");
      }
    } catch (e) {
      console.warn(`Error w/ display rSecs or sourceNotes: ${e}`);
    }
  });
})();

(function windowResizeEvent() {
  let resizedFinished;
  window.addEventListener("resize", () => {
    clearTimeout(resizedFinished);
    resizedFinished = setTimeout(resizeSectionDivs, 500); // waits 1/2 sec after resize ends to execute
  });
})();

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
    } catch (error) {
      console.warn(`Error in Resizing collapsed divs: ${error}`);
    }
}

(function createStyleSheet (){
  window.addEventListener("load", styleSheetCreate);
})()  