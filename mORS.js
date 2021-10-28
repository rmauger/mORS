//mORS.js

StyleSheetRefresh(); // sends message to background.js to apply user selected style sheet
window.addEventListener("load", ReplaceText); //main function adjusting HTML of Oregon Legislature ORS pages

function ifMatch(aRegExp, searchString) {
  if(aRegExp.test(searchString)){
    return searchString.match(aRegExp)[0]
  } else {
    return "~N/A~"
  }
}

function ReplaceText() {
  //global variables:
  let headHTML = document.head.innerHTML;
  let chpHTML = ""
  let headAndTOC = ""; // stores TOC & heading after TOC() function
  const tabs = "(?:&nbsp;|\\s){0,8}";
  const orsChapter = "\\b\\d{1,3}[A-C]?\\b";
  const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\\b)`;
  const orsVolume = /(?<=\<mso:Volume[^>]*\>)([^<]*)(?=\<)/
  const orsTitle = /(?<=\<mso:ORS_x0020_Chapter[^>]*\>)([^<]*)(?=\<)/
  const chapMatch = new RegExp(`(?<=Chapter\\s)${orsChapter}`);
  const thisChapter = ifMatch(chapMatch, headHTML);
  const thisVolume = ifMatch(orsVolume, headHTML);
  const thisTitle = ifMatch(orsTitle, headHTML);
  const doubleP = /<(\w)[^>]*?>(?:&nbsp;|\s)*<\/\1>/g; // is deleted (in first HTMLCleanUp & FinalClean)
  HTMLCleanUp(); // delete stylesheet & references to it and confusing span syntex from HTML
  function HTMLCleanUp() {
    document.head.remove("style");
    document.head.remove("title");
    chpHTML = document.body.innerHTML;
    const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
    const msoGarb = /<p\sclass=\W?Mso[^>]*>/g; // is replaced by:
    const msoRepl = "<p class=default>";
    const divGarb = /<div[^>]*?>/g; // is deleted
    chpHTML = chpHTML.replace(/(\n|\r|\f)/g, " ");
    chpHTML = chpHTML.replace(/\s\s/, " ");
    chpHTML = chpHTML.replace(styleGarb, "$1");
    chpHTML = chpHTML.replace(msoGarb, msoRepl);
    chpHTML = chpHTML.replace(divGarb, "");
    chpHTML = chpHTML.replace(doubleP, "");
  }
  ChapterHeadings(); // Add tags to volume title & ORS chapter & edition year; set title displayed on tab
  function ChapterHeadings() {
    const chapMainHead = new RegExp(
      `<p class=default>(Chapter\\s(${thisChapter})\\s—?\\s?([^]*?))<\\/p>`
    ); // is replaced by:
    const mainHeadRepl = "<title>ORS $2 $3</title><h1>$1</h1>";
    const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/; // is replaced by:
    const yearRepl = "</h1><h3>$1</h3>";
    const title =
      /<h1>([^]*?)<\/h1>[^]*?(<h3>[^]*?<\/h3>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/; //is replaced by:
    const titleRepl = `<h2>Volume ${thisVolume}</h2><h2>Title ${thisTitle}</h2><h1>\$1</h1>\$2`;
    chpHTML = chpHTML.replace(chapMainHead, mainHeadRepl);
    chpHTML = chpHTML.replace(edYear, yearRepl);
    chpHTML = chpHTML.replace(title, titleRepl);
  }
  TableOfContents();
  function TableOfContents() {
    //create & label new division for table of contents
    const tocFind =
      /(?<=<\/h2>[^]*?)(<p[^>]*?>[^]*?<\/p>)([^]*?)(?=\1|<p class=default><b>)/; // is replaced by:
    const tocRepl =
      "<div id=toc><h1>Table of Contents</h1><div class=tocItems>$1$2</div></div>?#@";
    chpHTML = chpHTML.replace(tocFind, tocRepl);
  }
  ORSHighlight();
  function ORSHighlight() {
    //highlight all cross references to ORS sections (xx.xxx) (to be replaced later by relevant links)
    const orsFind = new RegExp(
      `(${orsSection}((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)`,
      "g"
    ); // is replaced by:
    const orsRepl = "<span class=ors>$1</span>";
    chpHTML = chpHTML.replace(orsFind, orsRepl);
  }
  Leadlines();
  function Leadlines() {
    //highlight & create new div for each new section
    const orsSecLead = `(?:<span class=ors>)(${thisChapter}\\.\\d{3,4}\\b)\\s?</span>([^\\.][^\\]]+?\\.\\s?)`;
    const leadFind = new RegExp(
      `<p class=default><b>${tabs}${orsSecLead}</b>`,
      "g"
    );
    const leadRepl =
      '</div><div class=section break="~"><button id="$1" class="collapsible"><p class=leadline>$1$2</p></button><p class=default>';
    chpHTML = chpHTML.replace(leadFind, leadRepl);
  }
  Forms();
  function Forms() {
    // find beginning and end of forms to create new div for each
    const startForm = new RegExp(
      `(form[^]*?:)<\\/p>${tabs}(<p[^>]*>)_{78}`,
      "g"
    ); // finds start of form
    const startFormRepl = "$1</p><div class=orsForm break='`'>$2"; //inserts it as a new div
    const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g;
    const endFormRepl = "$1</div break='`'>";
    const endFormCleanup = /(_{78}<\/div>)/g;
    chpHTML = chpHTML.replace(startForm, startFormRepl);
    chpHTML = chpHTML.replace(endForm, endFormRepl);
    chpHTML = chpHTML.replace(endFormCleanup, "$1");
  }
  orsInChapLink();
  function orsInChapLink() {
    // change xrefs to ORS sections in chapter to links to #id of ORS section
    const orsInChp = new RegExp(
      `<span class=ors(>(${thisChapter}\\.\\d{3,4}\\b)[^]*?<\\/)span`,
      "g"
    );
    const orsInChpRepl = '<a class=ors href="#$2"$1a';
    chpHTML = chpHTML.replace(orsInChp, orsInChpRepl);
  }
  orsOutChapLink();
  function orsOutChapLink() {
    // change xrefs to ORS sections outside chapter to links to ORS chapter external webpage.
    let listOfORSChps = [];
    const orsOrLegURL = "https://www.oregonlegislature.gov/bills_laws/ors/ors";
    const notChap = new RegExp(`=ors>${orsChapter}`, "g");
    let temp = chpHTML;
    for (let i = 0; i < 500; i++) {
      //getting list of referenced ORS sections not in this chapter & chapter for each
      if (notChap.test(temp)) {
        let chapNo = ifMatch(notChap, temp).match(new RegExp(orsChapter)); // finds chapter to match
        listOfORSChps.push(chapNo);
        temp = temp.replace(new RegExp(">" + chapNo + "\\.", "g"), "XXX"); // removes chapter so it doesn't get picked up again
      } else {
        break;
      }
    }
    function onlyUnique(value, index, self) {
      // removing duplicates from the list of ORS chapters
      return self.indexOf(value) === index;
    }
    listOfORSChps = listOfORSChps.filter(onlyUnique);
    if (listOfORSChps.length > 0) {
      for (let eachORSChp of listOfORSChps) {
        let orsOutChp = new RegExp(
          "<span class=ors>((" + eachORSChp + "\\.\\d{3,4}\\b)[^]*?)<\\/span>",
          "g"
        );
        let orsOutChpRepl = `<a href="${orsOrLegURL}00${eachORSChp}.html#$2">$1</a>`;
        chpHTML = chpHTML.replace(orsOutChp, orsOutChpRepl);
        chpHTML = chpHTML.replace(/\d+(\d{3}[A-C]?\.html)/g, "$1");  // removing excess zeros until padded to exactly 3 digits
      }
    }
  }
  SeparateTOC(); //separate TOC & chapter heading from rest of body to facilitate editing body
  function SeparateTOC() {
    headAndTOC = ifMatch(/[^]*?(?=\?#@)/, chpHTML); // copy TOC to own variable
    chpHTML = chpHTML.replace(/[^]*?\?#@/, ""); // and remove it from the editing document
  }
  SubUnits();     // finds and classifies subunits (subsections, paragraphs, subsections etc.)
  function SubUnits() {
    
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
    chpHTML = chpHTML.replace(subsecFind, subsecRepl);
    chpHTML = chpHTML.replace(subsubPara, subsubRepl);
    chpHTML = chpHTML.replace(subsubsubPara, subsubsubRepl);
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
      chpHTML = chpHTML.replace(sameLtrLower, ltrLowerRepl);
      chpHTML = chpHTML.replace(sameLetterUpper, ltrUpperRepl);
      Roman_wrapper: {
        let breakIf = (romanNum) => {
          // ensure that when matches dry up, stop looking for more
          return new RegExp(`/\(${romanNum}\)/`).test(chpHTML);
        };
        if (breakIf("ii")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(iiLower, iiRepl);
        chpHTML = chpHTML.replace(iiiLower, romanLowerRepl);
        chpHTML = chpHTML.replace(vLower, romanLowerRepl);
        chpHTML = chpHTML.replace(xLower, romanLowerRepl);
        chpHTML = chpHTML.replace(xxLower, romanLowerRepl);
        if (breakIf("II")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(IIUpper, IIRepl);
        if (breakIf("III")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(IIIUpper, romanUpperRepl);
        if (breakIf("V")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(VUpper, romanUpperRepl);
        if (breakIf("X")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(XUpper, romanUpperRepl);
        if (breakIf("XX")) {
          break Roman_wrapper;
        }
        chpHTML = chpHTML.replace(XXUpper, romanUpperRepl);
      }
    }
    LittleL();
    function LittleL() {
      // reclasses (L) as paragraph if following (k)
      const lilL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g;
      const lilLRepl = "$1=para";
      chpHTML = chpHTML.replace(lilL, lilLRepl);
    }
  }
  headingReformat();
  function headingReformat() {
    // classify HEADINGS and (Subheadings) and (Temporary Labels)-
    const headingFind = /<p class=default>([A-Z][^a-z]{3,}?)<\/p>/g; //Replaces 3+ initial capital letters with:
    const headingRepl =
      "#hclose#</div><div class=headingDiv><p class=headingLabel><b>$1</b></p><div>";
    const tempSec = /p class=default>(\(Temporary\sprovisions[^~]*?<\/)p/g; //Replaces "(Temporary provisions ..." with:
    const tempSecRepl = 'div class=TempHead style="text-align:center">$1div';
    const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g; //Replaces leading parens with at least 5 letters with:
    const subheadRepl =
      "#sclose#</div><div class=subheadDiv><p class=subheadLabel>$1</p><div>";
    const headInTOCRepl = "<p class=tocHeading>$1</p>";
    const headInForm =
      /(=orsForm break=\'\`\'[^`~]*)#hclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count headings to get "<div> breaks to line up"
    const subheadInForm =
      /(=orsForm break=\'\`\'[^`~]*)#sclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count subheadings
    chpHTML = chpHTML.replace(headingFind, headingRepl);
    chpHTML = chpHTML.replace(tempSec, tempSecRepl);
    chpHTML = chpHTML.replace(subheadFind, subheadRepl);
    headAndTOC = headAndTOC.replace(headingFind, headInTOCRepl);
    headAndTOC = headAndTOC.replace(subheadFind, headInTOCRepl);
    while (headInForm.test(chpHTML) || subheadInForm.test(chpHTML)) {
      // replaces headings found within forms (which probably aren't actual headings) with with:
      chpHTML = chpHTML.replace(headInForm, "$1<p class=formHeading>$2");
      chpHTML = chpHTML.replace(subheadInForm, "$1<p class=default>$2");
    }
    headingDivs();
    function headingDivs() {
      // makes sure that all headings & subheading <divs> are closed exactly once. Could break if there's a subheading w/o heading
      const closeHeadTags = /(#hclose#|#sclose#)/;
      let hCount = 0;
      while (closeHeadTags.test(chpHTML)) {
        let divHeadClose = "";
        let nextTag = ifMatch(closeHeadTags, chpHTML);
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
        chpHTML = chpHTML.replace(closeHeadTags, divHeadClose);
      }
    }
  }
  Notes();
  function Notes() {
    // finds Note: in ORS & classes; finds note secs; Adds hyperlinks for Preface to ORS & vol22
    const noteFind = new RegExp(
      "<p[^>]*>\\s?<b>" + tabs + "(Note(\\s\\d)?:\\s?<\\/b>[^]*?<\\/p>)",
      "g"
    ); // Finds "Note:" or "Note #:"; is replaced by:
    const noteRepl = "<div class=note><b>$1</div>";
    const noteSec = new RegExp(
      `<\\/div>${tabs}<p[^>]*?><b>${tabs}(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>([^~]*?)<div`,
      "g"
    ); // Finds bold ORS links w/o leadline; is replaced by:
    const noteSecRepl =
      "<p class=default><b>Note section for ORS $1:</b></p><p class=default>$2</div><div";
   
    const noteSesLaw =
      /(class=note>[^~]*?Section[^~]*?provides?:)[^~]*?<\/div>([^~]*?)<div/g;
    const noteSesLawRepl = "$1$2</div><div";
    const prefaceFind = /(Preface\sto\sOregon\sRevised\sStatutes)/g; // "preface" is replaced by link:
    const prefaceRepl =
      '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
    const v22Find =
      /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // CST is replaced by link:
    const v22Repl =
      '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
    chpHTML = chpHTML.replace(noteFind, noteRepl);
    chpHTML = chpHTML.replace(noteSec, noteSecRepl);
    chpHTML = chpHTML.replace(noteSesLaw, noteSesLawRepl);
    chpHTML = chpHTML.replace(prefaceFind, prefaceRepl);
    chpHTML = chpHTML.replace(v22Find, v22Repl);
    const subsecOne = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;  
    const subsecRepl = "<p class=subsec>$1</p>";
    chpHTML = chpHTML.replace(subsecOne, subsecRepl);
  }
  sourceNotesRepl();
  function sourceNotesRepl() {
    // Find source notes and classify
    const sourceNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
    const sourceNoteRepl = "<p class=sourceNote>$1</p>";
    chpHTML = chpHTML.replace(sourceNote, sourceNoteRepl);
    burntORS();
    function burntORS() {
      // Find burnt ORS (repealed/renumbered) and classify
      const burntOrs =
        /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g;
      const burntOrsRepl = "</div><div class='burnt' id='$1'>$1: ";
      chpHTML = chpHTML.replace(burntOrs, burntOrsRepl);
    }
  }
  finalCleanUp();
  function finalCleanUp() {
    // dump HTML back into document, clean up double returns & classify TOC paragraphs
    document.body.innerHTML = headAndTOC + chpHTML;
    document.body.innerHTML = document.body.innerHTML.replace(doubleP, "");
    let tocID = document.getElementById("toc");
    if (Boolean(tocID)) {
      let allTocPs = tocID.getElementsByTagName("p");
      for (let aP of allTocPs) {
        aP.className += " toc";
      }
    }
  }
  OrLawLinking(); // get user data for OrLaws for link for 'year c.###' & 'chapter ###, Oregon Laws [year]'
  function OrLawLinking() {
    // @ts-ignore
    let backgroundPort = chrome.runtime.connect(); // open port to background.cs
    backgroundPort.postMessage({ message: "RequestOrLawsSource" });
    backgroundPort.onMessage.addListener((msg) => {
      if (msg.response == "Hein") {
        HeinLinks(); // replace with URL to HeinOnline search link through SOLL
      } else if (msg.response == "OrLeg") {
        OrLeg(); // replace with URL to Or.Leg.
      } 
      javaDOM(); // Add buttons & javascript elements
    });
    function HeinLinks() {
      const heinURL =
        "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
      const orLawH1 = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
      const orLawH1Repl = "<a href=" + heinURL + ">$&</a>";
      const heinURL2 =
        "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
      const orLawH2 = /(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g;
      const orLawH2Repl = "<a href=" + heinURL2 + ">$&</a>";
      chpHTML = document.body.innerHTML;
      chpHTML = chpHTML.replace(orLawH1, orLawH1Repl);
      chpHTML = chpHTML.replace(orLawH2, orLawH2Repl);
      document.body.innerHTML = chpHTML;
    }
    function OrLeg() {
      const orLegURL =
        '<a href="https://www.oregonlegislature.gov/bills_laws/lawsstatutes/';
      const urlTail = '">$&</a>';
      const orLawSourceNoteTail = "\\W+c\\.\\W*(\\d{1,4})";
      const yearOrLawChpHead = "(?:C|c)hapter\\s(\\d{1,4}),\\sOregon\\sLaws\\s";
      chpHTML = document.body.innerHTML;
      function orLawReplacer(yearRegExp, strFormat) {
        let orLawSourceNote = new RegExp(yearRegExp + orLawSourceNoteTail, "g");
        let yearOrLawChp = new RegExp(yearOrLawChpHead + yearRegExp, "g");
        let orLawRepl = orLegURL + strFormat + urlTail;
        chpHTML = chpHTML.replace(orLawSourceNote, orLawRepl);
        chpHTML = chpHTML.replace(
          yearOrLawChp,
          orLawRepl.replace(/(\$1)([^]*?)(\$2)/, "$3$2$1")
        );
      }
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
      removeExtraZeros() // Make sure chapter is padded to exactly 4 digits
      function removeExtraZeros () {
        const xtraZeros = /(aw|adv)\d+(\d{4})/g;
        const xtraZerosRepl = "$1$2";
        chpHTML = chpHTML.replace(xtraZeros, xtraZerosRepl);
      }
      document.body.innerHTML = chpHTML;
    }
  }
}

function javaDOM() {
  const collapsibles = document.getElementsByClassName("collapsible");
  function collapseAllSections(doAddButton) {
    for (let i = 0; i < collapsibles.length; i++) {
      const buttonElement = collapsibles[i];
      const sectionDiv = buttonElement.parentNode;
      const collapseHeight = `${buttonElement.scrollHeight}px`;
      //TODO: Convert maxheight into changing classes to make text hidden, so resizing won't mess with things
      //TODO: Alternatively, just make "active" unhide text
      sectionDiv.style.maxHeight = collapseHeight; //
      buttonElement.classList.remove("active");
      if (doAddButton) {
        buttonElement.addEventListener("click", () => {
          
          if (sectionDiv.style.maxHeight == collapseHeight) {  
            expandSingle(buttonElement)
          } else {
            sectionDiv.style.maxHeight = collapseHeight;
            buttonElement.classList.remove("active");
          }
        });
      }
    }
  }
  function expandAllSections() {
    for (let i = 0; i < collapsibles.length; i++) {
      expandSingle(collapsibles[i]);
    }
  }
  buildCollapseToggeButtons(); // build button by which leadlines collapse & expand section below
  function buildCollapseToggeButtons() {
    collapseAllSections(true);
  }
  buildOrsLinkButton(); //adds button element to internal link ORS to expand target upon selection
  function buildOrsLinkButton() {
    let aLinkOrs = document.getElementsByClassName("ors");
    for (let i = 0; i < aLinkOrs.length; i++) {
      const aLink = aLinkOrs[i];
      const buttonElement = document.getElementById(aLink.innerText);
      if (buttonElement) {
        // dealing with issues caused if there is a reference to ORS section that does not exist
        if (buttonElement.classList.contains("collapsible")) {
          // dealing with reference to ORS section that is burnt
          aLink.addEventListener("click", () => {
            expandSingle(buttonElement)
          });
        };
      }
    }
  }
  buildFixedDiv(); // add floating div with version info & buttons
  function buildFixedDiv() {
    let fixedDiv = document.createElement("div");
    fixedDiv.classList.add("fixed");
    let versionPar = document.createElement("p");
    //@ts-ignore
    let manifest = chrome.runtime.getManifest();
    let thisVersion = manifest.version;
    versionPar.classList.add("version");
    versionPar.innerHTML = `style markup by <a href="https://github.com/rmauger/mORS/#readme">mORS<\/a> v.${thisVersion}`;
    fixedDiv.appendChild(versionPar);
    addExpandButton(); // "Expand all" button
    function addExpandButton() {
      var expandAllButton = document.createElement("button");
      expandAllButton.innerText = "Expand all";
      expandAllButton.id = "buttonExpand";
      fixedDiv.appendChild(expandAllButton);
      expandAllButton.addEventListener("click", () => expandAllSections());
    }
    AddCollapseButton(); // "Collapse all" button
    function AddCollapseButton() {
      var collapseAllButton = document.createElement("button");
      collapseAllButton.innerText = "Collapse all";
      collapseAllButton.id = "buttonCollapse";
      fixedDiv.appendChild(collapseAllButton);
      collapseAllButton.addEventListener("click", () =>
        collapseAllSections(false)
      );
    }
    cssToggleButton(); // "Remove Style" or "Add Style" button
    function cssToggleButton() {
      var toggleCSSButton = document.createElement("button");
      toggleCSSButton.innerHTML = "Remove Style";
      toggleCSSButton.classList.add("cssOn");
      toggleCSSButton.id = "buttonToggleCSS";
      fixedDiv.appendChild(toggleCSSButton);
      toggleCSSButton.addEventListener("click", () => {
        if (toggleCSSButton.classList.contains("cssOn")) {
          expandAllSections();
          document.getElementById("buttonCollapse").style.display = "none";
          document.getElementById("buttonExpand").style.display = "none";
          document.getElementById("buttonToggleCSS").innerText = "Add Style";
          //@ts-ignore
          chrome.runtime.sendMessage({ message: "removeCSS" }); // sends message to background.js
        } else {
          document.getElementById("buttonCollapse").style.display = "inline";
          document.getElementById("buttonExpand").style.display = "inline";
          document.getElementById("buttonToggleCSS").innerText = "Remove Style";
          StyleSheetRefresh();
          collapseAllSections(false);
        }
        toggleCSSButton.classList.toggle("cssOn");
      });
    }
    document.body.appendChild(fixedDiv); 
  }
}

function expandSingle(buttonElement) {
  if (buttonElement) {
    if (buttonElement.classList.contains("collapsible")) {
      const sectionDiv = buttonElement.parentElement;
      buttonElement.classList.add("active");
      sectionDiv.style.maxHeight = `${sectionDiv.scrollHeight}px`;
    } else {
      console.log ("Target " + buttonElement.innerHTML + " was not an active section")
    }
  } else {
    console.log("")
  }
}

function StyleSheetRefresh() {
  // @ts-ignore
  chrome.runtime.sendMessage({ message: "updateCSS" }, () => {
    getTabURL();  //send message to background.js to see if there is an initial pincite in URL & navigates.
  });
}

function getTabURL() {
  //@ts-ignore
  let backgroundPort = chrome.runtime.connect({ name: "OrLawsSource" }); //open port to background.js
  backgroundPort.postMessage({ message: "RequestTagURL" });
  backgroundPort.onMessage.addListener((msg) => {
    const tabUrl = msg.response;
    if (tabUrl) {
      const idFinder = /(?<=\.html\#)[^\/]*/;
      if (idFinder.test(tabUrl)) {
        const orsPinCite = 0;
        pinCiteButton = document.getElementById(ifMatch(idFinder, tabUrl))
        if (pinCiteButton && pinCiteButton!='~N/A~') {
          // dealing with issue if pincite does not point to valid ID
          expandSingle(pinCiteButton);
          pinCiteButton.scrollIntoView()
        }
      }
    }
  });
}
