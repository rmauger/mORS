//options.js
//@ts-check

const optionsScript = async () => {
  const refreshOptionMenu = (
    /** @type {{ background: any; altBack: any; formBack: any; buttonColor: any; maintext: any; heading: any; linkExt: any; }} */ colors
  ) => {
    try {
    background.value = colors.background;
    altBack.value = colors.altBack;
    formBack.value = colors.formBack;
    buttonColor.value = colors.buttonColor;
    maintext.value = colors.maintext;
    heading.value = colors.heading;
    linkExt.value = colors.linkExt;
  } catch (e) {
    console.warn(e)   
  }
  };
  const addListeners = () => {
    const buttonHide = (/** @type {boolean} */ doHide) => {
      saveButton.style["visibility"]=(doHide && "hidden")||(!doHide && "visible")
      refreshButton.style["visibility"]=(doHide && "hidden")||(!doHide && "visible")
    }
    saveButton.addEventListener("click", () => {
      // @ts-ignore
      browser.storage.sync.set(
        {
          userColors: {
            background: background.value,
            altBack: altBack.value,
            formBack: formBack.value,
            buttonColor: buttonColor.value,
            maintext: maintext.value,
            heading: heading.value,
            linkExt: linkExt.value,
          },
        }
        
      ).then(
        //@ts-ignore
        browser.storage.sync.set(
          {cssSelectorStored:"Custom"}
        )
      ).then (() => {
        //@ts-ignore
        browser.runtime.sendMessage({ message: "getOrsTabs" }
        ).then(
          (response) => {
            const orsTabs = response.response
            console.info(orsTabs)
            for (const aTab of orsTabs) {
              //@ts-ignore
              browser.tabs.sendMessage(aTab.id, { toMORS: "css" }
              ).then(
                console.info("Successful save")
              );
            }
          }
        ).catch (
          (e) => {
            console.warn(e);
          }    
        )
      }).catch (
        (e) => {
          console.warn(e);
        }
      )
    });
    refreshButton.addEventListener("click", async () => {
      await refreshOrCancel()
      buttonHide(true)
    })
    const buildColorChangeListeners = (element) => {
      const updateCss = () => {
        console.info(`changing "${element.id}" to "${element.value}"`);
/*        const elementInCss = new RegExp(`(--${element.id}\\s?:\\s?)#[0-9a-f]{3,6}`)
        console.info(elementInCss)
         docStyle.innerHTML = docStyle.innerHTML.replace(
          elementInCss,
          `$1${element.value}`
        ); */
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
      browser.runtime.sendMessage({ message: "getUserColors" }
      ).then( 
        (response) => {
          const customColors = response.response;
          refreshOptionMenu(customColors);
          resolve();
        }
      ).catch (
        (e) => {
          console.warn(e);
          reject(e)
        }
      )
      } catch {
        console.warn('No colors stored')
      }
    })
  }
  // MAIN variables
  const optionsFrame = window.document;
  const background = <HTMLInputElement>optionsFrame.getElementById("background")</HTMLInputElement>;
  const altBack = <HTMLInputElement>optionsFrame.getElementById("altBack")</HTMLInputElement>;
  const formBack = <HTMLInputElement>optionsFrame.getElementById("formBack")</HTMLInputElement>;
  const buttonColor = <HTMLInputElement>optionsFrame.getElementById("buttonColor")</HTMLInputElement>;
  const maintext = <HTMLInputElement>optionsFrame.getElementById("maintext")</HTMLInputElement>;
  const heading = <HTMLInputElement>optionsFrame.getElementById("heading")</HTMLInputElement>;
  const linkExt = <HTMLInputElement>optionsFrame.getElementById("linkExt")</HTMLInputElement>;
  const saveButton = <HTMLInputElement>optionsFrame.getElementById("save")</HTMLInputElement>;
  const refreshButton = <HTMLInputElement>optionsFrame.getElementById("refresh")</HTMLInputElement>;
  // MAIN program  
  await refreshOrCancel()
  addListeners();
};

optionsScript()
//@ts-ignore
/*const exampleHtml = browser.runtime.getURL(`/data/example.html}`)
const halfW = Math.floor(screen.width/2)
const myExternalWindow = window.open(exampleHtml, "",
  `width=${halfW}, height=${screen.height}, left=${halfW}, top=0`) */