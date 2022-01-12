//@javadom.js
//FIREFOX=CHROME
//@ts-check

function javaDOM() {
  // Adds button to each ORS section leadline toggling expand/collapse
  function addSectionCollapseButtons() {
    const collapsibles = document.getElementsByClassName("collapsible");
    for (let i = 0; i < collapsibles.length; i++) {
      const buttonElement = collapsibles[i];
      buttonElement.parentElement.style.maxHeight = "none";
      buttonElement.classList.add("expanded");
      buttonElement.addEventListener("click", () => {
        if (buttonElement.parentElement.style.maxHeight == "none") {
          collapseSingle(findCollapseHeight(buttonElement));
        } else {
          expandSingle(buttonElement);
        }
      });
    }
  }
  //adds button element to internal ORS links to force expansion of target on selection
  function buildOrsLinkButton() {
    let orsLinkList = document.getElementsByClassName("ors");
    for (let i = 0; i < orsLinkList.length; i++) {
      const aLink = orsLinkList[i];
      const buttonElement = document.getElementById(aLink.innerHTML);
      if (buttonElement) {
        // dealing with issues caused if there is a reference to ORS section that does not exist
        if (buttonElement.classList.contains("collapsible")) {
          // dealing with reference to ORS section that is burnt
          aLink.addEventListener("click", () => {
            expandSingle(buttonElement);
          });
        }
      }
    }
  }
  // add floating div menu with version info & buttons
  function buildFloatingMenuDiv() {
    function addMenuBody() {
      infoCS('creating menu', 'javadom.js', 'buildFloatingMenuDiv')
      menuPanel.classList.add("fixed");
      let versionPar = document.createElement("p");
      //@ts-ignore
      let manifest = browser.runtime.getManifest();
      let thisVersion = manifest.version;
      versionPar.classList.add("version");
      versionPar.innerHTML = `style markup by <a href="https://github.com/rmauger/mORS/#readme">mORS<\/a> v.${thisVersion}`;
      menuPanel.appendChild(versionPar);
    }
    function addExpandAllButton() {
      let expandAllButton = document.createElement("button");
      expandAllButton.innerText = "Expand all";
      expandAllButton.id = "buttonExpand";
      menuPanel.appendChild(expandAllButton);
      expandAllButton.addEventListener("click", () => expandAllSections());
    }
    function addCollapseAllButton() {
      let collapseAllButton = document.createElement("button");
      collapseAllButton.innerText = "Collapse all";
      collapseAllButton.id = "buttonCollapse";
      menuPanel.appendChild(collapseAllButton);
      collapseAllButton.addEventListener("click", () => collapseAllSections());
    }
    // BuildFloatingMenuDiv MAIN
    let menuPanel = document.createElement("div");
    //@ts-ignore
    sendAwaitResponse("getShowMenu"
    ).then ((response) => {
      if (response.response) {
        addMenuBody();
        addExpandAllButton();
        addCollapseAllButton();
        document.body.appendChild(menuPanel);
      }
    });
  }
  // JavaDOM MAIN:
  addSectionCollapseButtons();
  buildOrsLinkButton();
  buildFloatingMenuDiv();
  return(new Promise(resolve => resolve())) // clarifying that function has ran
}