//stylesheet.js
//@ts-check

const styleSheetCreate = () => {
  //@ts-ignore
  chrome.runtime.sendMessage(
    { message: "getCssTemplateFile" },
    (/** @type {{ response: string; }} */ response) => {
      document.head.getElementsByTagName("style")[0].innerHTML =
        response.response;
      styleSheetRefresh();
    }
  );
};

const styleSheetRefresh = () => {
  const htmlStyleSheet = document.head.getElementsByTagName("style")[0];
  const root = /(:root {)[^}]+}/;
  try {
    //@ts-ignore
    chrome.runtime.sendMessage({message: "generateCssString"}, (response)=>{
      const replacementSheet = response.response;
      let tempStyleSheet = htmlStyleSheet.innerText.replace(
        root,
        `$1${replacementSheet}}`
      );
      tempStyleSheet = tempStyleSheet.replace(/<br>/, "/n");
      htmlStyleSheet.innerHTML = tempStyleSheet;
    })
  } catch (e) {
    console.warn(`Error applying stylesheet ${e}.`);
  }
};

// /**
//  * @param {string} cssSelection
//  */
// const colorTemplate = (cssSelection) =>
//   new Promise((resolve, reject) => {
//     try {
//       //@ts-ignore
//       chrome.runtime.sendMessage(
//         { message: "getCssObject" },
//         async (response) => {
//           let cssOptions = {};
//           if (cssSelection == "Custom") {
//             cssOptions = await promiseGetCustomUserColors();
//           } else {
//             cssOptions = response.response[cssSelection];
//           }
//           console.log(cssOptions);
//           resolve(`/* background*/
//         --background: ${cssOptions["background"]};
//         --altBack: ${cssOptions["altBack"]};
//         --formBack: ${cssOptions["formBack"]};
//         --buttonColor: ${cssOptions["buttonColor"]};
//         --buttonHover: ${cssOptions["buttonHover"]};
//       /* foreground */
//         --maintext: ${cssOptions["maintext"]};
//         --heading: ${cssOptions["heading"]};
//         --subheading: ${cssOptions["subheading"]};
//         --sourceNote: ${cssOptions["sourceNote"]};
//         --linkExt: ${cssOptions["linkExt"]};
//         --linkInt: ${cssOptions["linkInt"]};
//         --linkVisited: ${cssOptions["linkVisited"]};
//         --highContrast: ${cssOptions["highContrast"]};`);
//         }
//       );
//     } catch (e) {
//       reject(`could not retrieve css stylesheet. ${e}`);
//     }
//   });

// const promiseGetCustomUserColors = () =>
//   new Promise((resolve, reject) => {
//     try {
//       //@ts-ignore
//       chrome.storage.sync.get("userColors", (userColors) => {
//         console.log(userColors.userColors);
//         resolve(userColors.userColors);
//       });
//     } catch (e) {
//       reject(e);
//     }
//   });
