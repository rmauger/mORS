//@ts-check

const promiseReadJsonFile = (filename) => {
  return new Promise((resolve, reject) => {
    const jsonFile = browser.runtime.getURL(`/data/${filename}`);
    infoLog(
      `Unpacking JSON: ${jsonFile}`,
      "webresources.js",
      "promiseReadJsonFile"
    );
    fetch(jsonFile)
      .then((fetchResponse) => fetchResponse.json())
      .then((data) => {
        resolve(data);
      })
      .catch((e) => {
        reject(`File ${filename} not loaded: ${e}`);
      });
  });
};

const promiseGetCssTemplate = () => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    const cssTemplateFile = browser.runtime.getURL("/data/cssTemplate.css");
    infoLog(
      `Unpacking CSS: ${cssTemplateFile}`,
      "webresources.js",
      "promiseGetCssTemplate"
    );
    fetch(cssTemplateFile)
      .then((response) => response.text())
      .then((text) => resolve(text))
      .catch((e) => {
        warnLog(
          `cssTemplate.css not loaded. ${e}`,
          "webresources.js",
          "promiseGetCssTemplate"
        );
        reject(e);
      });
  });
};
