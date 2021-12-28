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
  
  const promiseReadJsonFile = (filename) => {
    return new Promise(async (resolve, reject) => {
      try {
        //@ts-ignore
        const cssObjectFile = browser.runtime.getURL(`/data/${filename}`);
        console.info(`Unpacking ${cssObjectFile}...`);
        fetch(cssObjectFile)
          .then((response) => response.json())
          .then((data) => {
            resolve(data);
          });
      } catch (e) {
        reject(`File ${filename} not loaded: ${e}`);
      }
    });
  };
  
  const promiseGetCssTemplate = () => {
    return new Promise(async (resolve, reject) => {
      try {
        //@ts-ignore
        const cssTemplateFile = browser.runtime.getURL("/data/cssTemplate.css");
        console.info(`Unpacking ${cssTemplateFile}...`);
        fetch(cssTemplateFile)
          .then((response) => response.text())
          .then((text) => {
            resolve(text);
          });
      } catch (e) {
        console.warn(`cssTemplate.css not loaded. ${e}`);
        reject(e);
      }
    });
  };