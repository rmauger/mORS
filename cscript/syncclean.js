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
      const endOfHead = new RegExp(`[^]*?${edYearMatch}[^.]*?<p[^.]*?<p[^.]*?<p`); // end of head is 3 paragraphs > edition "(2019 Edition)"
      const preTitleMatch = new RegExp(`[^]*?Chapter\\s${thisChapterNum}`);
      const preTitle = ifRegExMatch(
        new RegExp(`[^]*?(?=Chapter\\s${thisChapterNum})`),
        ifRegExMatch(preTitleMatch, bodyHtml)
      );
      document.head.getElementsByTagName('title')[0].innerHTML = `${thisChapterNum}: ${thisChapterTitle}`;
      bodyHtml = bodyHtml.replace(endOfHead, "<p"); //deleting existing heading in text
      return `<div class=mainHead>${preTitle}<h3>Volume ${thisVolume}</h3><h2>Title ${thisTitle}</h2>
      <h1>Chapter ${thisChapterNum} - ${thisChapterTitle}</h1><h3>${thisEdYear} EDITION</h3></div>`;
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
          /=para[^>]*>((?:\([A-Z]\))?\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/g; // reclassify matching [(X)](i) & (ii) to:
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
      function LittleL() {
        // reclasses (L) as paragraph if following (k)
        const lilL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g;
        const lilLRepl = "$1=para";
        bodyHtml = bodyHtml.replace(lilL, lilLRepl);
      }
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
      LittleL();
    }
    function headingReformat() {
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
      // Main headingReformat
      const headingFind = /<p class=default>([A-Z][^a-z]{3,}?)<\/p>/g; //Replaces 4+ initial capital letters with:
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
        // replaces headings found within forms (which probably aren't actual headings) with:
        bodyHtml = bodyHtml.replace(headInForm, "$1<p class=formHeading>$2");
        bodyHtml = bodyHtml.replace(subheadInForm, "$1<p class=default>$2");
      }
      headingDivs(); // makes sure that all headings & subheading <divs> are closed exactly once. Ensure no subheading w/o heading
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
      const subsecOne = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
      const subsecRepl = "<p class=subsec>$1</p>";
      bodyHtml = bodyHtml.replace(noteFind, noteRepl);
      bodyHtml = bodyHtml.replace(noteSec, noteSecRepl);
      bodyHtml = bodyHtml.replace(noteSesLaw, noteSesLawRepl);
      bodyHtml = bodyHtml.replace(SesLawSec, SesLawSecRepl);
      bodyHtml = bodyHtml.replace(prefaceFind, prefaceRepl);
      bodyHtml = bodyHtml.replace(v22Find, v22Repl);
      bodyHtml = bodyHtml.replace(subsecOne, subsecRepl);
    }
    function sourceNotesRepl() {
      function burntORS() {
        const burntOrs =
          /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g;
        const burntOrsRepl = "</div><div class='burnt' id='$1'><b>$1:</b> ";
        bodyHtml = bodyHtml.replace(burntOrs, burntOrsRepl);
      }
      const sourceNote = /(\[(19\d{2}|20\d{2}|Sub|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
      const sourceNoteRepl = "<p class=sourceNote>$1</p>";
      bodyHtml = bodyHtml.replace(sourceNote, sourceNoteRepl);
      burntORS(); // Find burnt ORS (repealed/renumbered, aka rsecs) and classify
    }
    let bodyHtml = "";
    let headAndToc = "";
    let thisChapterNum = "";
    const tocBreak = "!@%";
    const tabs = "(?:&nbsp;|\\s){0,8}";
    const orsChapter = "[1-9]\\d{0,2}[A-C]?\\b";
    const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\\b)`;
    htmlCleanup(); // delete span syntex & msoClasses & existing divs & empty tags from HTML
    const mainHead = chapterHeadRepl(); // Replace heading at top of page.
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
      mainhead: mainHead,
      headAndToc: headAndToc,
      body: bodyHtml,
    };
  }