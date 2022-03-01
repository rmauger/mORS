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
        warnCS(
          `Error in getCollapsed(): ${e}`,
          "storeddata.js",
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
        "storeddata.js",
        "getShowBurnt"
      );
      doShowRSecs(doShow); //helper.js
    });
  }
  function getShowSNs() {
    //@ts-ignore
    sendAwaitResponse("getShowSNs").then((response) => {
      const doShow = response.response;
      infoCS(`showing sourcenotes=${doShow}`, "storeddata.js", "getShowSNs");
      doShowSourceNotes(doShow); //helper.js
    });
  }
  function getFullWidth() {
    sendAwaitResponse("getFullWidth").then((response)=>{
      const fullWidth = response.response;
      infoCS(`Full Width=${fullWidth}`, "storeddata.js", "getFullWidth")
      if (fullWidth) toggleFullWidth() //helper.js
    })
  }
  // MAIN Implement User Parameters
  getCollapsed();
  getShowRSec();
  getShowSNs();
  getFullWidth();
};
