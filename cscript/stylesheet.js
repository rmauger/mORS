//stylesheet.js
//CHROME = FIREFOX
//@ts-check

const htmlStyleSheet = document.head.getElementsByTagName("style")[0];

//ran first time sheet is loaded
const styleSheetCreate = () => {
  //@ts-ignore
  sendAwaitResponse("getCssTemplateFile").then (
    response => {
      htmlStyleSheet.innerHTML =
        response.response;
      styleSheetRefresh();
    }
  );
};

//ran if message to update stylesheet is sent from popup.js
const styleSheetRefresh = () => {
  const root = /(:root {)[^}]+}/;
  //@ts-ignore
  sendAwaitResponse("generateCssString").then(
    (response) => {
      const replacementSheet = response.response;
      let tempStyleSheet = htmlStyleSheet.innerText.replace(
        root,
        `$1${replacementSheet}}`
      );
      tempStyleSheet = tempStyleSheet.replace(/<br>/, "/n");
      htmlStyleSheet.innerHTML = tempStyleSheet;
    }
  ).catch(
    (e) => {
      warnCS(`Error applying stylesheet ${e}.`, "stylesheet.js", 'styleSheetRefresh');
    }
  )
}