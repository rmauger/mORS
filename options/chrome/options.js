//options.js
//@ts-check

window.addEventListener("load", async () => {
  const exampleStyleSheetRefresh = () => {
    const root = /(:root {)[^}]+}/;
    try {
      //@ts-ignore
      chrome.runtime.sendMessage(
        { message: "generateCssString" },
        (response) => {
          const replacementSheet = response.response;
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
  const refreshOptionMenu = (
    /** @type {{ background: any; altBack: any; formBack: any; buttonColor: any; maintext: any; heading: any; linkExt: any; }} */ colors
  ) => {
    // @ts-ignore
    background.value = colors.background;
    // @ts-ignore
    altBack.value = colors.altBack;
    // @ts-ignore
    formBack.value = colors.formBack;
    // @ts-ignore
    buttonColor.value = colors.buttonColor;
    // @ts-ignore
    maintext.value = colors.maintext;
    // @ts-ignore
    heading.value = colors.heading;
    // @ts-ignore
    linkExt.value = colors.linkExt;
  };
  const addListeners = () => {
    const buttonHide = (/** @type {boolean} */ doHide) => {
      saveButton.style["visibility"]=(doHide && "hidden")||(!doHide && "visible")
      refreshButton.style["visibility"]=(doHide && "hidden")||(!doHide && "visible")
    }
    saveButton.addEventListener("click", () => {
      try {
        // @ts-ignore
        chrome.storage.sync.set(
          {
            userColors: {
              // @ts-ignore
              background: background.value,
              // @ts-ignore
              altBack: altBack.value,
              // @ts-ignore
              formBack: formBack.value,
              // @ts-ignore
              buttonColor: buttonColor.value,
              // @ts-ignore
              maintext: maintext.value,
              // @ts-ignore
              heading: heading.value,
              // @ts-ignore
              linkExt: linkExt.value,
            },
          //@ts-ignore
          }, chrome.storage.sync.set(
            {cssSelectorStored:"Custom"},
            async () => {
              exampleStyleSheetRefresh();
              try {
                //@ts-ignore
                chrome.runtime.sendMessage(
                  { message: "getOrsTabs" },
                  (response) => {
                    const orsTabs = response.response
                    console.log(orsTabs)
                    for (const aTab of orsTabs) {
                      //@ts-ignore
                      chrome.tabs.sendMessage(aTab.id, { toMORS: "css" });
                    }
                  }
                );
              } catch (e) {
                console.warn(e);
              }
              console.log("Successful save");
            }
          )
        )
      } catch (e) {
        console.warn(e);
      }
    });
    refreshButton.addEventListener("click", async () => {
      await refreshOrCancel()
      buttonHide(true)
    })
    const buildColorChangeListeners = (element) => {
      const updateCss = () => {
        console.log(`changing "${element.id}" to "${element.value}"`);
        const elementInCss = new RegExp(`(--${element.id}\\s?:\\s?)#[0-9a-f]{3,6}`)
        console.log(elementInCss)
        docStyle.innerHTML = docStyle.innerHTML.replace(
          elementInCss,
          `$1${element.value}`
        );
        buttonHide(false)
      };
      let delayAfterChange;
      element.addEventListener("input", () => {
        clearTimeout(delayAfterChange);
        delayAfterChange = setTimeout(updateCss, 200);
      });
    };
    buildColorChangeListeners(background);
    buildColorChangeListeners(altBack);
    buildColorChangeListeners(formBack);
    buildColorChangeListeners(buttonColor);
    buildColorChangeListeners(maintext);
    buildColorChangeListeners(heading);
    buildColorChangeListeners(linkExt); 
  };
  const refreshOrCancel = () => { 
    return new Promise ((resolve, reject)=>{
      try {
        //@ts-ignore
        chrome.runtime.sendMessage({ message: "getUserColors" }, (response) => {
          const customColors = response.response;
          refreshOptionMenu(customColors);
          exampleStyleSheetRefresh();
          resolve();
        })
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }
  const initializeCss = ()=> {
    return new Promise((resolve, reject) => {
      try {
      //@ts-ignore
        chrome.runtime.sendMessage({message:"getCssTemplateFile"}, (response)=> {
          docStyle.innerHTML = response.response
          resolve()
        })
      } catch (e) {
        console.warn(e)
        reject(e)
      }
    })
  }
  // MAIN variables
  const optionsFrame = window.frames["left"].document;
  const exampleFrame = window.frames["right"].document;
  const background = optionsFrame.getElementById("background");
  const altBack = optionsFrame.getElementById("altBack");
  const formBack = optionsFrame.getElementById("formBack");
  const buttonColor = optionsFrame.getElementById("buttonColor");
  const maintext = optionsFrame.getElementById("maintext");
  const heading = optionsFrame.getElementById("heading");
  const linkExt = optionsFrame.getElementById("linkExt");
  const docStyle = exampleFrame.head.getElementsByTagName("style")[0];
  const saveButton = optionsFrame.getElementById("save");
  const refreshButton = optionsFrame.getElementById("refresh");
  // MAIN program  
  await initializeCss()
  await refreshOrCancel()
  addListeners();
});
