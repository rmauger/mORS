//stylesheet.js
//CHROME = FIREFOX
//@ts-check

const styleSheetCreate = () => {
  //@ts-ignore
  sendAwaitResponse("getCssTemplateFile").then (
    response => {
      document.head.getElementsByTagName("style")[0].innerHTML =
        response.response;
      styleSheetRefresh();
    }
  );
};

const styleSheetRefresh = () => {
  const htmlStyleSheet = document.head.getElementsByTagName("style")[0];
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
      console.warn(`Error applying stylesheet ${e}.`);
    }
  )
}