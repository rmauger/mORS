//stylesheet.js
//@ts-check

const styleSheetCreate = () => {
  document.head.getElementsByTagName("style")[0].innerHTML = styleSheetTemplate;
  styleSheetRefresh();
};

const styleSheetRefresh = () => {
  try {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getCssSelector" }, (css) => {
      const root = /(:root {)[^}]+}/
      const replacementSheet = colorTemplate(css.response);
      console.info(`replacing current stylesheet with '${css.response}' sheet`);
      const htmlStyleSheet = document.head.getElementsByTagName("style")[0];
      let tempStyleSheet = htmlStyleSheet.innerText.replace(
        root,
        `$1${replacementSheet}}`
      );
      tempStyleSheet = tempStyleSheet.replace(/<br>/, "/n");
      htmlStyleSheet.innerHTML = tempStyleSheet;
    });
  } catch (e) {
    console.warn(`Error applying stylesheet ${e}.`);
  }
};

/**
 * @param {string} css
 */
function colorTemplate(css) {
  if (css="Custom")
  return `
  /* background*/
  --background: ${cssLookup[css]["background"]};
  --altBack: ${cssLookup[css]["altBack"]};
  --formBack: ${cssLookup[css]["formBack"]};
  --buttonColor: ${cssLookup[css]["buttonColor"]};
  --buttonHover: ${cssLookup[css]["buttonHover"]};
/* foreground */
  --maintext: ${cssLookup[css]["maintext"]};
  --heading: ${cssLookup[css]["heading"]};
  --subheading: ${cssLookup[css]["subheading"]};
  --sourceNote: ${cssLookup[css]["sourceNote"]};
  --linkExt: ${cssLookup[css]["linkExt"]};
  --linkInt: ${cssLookup[css]["linkInt"]};
  --linkVisited: ${cssLookup[css]["linkVisited"]};
  --highContrast: ${cssLookup[css]["highContrast"]};`;
}

let cssLookup
//@ts-ignore
chrome.runtime.sendMessage({ message: "getCssObject" }, (css) => {
  cssLookup = (css.response)
  console.log (cssLookup)
  console.log(typeof cssLookup)
})

/* const cssLookup = {
  Dark: {
    background: "#221",
    altBack: "#432",
    formBack: "#765",
    buttonColor: "#654",
    buttonHover: "#876",
    maintext: "#eee",
    heading: "#eb7",
    subheading: "#fc9",
    sourceNote: "#fed",
    linkExt: "#cdf",
    linkInt: "#fdc",
    linkVisited: "dcf",
    highContrast: "#f8b",
  },
  Light: {
    background: "#def",
    altBack: "#bdf",
    formBack: "#bcd",
    buttonColor: "#ddd",
    buttonHover: "#bbb",
    maintext: "#224",
    heading: "#129",
    subheading: "#169",
    sourceNote: "#236",
    linkExt: "#12a",
    linkInt: "#047",
    linkVisited: "#507",
    highContrast: "#f46",
  },
  DarkGrey: {
    background: "#222",
    altBack: "#444",
    formBack: "#555",
    buttonColor: "#333",
    buttonHover: "#666",
    maintext: "#eee",
    heading: "#bbb",
    subheading: "#ddd",
    sourceNote: "#ccc",
    linkExt: "#cdf",
    linkInt: "#fdc",
    linkVisited: "#dcf",
    highContrast: "#f8b",
  },
};
 */
