//syncclean.js
//@ts-check

function SyncReplaceText() {
  function htmlCleanup() {
    body.replacerAll(/(\n|\r|\f)/, " "); // removes line breaks
    body.replacerAll(/\s\s/, " "); // removes double spaces
    body.replacerAll(/\s\s/, " "); // removes left over double spaces
    body.replacerAll(/<span style=[^]+?>([^]+?)<\/span>/, "$1"); // deletes span style=;
    body.replacerAll(/<p\sclass=\W?Mso[^>]*>/, "<p class=default>"); // all paragraph classes => default
    body.replacerAll(/<div[^>]*?>/, ""); // deletes existing <div> tags
    body.replacerAll(`<(\\w)[^>]*?>${tabs}<\\/\\1>`, ""); // deletes empty nodes
  }
  function chapterHeadRepl() {
    let htmlTitle;
    htmlTitle = document.head.getElementsByTagName("title")[0];
    if (htmlTitle == undefined) {
      htmlTitle = document.createElement("title");
      document.head.appendChild(htmlTitle);
    }
    const edYearMatch = "20\\d{2}(?=\\sEDITION)";
    const thisEdYear = ifRegExMatch(new RegExp(edYearMatch), body.aHtml);
    const chapterMatch = new RegExp(
      `Chapter\\s(${orsChapter})\\s—([^<]*)`,
      "u"
    );
    thisChapterNum = ifRegExMatch(chapterMatch, body.aHtml, 0, 1);
    const thisChapterName = ifRegExMatch(chapterMatch, body.aHtml, 0, 2);
    htmlTitle.innerHTML = `${thisChapterNum}: ${thisChapterName}`;
    body.replacerOne(
      `[^]*?${edYearMatch}[^.]*?<p[^.]*?<p[^.]*?<p`, // end of head is 3 paragraphs after "(20XX Edition)" (only replacing 1st instance)
      "<p"
    );

    // returning new heading
    return `<div class=mainHead><h1>Chapter ${thisChapterNum} - ${thisChapterName}</h1><h3>${thisEdYear} EDITION</h3></div>`;
  }
  const createTOC = () => {
    body.replacerOne(
      /(<p[^>]*?>[^]*?<\/p>)([^]*?)(?=\1|<p class=default><b>)/, // finds table of contents (first repeated paragraph)
      `<div id=toc><h1>Table of Contents</h1><div class=tocItems>\$1\$2</div></div>${tocBreak}` // replaced with new <div> for TOC & "tocBreak" so TOC can be separated out later
    );
  };
  function classifyOrsRefs() {
    body.replacerAll(
      `(${orsSection}((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)`, // finds all ORS references plus subs (e.g., 90.505 (2)(a))
      "<span class=ors>$1</span>" // wraps them in span class=ors
    );
  }
  function classLeadlines() {
    body.replacerAll(
      `<p class=default><b>${tabs}(?:<span class=ors>)(${thisChapterNum}\\.\\d{3,4}\\b)\\s?</span>([^\\.][^\`\\]~]+?)</b>`, // leadlines (<b>+tab+ors.sec+space+leadline+</b>)
      '</div><div class=section break="~"><button id="$1" class="collapsible"><p class=leadline>$1$2</p></button><p class=default>' // wrap in collapsible button
    );
  }
  function createFormDivs() {
    const endFormCleanup = body.replacerAll(
      `(form[^]*?:)<\\/p>${tabs}(<p[^>]*>)_{78}`, // finds starts of form);
      "$1</p><div class=orsForm break='`'>$2" // puts in new div with class=orsForm
    );
    body.replacerAll(
      /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/, // finds ends of form
      "$1</div break='`'>" // closes div
    );
    body.replacerAll(/_{78}(<\/div>)/, "$1"); // removes ending form underlines _____
  }
  function orsInChapLink() {
    body.replacerAll(
      `<span class=ors(>(${thisChapterNum}\\.\\d{3,4}\\b)[^]*?<\\/)span`, // finds ORS references to ORS within chapter
      '<a class=ors href="#$2"$1a' // creates link to ORS #tag
    );
  }
  function orsOutChapLink() {
    body.replacerAll(
      `span\\sclass=ors>((${orsChapter}).\\d{3}\\b|(\\b7\\dA?)\\.\\d{4}\\b)<\\/span`, // find ORS references to ORS outside chapter
      `a href="https://www.oregonlegislature.gov/bills_laws/ors/ors00$2$3.html#$1">$1</a` // create link to external chapter
    );
    body.replacerAll(/(ors)0+(\d{3})/, "$1$2"); // delete any extra zeros in link URLs
  }
  function separateToc() {
    theTOC.aHtml = ifRegExMatch(`<div id[^]*(?=${tocBreak})`, body.aHtml); // copy TOC to own variable
    body.replacerOne(`${theTOC.aHtml.slice(0, 50)}[^]*${tocBreak}`, ""); // and remove it from the body document
    if (theTOC.aHtml == "")
      warnCS("No table of contents found", "syncclean.js", "separateTOC");
  }
  function classifySubunits() {
    body.replacerAll(
      `<p[^>]*?>${tabs}?\\s?(\\(\\d{1,2}\\)[^]+?)</p>`, // finding paragraphs starting with subsections (e.g., (2), (14))
      "<p class=subsec>$1</p>" // classifying as subsection
    );
    body.replacerAll(
      `<p[^>]*?>${tabs}\\s?(\\([a-z]{1,5}\\)[^]+?)</p>`, // lower case letters (e.g., (a), (v), (bb), (iv))
      "<p class=subsubpara>$1</p>" // classifying all as sub-sub-paragraphs (lowercase roman) for now
    );
    body.replacerAll(
      `<p[^>]*?>${tabs}\\s?(\\([A-Z]{1,5}\\)[^]+?)</p>`, // upper case letters (e.g., (A), (V), (BB), (IV))
      "<p class=subsubsubpara>$1</p>" // classifying all as sub-sub-subparagraphs (uppercase roman) for now
    );
    body.replacerAll(
      /=subsubpara>(\(([a-z])(?:\2){0,3}\))/, // lowercase duplicates only (e.g., (a), (cc), (iii), (zzzz))
      "=para break='!'>$1" // reclassing all as paragraphs (lowercase) and adding "!" tag
    );
    body.replacerAll(
      /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/, // uppercase (A) through ZZZZ
      "=subpara break='?'>$1" // reclassing all as subparagraphs (uppercase) and adding "?" tag
    );
    (function romanNums() {
      const romanLowerLead = "((=subsubpara>[^!~]*))=para[^>]*?>(?=\\("; // common data in para that needs converted to roman
      const romanLowerRepl = "$1=subsubpara>";
      const romanUpperLead = "((subsubsubpara>[^~!?]*))=subpara[^>]*>(?=\\("; // upper case
      const romanUpperRepl = "$1=subsubsubpara>";
      // ensure that when matches dry up, stop looking for more
      const doBreak = (/** @type {string} */ romanNum) =>
        new RegExp(`/\(${romanNum}\)/`).test(body.aHtml);
      if (doBreak("ii")) return; // if there are no (ii) in document, stop looking for roman numerals0
      body.replacerAll(
        /=para[^>]*>((?:\([A-Z]\))?\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/, // [(X)](i) through (ii) (if no breaks "!~")
        "=subsubpara>$1=subsubpara>" // both are sub-sub-paragraphs
      );
      body.replacerAll(romanLowerLead + "iii)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "v)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "x)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "xx)", romanLowerRepl);
      if (doBreak("II")) return; // if there are no (II) in document, done looking
      body.replacerAll(
        /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/, // (I) through (II) (if no breaks "?~")
        "=subsubsubpara>$1=subsubsubpara>"
      );
      if (doBreak("III")) return;
      body.replacerAll(romanUpperLead + "III)", romanUpperRepl);
      if (doBreak("V")) return;
      body.replacerAll(romanUpperLead + "V)", romanUpperRepl);
      if (doBreak("X")) return;
      body.replacerAll(romanUpperLead + "X)", romanUpperRepl);
      if (doBreak("XX")) return;
      body.replacerAll(romanUpperLead + "XX)", romanUpperRepl);
    })();
    body.replacerAll(
      /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/, // big (L) following directly after a little (k)
      "$1=para" // reclass as paragraph
    );
  }
  function headingReformat() {
    // counts headings & subheadings to make sure that all <divs> close properly
    function headingDivs() {
      const closeHeadTags = /(#hclose#|#sclose#)/;
      let hCount = 0;
      while (closeHeadTags.test(body.aHtml)) {
        let divHeadClose = "";
        let nextTag = ifRegExMatch(closeHeadTags, body.aHtml); //helper.js
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
        body.replacerOne(closeHeadTags, divHeadClose);
      }
    }
    // Main headingReformat
    const headFind = /<p class=default>([A-Z][^a-z]{3,}?)<\/p>/g; //Heading (4+ initial capital letters)
    const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g; //Replaces leading parens with at least 5 letters with:

    //headings in body
    body.replacerAll(
      headFind,
      "#hclose#</div><div class=heading><p class=headingLabel><b>$1</b></p><div>" // #hclose tag helps readjust heading divs at cleanup
    );
    body.replacerAll(
      /p class=default>(\(Temporary\sprovisions[^~]*?<\/)p/, // "(Temporary provisions ...) with:
      'div class=TempHead style="text-align:center">$1div' //
    );
    body.replacerAll(
      subheadFind,
      "#sclose#</div><div class=subhead><p class=subheadLabel>$1</p><div>" // #tag helps readjust heading divs at cleanup
    );
    //replace headings in TOC
    const headInTOCRepl = "<p class=tocHeading>$1</p>";
    theTOC.replacerAll(headFind, headInTOCRepl);
    theTOC.replacerAll(subheadFind, headInTOCRepl);
    //"headings" (namely things that look like them) in forms
    const headInForm =
      /(=orsForm break=\'\`\'[^`~]*)#hclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count headings to get "<div> breaks to line up"
    const subheadInForm =
      /(=orsForm break=\'\`\'[^`~]*)#sclose#[^`~]*?<p[^`~>]*>([^`~]*?)<div>/g; //Used to count subheadings
    // replaces headings found within forms (which probably aren't actual headings):
    while (headInForm.test(body.aHtml) || subheadInForm.test(body.aHtml)) {
      // TODO - Probably (maybe) this is source of bug? Maybe needs to run 2x? Or running form thing twice? Ugh.
      body.replacerOne(headInForm, "$1<p class=formHeading>$2");
      body.replacerOne(subheadInForm, "$1<p class=default>$2");
    }
    headingDivs(); // makes sure all headings & subheading <divs> are closed exactly once. Ensure no subheading w/o heading
  }
  function notesRepl() {
    body.replacerAll(
      "<p[^>]*>\\s?<b>" + tabs + "(Note(\\s\\d)?:\\s?<\\/b>[^]*?<\\/p>)", // "Note:" or "Note #:" paragrph
      "<div class=note><b>$1</div>" // put paragraph only in bold note div
    );
    body.replacerAll(
      `<\\/div>${tabs}<p[^>]*?><b>${tabs}(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>([^~]*?)<div`, // Bold ORS links w/o leadline (i.e. note sections)
      "<p class=default><b>Note section for ORS $1:</b></p><p class=default>$2</div><div" // Notify that it's note section; move <div> close to end
    );

    for (let i = 0; i < 2; i++) {
      // running twice to deal with issue of neighboring temp sections ending w/ div that starts next
      body.replacerAll(
        /<div\sclass=note>([^~]*?Section[^~]+?provides?:)[^~]*?<\/div>([^~]*?)<div/, // session law preamble (Section xx, chapter xx ... provides:)
        "</div><div class='note notesec'>$1$2<div" // close previos div; put in separate note div classed as "notesec"
      );
    }
    body.replacerAll(
      `<b>${tabs}(Sec\\.\\s\\d{1,3}\\.[^>\\]]*?)<\\/b>`, // session law sections (E.g., "Sec. 14.") plus leadline, if any
      "<p class=leadline>$1</p><p class=default>" // reclassed as leadline (whether there is a leadline or not) but not collapsible (yet)
    );
    body.replacerAll(
      /(Preface\sto\sOregon\sRevised\sStatutes)/, // "Preface to ORS text"
      '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>' // Links to preface pdf
    );
    body.replacerAll(
      /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/, // "CST" references in text is replaced by link:
      '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>' // links to ORS page to search for CST (not great, can't find better option)
    );
    body.replacerAll(
      /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/, // all subsection (1) (which weren't picked up before because they didn't start paragraph)
      "<p class=subsec>$1</p>" // classed as subsections
    );
  }
  function sourceNotesRepl() {
    body.replacerAll(
      /(\[(19\d{2}|20\d{2}|Sub|Fo|Re|Am)[^]+?\]<\/p>)/, //source notes
      "<p class=sourceNote>$1</p>"
    ); // labled as source notes
    body.replacerAll(
      /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/, // source notes that are renumbered/repealed (rsecs)
      "</div><div class='burnt' id='$1'><b>$1:</b> " // label as burnt
    );
  }
  // MAIN sync Clean
  // Global variables
  let thisChapterNum;
  const tocBreak = "!@%";
  const tabs = "(?:&nbsp;|\\s){0,8}";
  const orsChapter = "\\b[1-9]\\d{0,2}[A-C]?\\b";
  const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\\b)`;
  let body = wordObj(document.body.innerHTML);
  let theTOC = wordObj();
  // run functions
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
  // returns cleanedup Heading, TOC & body as object
  return {
    Head: mainHead,
    TOC: theTOC.aHtml,
    Body: body.aHtml,
  };
}
