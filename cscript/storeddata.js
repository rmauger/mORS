//storedData.js
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
        warnCS(
          `Error in getCollapsed(): ${e}`,
          "storedData.js",
          "implementUserParameters"
        );
      }
    );
  }
  function getShowRSec() {
    sendAwaitResponse("getShowBurnt").then((response) => {
      const doShow = response.response;
      infoCS(
        `showing repealed sections=${doShow}`,
        "storedData.js",
        "getShowBurnt"
      );
      doShowRSecs(doShow); //helper.js
    });
  }
  function getShowSNs() {
    //@ts-ignore
    sendAwaitResponse("getShowSNs").then((response) => {
      const doShow = response.response;
      infoCS(`showing sourceNotes=${doShow}`, "storedData.js", "getShowSNs");
      doShowSourceNotes(doShow); //helper.js
    });
  }
  function getFullWidth() {
    sendAwaitResponse("getFullWidth").then((response)=>{
      const fullWidth = response.response;
      infoCS(`Full Width=${fullWidth}`, "storedData.js", "getFullWidth")
      toggleFullWidth() // helper.js - run at least once to get data into variable
      if (fullWidth) toggleFullWidth() // helper.js - ran a second time if actually defaulting to full width
    })
  }
  // MAIN Implement User Parameters
  getCollapsed();
  getShowRSec();
  getShowSNs();
  getFullWidth();
};
