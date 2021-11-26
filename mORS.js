//@ts-check
//mORS.js

/** returns match if one is available (defaults to first match)
 * @param {string | RegExp} searchFor
 * @param {string} initialText
 */
function ifRegExMatch(searchFor, initialText, index = 0) {
  let aRegExp = new RegExp("");
  if (typeof searchFor == "string") {
    aRegExp = new RegExp(searchFor, "g");
  } else {
    aRegExp = searchFor;
  }
  if (aRegExp.test(initialText)) {
    const resultsList = initialText.match(aRegExp);
    if (resultsList.length > index) {
      return initialText.match(aRegExp)[index];
    }
  }
  return "";
}
function promiseGetNavID() {
  return new Promise(async (resolve, reject) => {
    try {
      setTimeout(() => {
        const idFinder = /(?<=\.html\#)[^\/]*/;
        if (idFinder.test(initialTabUrl)) {
          const pinCiteButton = document.getElementById(
            ifRegExMatch(idFinder, initialTabUrl)
          );
          if (pinCiteButton) {
            resolve(pinCiteButton);
          } else {
            resolve("");
          }
        } else {
          resolve("");
        }
      }, 10);
    } catch (e) {
      console.warn(`promiseGetNavID: ${e}`);
      reject(`promiseGetNavID: ${e}`);
    }
  });
}
function addPopupJsListener() {
  //@ts-ignore
  chrome.runtime.onMessage.addListener((msg, _sender, _reponse) => {
    const msgText = msg.toMORS;
    try {
      if (msgText["burnt"] != undefined) {
        doShowRSecs(msgText["burnt"]);
      } else if (msgText["sn"] != undefined) {
        doShowSourceNotes(msgText["sn"]);
      } else {
        console.warn("Error unidentified message received from popup.html");
      }
    } catch (e) {
      console.warn(`Error w/ display rSecs or sourceNotes: ${e}`);
    }
  });
}
/**
 * @param {boolean} show
 */
function doShowSourceNotes(show) {
  const sourceNoteList = document.getElementsByClassName("sourceNote");
  for (let i = 0; i < sourceNoteList.length; i++) {
    const note = sourceNoteList[i];
    note.classList.remove("hideMe");
    note.classList.add(!show && "hideMe");
  }
}
/**
 * @param {boolean} show
 */
function doShowRSecs(show) {
  const rSecList = document.getElementsByClassName("burnt");
  for (let i = 0; i < rSecList.length; i++) {
    const note = rSecList[i];
    note.classList.remove("hideMe");
    note.classList.add(!show && "hideMe");
  }
}
function promiseGetTabURL() {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getCurrentTab" }, (msg) => {
      try {
        const tab = msg.response;
        initialTabUrl = tab.url;
        resolve();
      } catch (e) {
        console.warn(`Error retrieving URL: ${e}`);
        reject(`Error retrieving URL: ${e}`);
      }
    });
  });
}
function StyleSheetRefresh() {
  try {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "updateCSS" }, () => {});
  } catch (e) {
    console.log(`Error applying stylesheet ${e}.`);
  }
}
async function javaDOM() {
  /** returns object (HTML elements & their collapsed heights) (just one element, but may edit later)
   * @param {Element} buttonElement
   */
  function findCollapseHeight(buttonElement) {
    const thisElement = buttonElement.parentElement;
    const thisHeight = `${buttonElement.scrollHeight}px`;
    buttonElement.classList.remove("active");
    return { anElement: thisElement, height: thisHeight };
  }
  /** collapses single ORS section
   * @param {{ anElement: HTMLElement; height: any; }} collapseObj
   */
  function collapseSingle(collapseObj) {
    if (!collapseObj) {
      console.warn("No button found in object!?");
    } else {
      collapseObj.anElement.style.maxHeight = collapseObj.height;
    }
  }

  /** expands single ORS section
   * @param {Element} buttonElement
   */
  function expandSingle(buttonElement) {
    if (buttonElement) {
      if (buttonElement.classList.contains("collapsible")) {
        const sectionDiv = buttonElement.parentElement;
        buttonElement.classList.add("active");
        sectionDiv.style.maxHeight = "none";
      } else {
        console.warn(
          `Target ${buttonElement.innerHTML} is not an active section`
        );
      }
    } else {
      console.warn("No button element found.");
    }
  }
  // Expands all ORS sections to full height
  function expandAllSections() {
    const collapsibles = document.getElementsByClassName("collapsible");
    for (let i = collapsibles.length - 1; i >= 0; i--) {
      expandSingle(collapsibles[i]);
    }
  }
  // Adds button to each ORS section leadline toggling expand/collapse
  function addSectionCollapseButtons() {
    const collapsibles = document.getElementsByClassName("collapsible");
    let collapseObjHeightList = [];
    for (let i = 0; i < collapsibles.length; i++) {
      const buttonElement = collapsibles[i];
      buttonElement.parentElement.style.maxHeight="none"
      // collapseObjHeightList.push(findCollapseHeight(buttonElement));
      buttonElement.addEventListener("click", () => {
        if (buttonElement.parentElement.style.maxHeight == "none") {
          collapseSingle(findCollapseHeight(buttonElement));
        } else {
          expandSingle(buttonElement);
        }
      });
    }
  }
  // Collapses all ORS sections to button height
  function collapseAllSections() {
    const collapsibles = document.getElementsByClassName("collapsible");
    let collapseObjHeightList = [];
    for (let i = 0; i < collapsibles.length; i++) {
      const buttonElement = collapsibles[i];
      collapseObjHeightList.push(findCollapseHeight(buttonElement));
    }
    for (let i = collapsibles.length - 1; i >= 0; i--) {
      collapseSingle(collapseObjHeightList[i]);
    }
  }
  //adds button element to internal ORS links to force expansion of target on selection
  function buildOrsLinkButton() {
    let orsLinkList = document.getElementsByClassName("ors");
    for (let i = 0; i < orsLinkList.length; i++) {
      const aLink = orsLinkList[i];
      const buttonElement = document.getElementById(aLink.innerHTML);
      if (buttonElement) {
        // dealing with issues caused if there is a reference to ORS section that does not exist
        if (buttonElement.classList.contains("collapsible")) {
          // dealing with reference to ORS section that is burnt
          aLink.addEventListener("click", () => {
            expandSingle(buttonElement);
          });
        }
      }
    }
  }
  // add floating div with version info & buttons
  function buildFloatingMenuDiv() {
    function addMenuBody() {
      menuPanel.classList.add("fixed");
      let versionPar = document.createElement("p");
      //@ts-ignore
      let manifest = chrome.runtime.getManifest();
      let thisVersion = manifest.version;
      versionPar.classList.add("version");
      versionPar.innerHTML = `style markup by <a href="https://github.com/rmauger/mORS/#readme">mORS<\/a> v.${thisVersion}`;
      menuPanel.appendChild(versionPar);
    }
    function addExpandAllButton() {
      let expandAllButton = document.createElement("button");
      expandAllButton.innerText = "Expand all";
      expandAllButton.id = "buttonExpand";
      menuPanel.appendChild(expandAllButton);
      expandAllButton.addEventListener("click", () => expandAllSections());
    }
    function addCollapseAllButton() {
      let collapseAllButton = document.createElement("button");
      collapseAllButton.innerText = "Collapse all";
      collapseAllButton.id = "buttonCollapse";
      menuPanel.appendChild(collapseAllButton);
      collapseAllButton.addEventListener("click", () => collapseAllSections());
    }
    function addToggleCssButton() {
      let toggleCSSButton = document.createElement("button");
      toggleCSSButton.innerText = "Remove Style";
      toggleCSSButton.classList.add("cssOn");
      toggleCSSButton.id = "buttonToggleCSS";
      menuPanel.appendChild(toggleCSSButton);
      toggleCSSButton.addEventListener("click", () => {
        if (toggleCSSButton.classList.contains("cssOn")) {
          expandAllSections();
          document.getElementById("buttonCollapse").style.display = "none";
          document.getElementById("buttonExpand").style.display = "none";
          document.getElementById("buttonToggleCSS").innerText = "Add Style";
          // sends message to background.js to remove CSS & expandsAllSections once completed
          try {
            //@ts-ignore
            chrome.runtime.sendMessage({ message: "removeCSS" }, (response) => {
              if (response.response == "Success") {
                expandAllSections();
              }
            });
          } catch (e) {
            console.warn(`Error removing CSS ${e}`);
          }
        } else {
          document.getElementById("buttonCollapse").style.display = "inline";
          document.getElementById("buttonExpand").style.display = "inline";
          document.getElementById("buttonToggleCSS").innerText = "Remove Style";
          StyleSheetRefresh();
          collapseAllSections();
        }
        toggleCSSButton.classList.toggle("cssOn");
      });
    }
    // BuildFloatingMenuDiv MAIN
    let menuPanel = document.createElement("div");
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getShowMenu" }, (response) => {
      if (response.response) {
        addMenuBody();
        addExpandAllButton();
        addCollapseAllButton();
        addToggleCssButton();
        document.body.appendChild(menuPanel);
      }
    });
  }
  function implementStoredParameters() {
    async function getCollapsed() {
      try {
        //@ts-ignore
        chrome.runtime.sendMessage({ message: "getCollapsed" }, (response) => {
          if (response.response) {
            collapseAllSections();
          }
        });
      } catch (error) {
        console.warn(`Error in getCollapsed(): ${error}`);
      }
      try {
        const navID = await promiseGetNavID();
        if (navID) {
          console.info(`navigating to ${navID.innerText}`);
          expandSingle(navID);
          navID.scrollIntoView();
        } else {
          console.info("No ORS section found in URL");
        }
      } catch (error) {
        console.warn(`Error getting tabURL: ${error}`);
      }
    }
    function getShowRSec() {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: "getShowBurnt" }, (response) => {
        const doShow = response.response;
        doShowRSecs(doShow);
      });
    }
    function getShowSNs() {
      //@ts-ignore
      chrome.runtime.sendMessage({ message: "getShowSNs" }, (response) => {
        const doShow = response.response;
        doShowSourceNotes(doShow);
      });
    }
    // MAIN Implement Stored Parameters
    getCollapsed();
    getShowRSec();
    getShowSNs();
  }

  async function ResizeCollapsed() {
    try {
      //@ts-ignore
      const sectionList = document.body.getElementsByClassName("section");
      let maxHeightList = [];
      console.info(
        `Reapply height to up to ${sectionList.length} section divs`
      );
      for (let i = 0; i < sectionList.length; i++) {
        const aSection = sectionList[i];
        //@ts-ignore
        if (aSection.style.maxHeight != "none") {
          maxHeightList.push(`${aSection.firstElementChild.scrollHeight}px`);
          //@ts-ignore
        } else maxHeightList.push("none");
      }
      for (let j = sectionList.length - 1; j >= 0; j--) {
        //@ts-ignore
        sectionList[j].style.maxHeight = maxHeightList[j];
      }
    } catch (error) {
      console.warn(`Error in getCollapsed(): ${error}`);
    }
  }

  // JavaDOM MAIN:
  addSectionCollapseButtons();
  buildOrsLinkButton();
  buildFloatingMenuDiv();
  implementStoredParameters();
  var resizedFinished;
  window.addEventListener("resize", () => {
    clearTimeout(resizedFinished);
    resizedFinished = setTimeout(function () {
      ResizeCollapsed();
    }, 350);
  });
}
function SyncReplaceText() {
  function htmlCleanup() {
    bodyHtml = document.body.innerHTML;
    const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
    const msoGarb = /<p\sclass=\W?Mso[^>]*>/g; // is replaced by:
    const msoRepl = "<p class=default>";
    const divGarb = /<div[^>]*?>/g; // is deleted
    const emptyTags = new RegExp(`<(\\w)[^>]*?>${tabs}<\\/\\1>`, "g"); // is deleted 
    bodyHtml = bodyHtml.replace(/(\n|\r|\f)/g, " ");
    bodyHtml = bodyHtml.replace(/\s\s/, " ");
    bodyHtml = bodyHtml.replace(styleGarb, "$1");
    bodyHtml = bodyHtml.replace(msoGarb, msoRepl);
    bodyHtml = bodyHtml.replace(divGarb, "");
    bodyHtml = bodyHtml.replace(emptyTags, "");
  }
  function chapterHeadRepl() {
    const headHTML = document.head.innerHTML;
    const msoVolumeTag = /(?<=\<mso:Volume[^>]*\>0?)([^<]*)(?=\<)/;
    const msoChaperTag = /(?<=\<mso:[^>]*Chapter[^>]*\>0?)([^<]*)(?=\<)/g;
    const edYearMatch = "20\\d{2}(?=\\sEDITION)";
    const chapterMatch = new RegExp(`(?<=Chapter\\s0{0,2})${orsChapter}`);
    const thisVolume = ifRegExMatch(msoVolumeTag, headHTML);
    const thisTitle = ifRegExMatch(msoChaperTag, headHTML);
    const thisChapterTitle = ifRegExMatch(msoChaperTag, headHTML, 1);
    const thisEdYear = ifRegExMatch(new RegExp(edYearMatch), bodyHtml);
    thisChapterNum = ifRegExMatch(chapterMatch, headHTML);
    const endOfHead = new RegExp(`[^]*?${edYearMatch}[^.]*?<p[^.]*?<p[^.]*?<p`); // three paragraphs past edition
    const preTitleMatch = new RegExp(`[^]*?Chapter\\s${thisChapterNum}`);
    const preTitle = ifRegExMatch(
      new RegExp(`[^]*?(?=Chapter\\s${thisChapterNum})`),
      ifRegExMatch(preTitleMatch, bodyHtml)
    );
    mainHead = `<div class=mainHead>${preTitle}<h3>Volume ${thisVolume}</h3><h2>Title ${thisTitle}</h2>
      <h1>Chapter ${thisChapterNum} - ${thisChapterTitle}</h1><h3>${thisEdYear} EDITION</h3></div>`;
    document.head.innerHTML = `<title>ORS ${thisChapterNum}: ${thisChapterTitle}</title>`;
    bodyHtml = bodyHtml.replace(endOfHead, "<p"); //deleting existing heading
  }
  function createTOC() {
    const tocFind = /(<p[^>]*?>[^]*?<\/p>)([^]*?)(?=\1|<p class=default><b>)/; // is replaced by:
    const tocRepl = `<div id=toc><h1>Table of Contents</h1><div class=tocItems>\$1\$2</div></div>${tocBreak}`;
    bodyHtml = bodyHtml.replace(tocFind, tocRepl);
  }
  function classifyOrsRefs() {
    const orsFind = new RegExp(
      `(${orsSection}((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)`,
      "g"
    ); // is replaced by:
    const orsRepl = "<span class=ors>$1</span>";
    bodyHtml = bodyHtml.replace(orsFind, orsRepl);
  }
  function classLeadlines() {
    const orsSecLead = `(?:<span class=ors>)(${thisChapterNum}\\.\\d{3,4}\\b)\\s?</span>([^\\.][^\\]]+?\\.\\s?)`;
    const leadFind = new RegExp(
      `<p class=default><b>${tabs}${orsSecLead}</b>`,
      "g"
    );
    const leadRepl =
      '</div><div class=section break="~"><button id="$1" class="collapsible"><p class=leadline>$1$2</p></button><p class=default>';
    bodyHtml = bodyHtml.replace(leadFind, leadRepl);
  }
  function createFormDivs() {
    const startForm = new RegExp(
      `(form[^]*?:)<\\/p>${tabs}(<p[^>]*>)_{78}`,
      "g"
    ); // finds start of form
    const startFormRepl = "$1</p><div class=orsForm break='`'>$2"; //inserts it as a new div
    const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g; // finds ends of form
    const endFormRepl = "$1</div break='`'>"; // closes div
    const endFormCleanup = /(_{78}<\/div>)/g; // cleans up ending form _____
    bodyHtml = bodyHtml.replace(startForm, startFormRepl);
    bodyHtml = bodyHtml.replace(endForm, endFormRepl);
    bodyHtml = bodyHtml.replace(endFormCleanup, "$1");
  }
  function orsInChapLink() {
    const orsInChp = new RegExp(
      `<span class=ors(>(${thisChapterNum}\\.\\d{3,4}\\b)[^]*?<\\/)span`,
      "g"
    );
    const orsInChpRepl = '<a class=ors href="#$2"$1a';
    bodyHtml = bodyHtml.replace(orsInChp, orsInChpRepl);
  }
  function orsOutChapLink() {
    const remainingORS = new RegExp(
      `span\\sclass=ors>((${orsChapter}).\\d{3}\\b|(\\b7\\dA?)\\.\\d{4}\\b)<\\/span`,
      "g"
    );
    const orsOrLegURL =
      "https://www.oregonlegislature.gov/bills_laws/ors/ors00$2$3.html#$1";
    const replRemainingORS = `a href="${orsOrLegURL}">$1</a`;
    const trimZeros = /(ors)0+(\d{3})/g;
    bodyHtml = bodyHtml.replace(remainingORS, replRemainingORS);
    bodyHtml = bodyHtml.replace(trimZeros, "$1$2");
  }
  function separateToc() {
    if (new RegExp(tocBreak).test(bodyHtml)) {
      headAndToc = bodyHtml.match(new RegExp(`[^]*?(?=${tocBreak})`))[0]; // copy TOC to own variable
      bodyHtml = bodyHtml.replace(new RegExp(`[^]*?${tocBreak}`), ""); // and remove it from the editing document
    } else {
      console.warn("No table of contents found");
    }
  }
  function classifySubunits() {
    const subsecFind = new RegExp(
      `<p[^>]*?>${tabs}?\\s?(\\(\\d{1,2}\\)[^]+?)</p>`,
      "g"
    ); //subsection (1)
    const subsubPara = new RegExp(
      `<p[^>]*?>${tabs}\\s?(\\([a-z]{1,5}\\)[^]+?)</p>`,
      "g"
    ); //subsubparagraphs (roman) (for now)
    const subsubsubPara = new RegExp(
      `<p[^>]*?>${tabs}\\s?(\\([A-Z]{1,5}\\)[^]+?)</p>`,
      "g"
    ); //subparagraphs (A)
    const subsecRepl = "<p class=subsec>$1</p>";
    const subsubRepl = "<p class=subsubpara>$1</p>";
    const subsubsubRepl = "<p class=subsubsubpara>$1</p>";
    bodyHtml = bodyHtml.replace(subsecFind, subsecRepl);
    bodyHtml = bodyHtml.replace(subsubPara, subsubRepl);
    bodyHtml = bodyHtml.replace(subsubsubPara, subsubsubRepl);
    Romans(); // separate roman numerals (subsubpara & subsubsubpara) from letters (para & subpara)
    function Romans() {
      const sameLtrLower = /=subsubpara>(\(([a-z])(?:\2){0,4}\))/g; // reclassifies single letter (a) or letters match (aa) as:
      const ltrLowerRepl = "=para break='!'>$1";
      const sameLetterUpper = /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/g; // reclassifies single letter (A) or matching letters (AA) as:
      const ltrUpperRepl = "=subpara break='?'>$1";
      const romanLowerLead = "((=subsubpara>[^!~]*))=para[^>]*?>(?=\\("; // common data in para that needs converted to roman
      const romanLowerRepl = "$1=subsubpara>";
      const romanUpperLead = "((subsubsubpara>[^~!?]*))=subpara[^>]*>(?=\\("; // upper case
      const romanUpperRepl = "$1=subsubsubpara>";
      const iiLower =
        /=para[^>]*>(\([A-Z]\)?\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/g; // reclassify matching [(X)](i) & (ii) to:
      const iiRepl = "=subsubpara>$1=subsubpara>";
      const IIUpper = /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/g; // next, get matching (I) & (II) labeled as subsubs again
      const IIRepl = "=subsubsubpara>$1=subsubsubpara>";
      const iiiLower = new RegExp(romanLowerLead + "iii)", "g");
      const vLower = new RegExp(romanLowerLead + "v)", "g");
      const xLower = new RegExp(romanLowerLead + "x)", "g");
      const xxLower = new RegExp(romanLowerLead + "xx)", "g");
      const IIIUpper = new RegExp(romanUpperLead + "III)", "g");
      const VUpper = new RegExp(romanUpperLead + "V)", "g");
      const XUpper = new RegExp(romanUpperLead + "X)", "g");
      const XXUpper = new RegExp(romanUpperLead + "XX)", "g");
      bodyHtml = bodyHtml.replace(sameLtrLower, ltrLowerRepl);
      bodyHtml = bodyHtml.replace(sameLetterUpper, ltrUpperRepl);
      Roman_wrapper: {
        let breakIf = (/** @type {string} */ romanNum) => {
          // ensure that when matches dry up, stop looking for more
          return new RegExp(`/\(${romanNum}\)/`).test(bodyHtml);
        };
        if (breakIf("ii")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(iiLower, iiRepl);
        bodyHtml = bodyHtml.replace(iiiLower, romanLowerRepl);
        bodyHtml = bodyHtml.replace(vLower, romanLowerRepl);
        bodyHtml = bodyHtml.replace(xLower, romanLowerRepl);
        bodyHtml = bodyHtml.replace(xxLower, romanLowerRepl);
        if (breakIf("II")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(IIUpper, IIRepl);
        if (breakIf("III")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(IIIUpper, romanUpperRepl);
        if (breakIf("V")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(VUpper, romanUpperRepl);
        if (breakIf("X")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(XUpper, romanUpperRepl);
        if (breakIf("XX")) {
          break Roman_wrapper;
        }
        bodyHtml = bodyHtml.replace(XXUpper, romanUpperRepl);
      }
    }
    LittleL();
    function LittleL() {
      // reclasses (L) as paragraph if following (k)
      const lilL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g;
      const lilLRepl = "$1=para";
      bodyHtml = bodyHtml.replace(lilL, lilLRepl);
    }
  }
  function headingReformat() {
    const headingFind = /<p class=default>([A-Z][^a-z]{3,}?)<\/p>/g; //Replaces 3+ initial capital letters with:
    const headingRepl =
      "#hclose#</div><div class=heading><p class=headingLabel><b>$1</b></p><div>"; // #tag helps readjust heading divs at cleanup
    const tempSec = /p class=default>(\(Temporary\sprovisions[^~]*?<\/)p/g; //Replaces "(Temporary provisions ..." with:
    const tempSecRepl = 'div class=TempHead style="text-align:center">$1div';
    const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g; //Replaces leading parens with at least 5 letters with:
    const subheadRepl =
      "#sclose#</div><div class=subhead><p class=subheadLabel>$1</p><div>"; // #tag helps readjust heading divs at cleanup
    const headInTOCRepl = "<p class=tocHeading>$1</p>";
    const headInForm =
      /(=orsForm break=\'\`\'[^`~]*)#hclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count headings to get "<div> breaks to line up"
    const subheadInForm =
      /(=orsForm break=\'\`\'[^`~]*)#sclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count subheadings
    bodyHtml = bodyHtml.replace(headingFind, headingRepl);
    bodyHtml = bodyHtml.replace(tempSec, tempSecRepl);
    bodyHtml = bodyHtml.replace(subheadFind, subheadRepl);
    headAndToc = headAndToc.replace(headingFind, headInTOCRepl);
    headAndToc = headAndToc.replace(subheadFind, headInTOCRepl);
    while (headInForm.test(bodyHtml) || subheadInForm.test(bodyHtml)) {
      // replaces headings found within forms (which probably aren't actual headings) with with:
      bodyHtml = bodyHtml.replace(headInForm, "$1<p class=formHeading>$2");
      bodyHtml = bodyHtml.replace(subheadInForm, "$1<p class=default>$2");
    }
    headingDivs(); // makes sure that all headings & subheading <divs> are closed exactly once. Could break if there's a subheading w/o heading
    function headingDivs() {
      const closeHeadTags = /(#hclose#|#sclose#)/;
      let hCount = 0;
      while (closeHeadTags.test(bodyHtml)) {
        let divHeadClose = "";
        let nextTag = ifRegExMatch(closeHeadTags, bodyHtml);
        if (nextTag[1] == "s") {
          if (hCount == 2) {
            divHeadClose = "</div>";
          }
          hCount = 2;
        } else {
          switch (hCount) {
            case 2:
              divHeadClose = "</div></div>";
              break;
            case 1:
              divHeadClose = "</div>";
            default:
              break;
          }
          hCount = 1;
        }
        bodyHtml = bodyHtml.replace(closeHeadTags, divHeadClose);
      }
    }
  }
  function notesRepl() {
    const noteFind = new RegExp(
      "<p[^>]*>\\s?<b>" + tabs + "(Note(\\s\\d)?:\\s?<\\/b>[^]*?<\\/p>)",
      "g"
    ); // "Note:" or "Note #:" is replaced by:
    const noteRepl = "<div class=note><b>$1</div>";
    const noteSec = new RegExp(
      `<\\/div>${tabs}<p[^>]*?><b>${tabs}(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>([^~]*?)<div`,
      "g"
    ); // Finds bold ORS links w/o leadline & is replaced by:
    const noteSecRepl =
      "<p class=default><b>Note section for ORS $1:</b></p><p class=default>$2</div><div";
    const noteSesLaw =
      /<div\sclass=note>([^~]*?Section[^~]+?provides?:)[^~]*?<\/div>([^~]*?)<div/g;
    const noteSesLawRepl = "</div><div class='note notesec'>$1$2<div";
    const SesLawSec = new RegExp(
      `<b>${tabs}(Sec\\.\\s\\d{1,3}\\.)\\s?<\\/b>`,
      "g"
    );
    const SesLawSecRepl = "<p class=leadline>$1</p><p class=default>";
    const prefaceFind = /(Preface\sto\sOregon\sRevised\sStatutes)/g; // "preface" is replaced by link:
    const prefaceRepl =
      '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
    const v22Find =
      /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // CST is replaced by link:
    const v22Repl =
      '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
    bodyHtml = bodyHtml.replace(noteFind, noteRepl);
    bodyHtml = bodyHtml.replace(noteSec, noteSecRepl);
    bodyHtml = bodyHtml.replace(noteSesLaw, noteSesLawRepl);
    bodyHtml = bodyHtml.replace(SesLawSec, SesLawSecRepl);
    bodyHtml = bodyHtml.replace(prefaceFind, prefaceRepl);
    bodyHtml = bodyHtml.replace(v22Find, v22Repl);
    const subsecOne = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
    const subsecRepl = "<p class=subsec>$1</p>";
    bodyHtml = bodyHtml.replace(subsecOne, subsecRepl);
  }
  function sourceNotesRepl() {
    const sourceNote = /(\[(19\d{2}|20\d{2}|Sub|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
    const sourceNoteRepl = "<p class=sourceNote>$1</p>";
    bodyHtml = bodyHtml.replace(sourceNote, sourceNoteRepl);
    burntORS(); // Find burnt ORS (repealed/renumbered, aka rsecs) and classify
    function burntORS() {
      const burntOrs =
        /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g;
      const burntOrsRepl = "</div><div class='burnt' id='$1'><b>$1:</b> ";
      bodyHtml = bodyHtml.replace(burntOrs, burntOrsRepl);
    }
  }
  let bodyHtml = "";
  let headAndToc = "";
  let thisChapterNum = "";
  let mainHead = "";
  const tocBreak = "!@%";
  const tabs = "(?:&nbsp;|\\s){0,8}";
  const orsChapter = "[1-9]\\d{0,2}[A-C]?\\b";
  const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\\b)`;
  htmlCleanup(); // delete span syntex & msoClasses & existing divs & empty tags from HTML
  chapterHeadRepl(); // Replace heading at top of page.
  createTOC(); //create & label new division for table of contents
  classifyOrsRefs(); //classify internal cross references to ORS sections (xx.xxx) (to be replaced later by relevant links)
  classLeadlines(); // classify leadlines & create new div for each new section
  createFormDivs(); // create new div for forms
  orsInChapLink(); // builds links to ORS sections in chapter to #id of ORS section
  orsOutChapLink(); // builds links to ORS sections in other chapters
  separateToc(); //separate TOC & chapter heading from rest of body to facilitate editing body
  classifySubunits(); // finds and classifies subunits (subsections, paragraphs, subsections etc.)
  headingReformat(); // classify HEADINGS and (Subheadings) and (Temporary Labels) & build divs for each
  notesRepl(); // Notes put into divs, sourcenotes styled, adds hyperlinks for Preface to ORS & vol22
  sourceNotesRepl(); // Find source notes and classify
  return {
    mainhead : mainHead, 
    headAndToc : headAndToc, 
    body : bodyHtml
  }
}
async function OrLawLinking(html) {
  return new Promise((resolve, reject)=>{
    function HeinLinks() {
      const heinURL =
        "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
      const orLawH1 = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
      const orLawH1Repl = "<a href=" + heinURL + ">$&</a>";
      const heinURL2 =
        "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
      const orLawH2 = /(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g;
      const orLawH2Repl = "<a href=" + heinURL2 + ">$&</a>";
      html = html.replace(orLawH1, orLawH1Repl);
      html = html.replace(orLawH2, orLawH2Repl);
      resolve(html)
    }
    function OrLeg(html) {
      /**
       * @param {string} years
       * @param {string} strFormat
       */
      function orLawReplacer(years, strFormat) {
        let orLawSourceNote = new RegExp(years + orLawSourceNoteTail, "g");
        let yearOrLawChp = new RegExp(yearOrLawChpHead + years, "g");
        let orLawRepl = orLegURL + strFormat + urlTail;
        html = html.replace(orLawSourceNote, orLawRepl);
        html = html.replace(
          yearOrLawChp,
          orLawRepl.replace(/(\$1)([^]*?)(\$2)/, "$3$2$1")
        );
      }
      function removeExtraZeros() {
        const xtraZeros = /(aw|adv)\d+(\d{4})/g;
        const xtraZerosRepl = "$1$2";
        html = html.replace(xtraZeros, xtraZerosRepl);
      }
      // OrLeg MAIN:
      const orLegURL =
        '<a href="https://www.oregonlegislature.gov/bills_laws/lawsstatutes/';
      const urlTail = '">$&</a>';
      const orLawSourceNoteTail = "\\W+c\\.\\W*(\\d{1,4})";
      const yearOrLawChpHead = "(?:C|c)hapter\\s(\\d{1,4}),\\sOregon\\sLaws\\s";
      orLawReplacer(
        "(202[\\d]|2019|2018|2017|2016|2015|2013)",
        "$1orlaw000$2.pdf"
      );
      orLawReplacer("(2011|2010|2009|2008|2007|1999)", "$1orlaw000$2.html");
      orLawReplacer("(2003|2001)", "$1orlaw000$2ses.html");
      orLawReplacer("(2014)", "$1R1orlaw000$2ses.html");
      orLawReplacer("(2012)", "$1adv000$2ss.pdf");
      orLawReplacer("(2006)", "$1orLaw000$2ss1.pdf");
      orLawReplacer("(2005)", "$1orLaw000$2ses.html");
      removeExtraZeros(); // Make sure chapter is padded to exactly 4 digits
      resolve(html)
    }
    // OrLawLinking MAIN
    try {
      // @ts-ignore
      chrome.runtime.sendMessage({ message: "getOrLaw" }, (msg) => {
        const orLaw = msg.response;
        if (orLaw == "Hein") {
          HeinLinks(); // replace with URL to HeinOnline search link through SOLL
        } else if (orLaw == "OrLeg") {
          OrLeg(); // replace with URL to Or.Leg.
        } else {
          resolve(html)
        }
      });
    } catch (e) {
      const warning = `Error attempting to generate OrLaws links: ${e}` 
      console.warn(warning);
      reject(warning)
    }
  })
}

/**
 * @param {{ [x: string]: any; head?: string; toc?: string; body?: any; }} html
 */
function finalCleanUp(html) {
  document.body.innerHTML = html["head"] + html["toc"] + html["body"];
  let tocID = document.getElementById("toc");
  if (Boolean(tocID)) {
    let allTocPs = tocID.getElementsByTagName("p");
    for (let aP of allTocPs) {
      aP.className += " toc";
    }
  }
  let cleanUpBreaks = document.querySelectorAll("[break]");
  for (let elem of cleanUpBreaks) {
    elem.removeAttribute("break");
  }
  let allElements = document.getElementsByTagName('*')
    for (let elem of allElements) {
      //@ts-ignore
      if (/^(\s|\&nbsp)+$ /.test(elem.innerText)) {
        console.log(`deleting ${elem.innerHTML}`)
        elem.remove()
      }
   }
}

// MAIN mORS.js
let initialTabUrl;
promiseGetTabURL();
addPopupJsListener();
window.addEventListener("load", async function () {
  const html = SyncReplaceText()
  const addOrLaws = await (OrLawLinking(html["body"]))
  finalCleanUp({head : html['mainhead'], toc: html["headAndToc"], body: addOrLaws})  
  javaDOM(); // add buttons for collapsable sections & menu
});
window.addEventListener("load", StyleSheetRefresh);
