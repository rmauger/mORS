//options.js
//@ts-check

const mainLoop = async () => {
  const exampleStyleSheetRefresh = () => {
    const root = /(:root {)[^}]+}/;
    try {
      //@ts-ignore
      chrome.runtime.sendMessage(
        { message: "generateCssString" },
        (response) => {
          const replacementSheet = response.response;
          console.groupCollapsed("retrieved from background:");
          console.log(replacementSheet);
          console.groupEnd();
          let tempStyleSheet = docStyle.innerText.replace(
            root,
            `$1${replacementSheet}}`
          );
          tempStyleSheet = tempStyleSheet.replace(/<br>/, "/n");
          docStyle.innerHTML = tempStyleSheet;
        }
      );
    } catch (e) {
      console.warn(`Error applying stylesheet ${e}.`);
    }
  };
  const refreshOptionMenu =
    // if stored custom cssElement exists in sync stored data, adds it toinput buttons on page load or reset
    (colors) => {
      cssElementArray.forEach((cssElement) => {
        if (colors[cssElement]) {
          optionsFrame.getElementById(cssElement).value = colors[cssElement];
        }
      });
    };
  const addListeners = () => {
    const buttonHide = (/** @type {boolean} */ doHide) => {
      saveButton.style["visibility"] = (doHide && "hidden") || "visible";
      refreshButton.style["visibility"] = (doHide && "hidden") || "visible";
    };
    saveButton.addEventListener("click", () => {
      try {
        // @ts-ignore
        let userColors = {};
        cssElementArray.forEach((cssElement) => {
          if (optionsFrame.getElementById(cssElement)) {
            if (optionsFrame.getElementById(cssElement).value) {
              userColors[cssElement] =
                optionsFrame.getElementById(cssElement).value;
            }
          }
        });
        console.log({ userColors });
        //@ts-ignore (chrome)
        chrome.storage.sync.set(
          { userColors },
          //@ts-ignore (chrome) - next line is callback (async)
          chrome.storage.sync.set(
            { cssSelectorStored: "Custom" },
            // next line is 2nd nested call back
            async () => {
              exampleStyleSheetRefresh();
              try {
                //@ts-ignore (chrome)
                chrome.runtime.sendMessage(
                  { message: "getOrsTabs" },
                  (response) => {
                    const orsTabs = response.response;
                    for (const aTab of orsTabs) {
                      //@ts-ignore
                      chrome.tabs.sendMessage(aTab.id, { toMORS: "css" });
                    }
                  }
                );
              } catch (e) {
                console.warn(e);
              }
              console.info("Successful save");
            }
          )
        );
      } catch (e) {
        console.warn(e);
      }
    });
    refreshButton.addEventListener("click", async () => {
      await refreshOrCancel();
      buttonHide(true);
    });
    const buildColorChangeListeners = (element) => {
      const updateCss = () => {
        console.log(`changing "${element.id}" to "${element.value}"`);
        const elementInCss = new RegExp(
          `(--${element.id}\\s?:\\s?)#[0-9a-f]{3,6}`
        );
        console.log(elementInCss);
        docStyle.innerHTML = docStyle.innerHTML.replace(
          elementInCss,
          `$1${element.value}`
        );
        buttonHide(false);
      };
      let delayAfterChange;
      try {
        element.addEventListener("input", () => {
          clearTimeout(delayAfterChange);
          delayAfterChange = setTimeout(updateCss, 200);
        });
      } catch (e) {
        console.log(element);
        console.warn(e);
      }
    };
    cssElementArray.forEach((cssElement) => {
      if (optionsFrame.getElementById(cssElement)) {
        buildColorChangeListeners(optionsFrame.getElementById(cssElement));
      } else {
        console.log(cssElement);
      }
    });
  };
  const refreshOrCancel = () => {
    return new Promise((resolve, reject) => {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage({ message: "getUserColors" }, (response) => {
          const customColors = response.response;
          console.log(customColors);
          if (customColors) {
            refreshOptionMenu(customColors);
          }
          exampleStyleSheetRefresh();
          resolve();
        });
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  };
  const initializeCss = () => {
    return new Promise((resolve, reject) => {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage(
          { message: "getCssTemplateFile" },
          (response) => {
            docStyle.innerHTML = response.response;
            resolve();
          }
        );
      } catch (e) {
        console.warn(e);
        reject(e);
      }
    });
  };
  // MAIN variables
  const optionsFrame = window.frames["left"].document;
  const exampleFrame = window.frames["right"].document;
  const docStyle = exampleFrame.head.getElementsByTagName("style")[0];
  const saveButton = optionsFrame.getElementById("save");
  const refreshButton = optionsFrame.getElementById("refresh");
  const cssElementArray = [
    "background",
    "altBack",
    "formBack",
    "buttonColor",
    "buttonHover",
    "maintext",
    "heading",
    "subheading",
    "sourceNote",
    "linkInt",
    "linkExt",
    "linkVisited",
  ];
  // MAIN program
  await initializeCss();
  await refreshOrCancel();
  addListeners();
};

window.addEventListener("load", () => {
  //@ts-ignore
  chrome.storage.sync.set({ cssSelectorStored: "Custom" }, mainLoop());
});
