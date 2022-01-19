//helper.js
//@ts-check

const wordObj = (/** @type {string} */ aHtml="") => {
  return {
    aHtml,
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
      })()
      ;
      // @ts-ignore (potentially undefined this.aHtml)
      this.aHtml = this.aHtml.replace(searchRegExp, replaceStr);
    },
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
      })()
      ;
      // @ts-ignore (potentially undefined this.aHtml)
      this.aHtml = this.aHtml.replace(searchRegExp, replaceStr);
    }
  }
}
const ifRegExMatch = (
  /** @type {string | RegExp} */ searchFor,
  /** @type {string} */  initialText,
  index = 0,
  matchPos = 0
) => {
  const aRegExp = (() => {
    if (typeof searchFor == "string") {
      return new RegExp(searchFor, ((index!=0) && "g"|| "")); // search for all only if index > 0
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
            `Search for ${searchFor} at ${index}:${matchPos} returned ${ans.slice(0,300)}`,
            "helper.js",
            "ifRegExMatch"
          )
        } else {
          console.log (ans)
          console.log (aRegExp)
        }
        return ans;
      }
    } else {
      const myMatches = initialText.matchAll(aRegExp);
      const matchList = Array.from(myMatches);
      const ans = matchList[index][matchPos];
      infoCS(
        `Search for ${searchFor} at ${index}:${matchPos} returned ${ans.slice(0,300)}`,
        "helper.js",
        "ifRegExMatch"
      );
      return ans;
    }
  }
  warnCS(
    `Search for ${searchFor} at ${index}:${matchPos} failed`,
    "helper.js",
    "ifRegExMatch"
  );
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

const infoCS = (infoTxt, script = "helper.js", calledBy) => {
  if (calledBy == undefined) {
    try {
      calledBy = infoCS.caller.name;
    } catch {
      calledBy = "";
    }
  }
  sendAwaitResponse({
    info: {
      script: script,
      txt: infoTxt,
      aCaller: calledBy,
      color: "yellow",
    },
  });
};

const warnCS = (warnTxt, script, calledBy) => {
  if (script == undefined) {
    script = "helper.js";
  }
  if (calledBy == undefined) {
    try {
      calledBy = warnCS.caller.name;
    } catch {
      calledBy = "";
    }
  }
  sendAwaitResponse({
    warn: {
      script: script,
      txt: warnTxt,
      aCaller: calledBy,
      color: "yellow",
    },
  });
};

function getFunctionName() {
  return getFunctionName.caller.name;
}
