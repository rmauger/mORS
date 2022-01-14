//background/style.js
// @ts-check

const promiseGenerateCss = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let cssOptions;  // function to retrieve CSS, either from sync.storage or from css.json file
        const userCss = await promiseGetFromStorage("cssSelectorStored");
        infoLog(
          `Loading ${userCss} stylesheet`,
          'style.js',
          'promiseGenerateCss');
        if (userCss == "Custom") {
          cssOptions = await promiseGetFromStorage("userColors"); // get css from sync
        } else {
          cssOptions = (await promiseReadJsonFile("cssObject.json"))[userCss]; // get css from json
        }
        resolve(`   /* background*/
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
    --highContrast: ${cssOptions["highContrast"]};`);
      } catch (e) {
        warnLog(e, 'styles.js', 'promiseGenerateCss');
        reject(e);
      }
    });
  };
  