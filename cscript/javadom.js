//javaDom.js
//@ts-check

function javaDOM() {
  expandAllSections(); // collapsibles.js
  /**
   * Adds button to each ORS section leadline toggling expand/collapse
   */
  const addSectionCollapseButtons = () => {
    const collapserButtons = document.getElementsByClassName("collapser");
    for (let i = 0; i < collapserButtons.length; i++) {
      const buttonElement = collapserButtons[i];
      buttonElement.addEventListener("click", () => {
        if (buttonElement.nextElementSibling.style.maxHeight == "none") {
          collapseSingle(buttonElement.nextElementSibling);
        } else {
          expandSingle(buttonElement.nextElementSibling);
        }
      });
    }
  };

  /** cycles through each internal ORS link adds button element to force target to expand on click */
  function buildOrsLinkButton() {
    let orsLinkList = document.getElementsByClassName("ors");
    for (let i = 0; i < orsLinkList.length; i++) {
      const aLink = orsLinkList[i];
      const buttonElement = document.getElementById(aLink.innerHTML);
      if (buttonElement) {
        if (buttonElement.nextElementSibling) {
          const collapsibleElement = buttonElement.nextElementSibling;
          if (collapsibleElement.classList.contains("collapsible")) {
            aLink.addEventListener("click", () => {
              infoCS(`scrolling to ${aLink.innerHTML}`, 'javaDom.js', 'buildORSLinkButton');
              expandSingle(collapsibleElement);
            });
          } else {
            warnCS(
              `target element of link to ${aLink.innerHTML}' has sibling that is not collapsible ${collapsibleElement.tagName}`,
              "javaDom.js",
              "buildOrsLinkButton()"
            );
          }
        } else {
          warnCS(
            `target element of link to ${aLink.innerHTML} lacks sibling to collapse`,
            "javaDom.js",
            "buildOrsLinkButton"
          );
        }
      } else
        warnCS(
          `target id# of link to ${aLink.innerHTML} does not exist`,
          "javaDom.js",
          "buildOrsLinkButton"
        );
    }
  }

  // add floating div menu with version info & buttons
  function buildFloatingMenuDiv() {
    function addMenuBody() {
      infoCS("creating menu", "javaDom.js", "buildFloatingMenuDiv");
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
    function addFullWidthButton() {
      let fullWidthButton = document.createElement("button");
      fullWidthButton.id = "fullWidth"
      fullWidthButton.innerHTML="Reading Mode";
      menuPanel.appendChild(fullWidthButton);
      fullWidthButton.addEventListener("click", toggleFullWidth);
    }
    // BuildFloatingMenuDiv MAIN
    let menuPanel = document.createElement("div");
    //@ts-ignore
    sendAwaitResponse("getShowMenu").then((response) => {
      if (response.response) {
        addMenuBody();
        addExpandAllButton();
        addCollapseAllButton();
        addFullWidthButton();
        document.body.appendChild(menuPanel);
      }
    });
  }
  // JavaDOM MAIN:

  addSectionCollapseButtons();
  buildOrsLinkButton();
  buildFloatingMenuDiv();
  // eliminate orphaned empty divs & paragraphs
  return new Promise((resolve) => resolve()); // clarifying that function has ran
}
