//background/style.js
// @ts-check

"use strict";

const promiseGenerateCss = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let cssOptions;
        const userCss = await promiseGetFromStorage("cssSelectorStored");
        console.info(`Loading ${userCss} stylesheet...`);
        if (userCss == "Custom") {
          cssOptions = await promiseGetFromStorage("userColors");
        } else {
          cssOptions = (await promiseReadJsonFile("cssObject.json"))[userCss];
        }
        resolve(
  `        /* background*/
    --background: ${cssOptions["background"]};
    --altBack: ${cssOptions["altBack"]};
    --formBack: ${cssOptions["formBack"]};
    --buttonColor: ${cssOptions["buttonColor"]};
    --buttonHover: ${cssOptions["buttonHover"]};
          /* foreground */
    --maintext: ${cssOptions["maintext"]};
    --heading: ${cssOptions["heading"]};
    --subheading: ${cssOptions["subheading"]};
    --sourceNote: ${cssOptions["sourceNote"]};
    --linkExt: ${cssOptions["linkExt"]};
    --linkInt: ${cssOptions["linkInt"]};
    --linkVisited: ${cssOptions["linkVisited"]};
    --highContrast: ${cssOptions["highContrast"]};`
        );
      } catch (e) {
        console.warn(e);
        reject(e);
      }
    });
  };
    
