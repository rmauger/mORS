//helper.js
//@ts-check

/** returns match if one is available (defaults to first match)
 * @param {string | RegExp} searchFor
 * @param {string} initialText
 */
const ifRegExMatch = (searchFor, initialText, index = 0) => {
  const aRegExp = (() => {
    if (typeof searchFor == "string") {
      return new RegExp(searchFor, "g");
    } else {
      return searchFor;
    }
  })();
  if (aRegExp.test(initialText)) {
    const resultsList = initialText.match(aRegExp);
    if (resultsList.length > index) {
      return initialText.match(aRegExp)[index];
    }
  }
  return "";
};

/**
 * @param {boolean} doShow
 */
const doShowSourceNotes = (doShow) => {
  const sourceNoteList = document.getElementsByClassName("sourceNote");
  for (let i = 0; i < sourceNoteList.length; i++) {
    const note = sourceNoteList[i];
    note.classList.remove("hideMe");
    note.classList.add(!doShow && "hideMe");
  }
};
/**
 * @param {boolean} doShow
 */
const doShowRSecs = (doShow) => {
  const rSecList = document.getElementsByClassName("burnt");
  for (let i = 0; i < rSecList.length; i++) {
    const note = rSecList[i];
    note.classList.remove("hideMe");
    note.classList.add(!doShow && "hideMe");
  }
};
