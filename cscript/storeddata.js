//storeddata.js
//@ts-check

const implementUserParameters = () => {
  async function getCollapsed() {
    try {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: "getCollapsed" }, (response) => {
        if (response.response) {
          collapseAllSections(); //collapsibles.js
        }
      });
    } catch (error) {
      console.warn(`Error in getCollapsed(): ${error}`);
    }
  }
  function getShowRSec() {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getShowBurnt" }, (response) => {
      const doShow = response.response;
      doShowRSecs(doShow); //helper.js
    });
  }
  function getShowSNs() {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getShowSNs" }, (response) => {
      const doShow = response.response;
      doShowSourceNotes(doShow); //helper.js
    });
  }
  // MAIN Implement User Parameters
  getCollapsed();
  getShowRSec();
  getShowSNs();
}
