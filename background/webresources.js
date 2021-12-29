//@ts-check

const promiseReadJsonFile = (filename) => {
  return new Promise((resolve, reject) => {
    const cssObjectFile = browser.runtime.getURL(`/data/${filename}`);
    console.info(`Unpacking ${cssObjectFile}...`);
    fetch(cssObjectFile)
      .then((fetchResponse) => fetchResponse.json())
      .then((data) => resolve(data))
      .catch((e) => {
        reject(`File ${filename} not loaded: ${e}`);
      });
  });
};

const promiseGetCssTemplate = () => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    const cssTemplateFile = browser.runtime.getURL("/data/cssTemplate.css");
    console.info(`Unpacking ${cssTemplateFile}...`);
    fetch(cssTemplateFile)
      .then((response) => response.text())
      .then((text) => resolve(text))
      .catch((e) => {
        console.warn(`cssTemplate.css not loaded. ${e}`);
        reject(e);
      });
  });
};
