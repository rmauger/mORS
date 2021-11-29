//storeddata.js
//@ts-check

const implementStoredParameters = () => {
  async function getCollapsed() {
    try {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: "getCollapsed" }, (response) => {
        if (response.response) {
          collapseAllSections();
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
      doShowRSecs(doShow);
    });
  }
  function getShowSNs() {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getShowSNs" }, (response) => {
      const doShow = response.response;
      doShowSourceNotes(doShow);
    });
  }
  // MAIN Implement Stored Parameters
  getCollapsed();
  getShowRSec();
  getShowSNs();
}
