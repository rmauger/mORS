//helper.js
//@ts-check
/** Object consisting of html as string and functions for modifying the html 
 * @param {string} aHtml 
*/
const wordObj = (aHtml = "") => {
  return {
    aHtml,
    /** Replacing all instances of 'searchFor' with 'replaceStr' */
    replacerAll: function (
      /** @type {string | RegExp} */ searchFor,
      /** @type {string} */ replaceStr
    ) {
      const searchRegExp = (() => {
        if (typeof searchFor == "string") {
          return new RegExp(searchFor, "g");
        } else {
          return new RegExp(searchFor.source, "g");
        }
      })();
      // @ts-ignore (potentially undefined this.aHtml)
      this.aHtml = this.aHtml.replace(searchRegExp, replaceStr);
    },
    /** Replacing only first instance of 'searchFor' with 'replaceStr' */
    replacerOne: function (
      /** @type {string | RegExp} */ searchFor,
      /** @type {string} */ replaceStr
    ) {
      const searchRegExp = (() => {
        if (typeof searchFor == "string") {
          return new RegExp(searchFor, "");
        } else {
          return new RegExp(searchFor.source, "");
        }
      })();
      // @ts-ignore (potentially undefined this.aHtml)
      this.aHtml = this.aHtml.replace(searchRegExp, replaceStr);
    },
  };
};

/** Searches for 'searchFor' in the 'initialText' and returns 'index'th place result; and can accept matchPos from RegExp
 * @param {string | RegExp} searchFor,
 * @param {string} initialText
 * @param {number} index 
 * @param {number} matchPos
 */
const ifRegExMatch = (searchFor, initialText, index=0, matchPos=0) => {
  const aRegExp = (() => {
    if (typeof searchFor == "string") {
      return new RegExp(searchFor, (index != 0 && "g") || ""); // search for all only if index > 0
    } else {
      return searchFor;
    }
  })();
  if (aRegExp.test(initialText)) {
    if (index == 0 || matchPos == 0) {
      const myIndex = (index > matchPos && index) || matchPos;
      const resultsList = initialText.match(aRegExp);
      if (resultsList.length > index) {
        const ans = initialText.match(aRegExp)[myIndex];
        if (typeof ans == "string") {
          infoCS(
            `Search for ${searchFor} at ${index}:${matchPos} returned ${ans.slice(
              0,
              150
            )}`,
            "helper.js",
            "ifRegExMatch"
          );
        } else {
          console.log(ans);
          console.log(aRegExp);
        }
        return ans;
      }
    } else {
      const myMatches = initialText.matchAll(aRegExp);
      const matchList = Array.from(myMatches);
      const ans = matchList[index][matchPos];
      infoCS(
        `Search for ${searchFor} at ${index}:${matchPos} returned ${ans.slice(
          0,
          150
        )}`,
        "helper.js",
        "ifRegExMatch"
      );
      return ans;
    }
  }
  infoCS(
    `Search for ${searchFor} at ${index}:${matchPos} returned NO matches`,
    "helper.js",
    "ifRegExMatch"
  );
  return "";
};

/** Toggles display of source notes when changed in popup
 * @param {boolean} doShow */
const doShowSourceNotes = (doShow) => {
  const sourceNoteList = document.getElementsByClassName("sourceNote");
  for (let i = 0; i < sourceNoteList.length; i++) {
    const note = sourceNoteList[i];
    note.classList.remove("hideMe");
    note.classList.add(!doShow && "hideMe");
  }
};
/** Toggles display of source notes when changed in popup or burnt (rsec) sections
 * @param {boolean} doShow */
const doShowRSecs = (doShow) => {
  const rSecList = document.getElementsByClassName("burnt");
  for (let i = 0; i < rSecList.length; i++) {
    const note = rSecList[i];
    note.classList.remove("hideMe");
    note.classList.add(!doShow && "hideMe");
  }
};

const infoCS = (
  /** @type {string} */ infoTxt,
  script = "helper.js",
  /** @type {string} */ calledBy
) => {
  if (calledBy == undefined) {
    try {
      calledBy = infoCS.caller.name;
    } catch {
      calledBy = "null";
    }
  }
  sendAwaitResponse({
    info: {
      txt: infoTxt,
      script: script,
      aCaller: calledBy,
      color: "yellow",
    },
  });
};

const warnCS = (
  /** @type {string} */ warnTxt,
  script = "helper.js",
  /** @type {string} */ calledBy
) => {
  if (calledBy == undefined) {
    try {
      calledBy = warnCS.caller.name;
    } catch {
      calledBy = "null";
    }
  }
  sendAwaitResponse({
    warn: {
      txt: warnTxt,
      script: script,
      aCaller: calledBy,
      color: "yellow",
    },
  });
};

function getFunctionName() {
  return getFunctionName.caller.name;
}