const styleSheetTemplate = `:root { }
  html {
    scroll-behavior: smooth;
  }
  body {
    background-color: var(--background);
    color: var(--maintext);
    margin-top: 60px;
  }
  p {
    padding: 2px;
    margin: 0.3em 0;
    font: 12pt Arial, sans-serif;
  }
  .fixed {
    position: fixed;
    top: 3px;
    right: 10px;
    width: max-content;
    text-align: right;
    border: 3px solid var(--maintext);
    background-color: var(--background);
    padding: 2px;
  }
  .version {
    font: 9pt "Times New Roman", Times, serif;
    margin: 0;
    padding: 0;
  }

  /* Headings */
  h1 {
    color: var(--heading);
    font: 24pt Garamond, serif;
    font-weight: bold;
    text-align: center;
  }
  h2 {
    color: var(--heading);
    font: 18pt Garamond, serif;
    font-weight: bold;
    text-align: center;
  }
  h3 {
    color: var(--heading);
    font: 16pt Garamond, serif;
    text-align: center;
  }
  .heading {
    padding: 4px;
    margin: 2px;
    border: 2px solid var(--heading);
  }
  .headingLabel {
    font: 14pt "Times New Roman", Times, serif;
    font-weight: bold;
    text-align: center;
    color: var(--heading);
  }
  .subhead {
    border: 2px solid var(--subheading);
    padding: 8px;
    margin: 2px;
  }
  .subheadLabel {
    font: 14pt "Times New Roman", Times, serif;
    font-style: italic;
    color: var(--subheading);
    text-align: center;
  }

  /* Hyperlinks */
  a:link {
    color: var(--linkExt);
  }
  a.ors:link,
  a.ors:visited {
    color: var(--linkInt);
  }
  a:visited {
    color: var(--linkVisited);
  }
  a:hover {
    background-color: var(--altBack);
  }
  /* Table of contents */
  #toc {
    margin: 2px;
    padding: 4px;
    border: 2px solid var(--heading);
    background-color: var(--altBack);
  }
  .toc {
    break-inside: avoid;
  }
  .tocHeading {
    font-size: 12pt;
    font-weight: bold;
    text-align: center;
    color: var(--heading);
    break-inside: avoid;
  }
  .toc.default {
    color: var(--heading);
    padding-left: 20%;
    text-indent: -25%;
    font-size: 10pt;
  }
  .tocItems {
    columns: 250px 3;
    column-gap: 5%;
  }

  /* Sections & parts of sections */
  .section {
    margin: 0;
    padding: 2px 2px;
    display: block;
    overflow: hidden;
    transition: max-height 0.25s ease-out;
  }
  .leadline,
  .tempHead {
    font: 13pt "Times New Roman", Times, serif;
    font-weight: bold;
    text-align: left;
    color: var(--subheading);
    margin: 0.6em 0;
  }
  .collapsible {
    cursor: pointer;
    background-color: var(--buttonColor);
    width: 100%;
    border: none;
  }
  .expanded {
    background-color: var(--altBack);
  }
  button {
    color: var(--maintext);
    background-color: var(--buttonColor);
  }
  .collapsible:hover,
  button:hover {
    background-color: var(--buttonHover);
  }
  :target {
    color: var(--highContrast) !important;
  }
  .tempSec {
    border: 2px solid var(--subheading);
    margin: 0 2px;
    padding: 0 2px;
  }

  /* Forms */
  .orsForm {
    background-color: var(--formBack);
    margin: 1%;
    border: 3px solid var(--subheading);
    padding: 0% 1%;
  }
  .formHeading {
    text-align: center;
    font-weight: bold;
    color: var(--subheading);
  }

  /* Source notes & notes */
  .sourceNote,
  .burnt {
    margin: 0;
    color: var(--sourceNote);
    font: 11pt "Times New Roman", Times, serif;
    padding: 0.4em 0 0.4em 10%;
  }
  .burnt {
    text-indent: -1em;
  }
  .note {
    font: 10pt, "Times New Roman", Times, serif;
    max-width: 800px;
    min-width: 300px;
    width: 75%;
    margin: 0 auto;
    border: 2px solid var(--subheading);
    padding: 6px;
    background-color: var(--altBack);
  }
  .hideMe {
    position: absolute;
    left: -9999px;
  }

  /* Section Subunits */
  .subsec,
  .para,
  .subpara,
  .subsubpara,
  .subsubsubpara {
    text-indent: -1em;
    margin: 0.2em auto 0 auto;
  }
  .subsec {
    padding-left: 3%;
  }
  .para {
    padding-left: 4.5%;
  }
  .subpara {
    padding-left: 6%;
  }
  .subsubpara {
    padding-left: 7.5%;
  }
  .subsubsubpara {
    padding-left: 9%;
  }`;
