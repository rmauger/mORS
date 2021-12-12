//storeddata.js
//FIREFOX = CHROME
//@ts-check

const implementUserParameters = () => {
  function getCollapsed() {
    sendAwaitResponse("getCollapsed").then(
      (response) => {
        if (response.response) {
          collapseAllSections(); //collapsibles.js
        }
      },
      (e) => {
        console.warn(`Error in getCollapsed(): ${e}`);
      }
    );
  }
  function getShowRSec() {
    sendAwaitResponse("getShowBurnt").then((response) => {
      const doShow = response.response;
      doShowRSecs(doShow); //helper.js
    });
  }
  function getShowSNs() {
    //@ts-ignore
    sendAwaitResponse("getShowSNs").then((response) => {
      const doShow = response.response;
      doShowSourceNotes(doShow); //helper.js
    });
  }
  // MAIN Implement User Parameters
  getCollapsed();
  getShowRSec();
  getShowSNs();
};
