//syncClean.js
//@ts-check

function SyncReplaceText() {
  
  /** Strip existing html garbage (span syntax & msoClasses & existing divs & empty tags() */
  const htmlCleanup = () => {
    body.replacerAll(/(\n|\r|\f)/, " "); // removes line breaks
    body.replacerAll(/\s\s/, " "); // removes double spaces
    body.replacerAll(/\s\s/, " "); // removes left over double spaces
    body.replacerAll(/\s\s/, " "); // removes left over double spaces ('done twice to deal with odd number of spaces >2)
    body.replacerAll(/<span style=[^]+?>([^]+?)<\/span>/, "$1"); // deletes span style=;
    body.replacerAll(/<p\sclass=\W?Mso[^>]*>/, "<p class=default>"); // re-classes all paragraphs to "default"
    body.replacerAll(/<div[^>]*?>/, ""); // deletes existing <div> tags
    body.replacerAll(`<(\\w)[^>]*?>${tabs}<\\/\\1>`, ""); // deletes empty nodes (e.g. "<p></p>")
  };
  /** Replace heading at top of page and tab title. */
  const chapterHeadRepl = () => {
    const chapterMatch = `Chapter\\s(${orsChapter})\\s(?:—\\s|\\(F[^]*?\\)[^]*?<p[^>]*?>)([^]*?)<\\/p>`; // 'Chapter # (- Name | (Former Provisions))'
    thisChapNum = ifRegExMatch(chapterMatch, body.aHtml, 0, 1); // Chapter # alone (used outside scope)
    const thisChapName = ifRegExMatch(chapterMatch, body.aHtml, 0, 2); // Chapter Name
    let thisEdYear = ifRegExMatch(
      "(20\\d{2}(?=\\sEDITION)|(Former Provisions))",
      body.aHtml
    ); // Edition year
    const titleParsing = `[^]*?${thisEdYear}[^]*?${para}${tabs}${para}${tabs}${para}`; // separates 3 paragraphs following "20xx edition"
    /* Replace tab title*/ newTitle: {
      let htmlTitle = document.head.getElementsByTagName("title")[0];
      if (htmlTitle == undefined) {
        htmlTitle = document.createElement("title"); // create title if it doesn't exist (which it doesn't in 2021 ed.)
        document.head.appendChild(htmlTitle); // puts new title into document head
      }
      htmlTitle.innerHTML = `${thisChapNum}: ${thisChapName}`;
    }
    const runningTitle = (() => {
      if (ifRegExMatch(/\(Former Provisions\)/, body.aHtml).length > 1) {
        const ans = ifRegExMatch(titleParsing, body.aHtml, 0, 3); // gets running head (para #3)
        body.replacerOne(titleParsing, ""); // deletes existing head
        return ans;
      } else {
        const ans = ifRegExMatch(titleParsing, body.aHtml, 0, 2); // gets running head (para #2)
        body.replacerOne(titleParsing, "<p class=default>$3</p>"); // deletes existing head (leaves 3rd paragraph alone)
        thisEdYear += " Edition";
        return ans;
      }
    })();
    return `<div class=mainHead><h2>${runningTitle}</h2><h1>Chapter ${thisChapNum} : ${thisChapName}</h1><h3>Oregon Revised Statutes (${thisEdYear})</h3></div>`;
  };
  
  /** create & label new division for table of contents */
  const createTOC = () => {
    body.replacerOne(
      `(${para})([^]*?)(?=\\2<\\/p>|<p class=default><b>(Note:|${tabs}))`, // Table of contents (ends with first repeated paragraph, first "Note:" or first rsec)
      `<div id=toc><h1>Table of Contents</h1><div class=tocItems>\$1\$3${endSec}${tocBreak}` // replaced with new TOC div & end tagged "tocBreak"
    );
  };
  // **
  const classifyOrsRefs = () => {
    body.replacerAll(
      `(${orsSection}((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)`, // finds all ORS references plus subs (e.g., 90.505 (2)(a))
      "<span class=ors>$1</span>" // wraps them in span class=ors
    );
  };
  const classLeadlines = () => {
    const thisChapORS = `${thisChapNum}\\.\\d{3,4}\\b`;
    // Checking first for note sections
    body.replacerAll(
      // First tag ORS sections (with or without leadlines) following div ending with "user's convenience"
      `(user\\Ws\\sconvenience\\.</p>)\\s?<p[^>]*?><b>${tabs}<span [^>]*?>(${thisChapORS})\\s?</span>([^]*?)<\\/b>`,
      // Class as leadline, but no button or id
      `$1<p class=leadline break="\`"><b>$2$3</b></p><p class=default>`
    );
    body.replacerAll(
      // leadlines (<b>+tab+ors.sec+leadline+</b>):
      `<p[^>]*?><b>${tabs}(?:<span [^>]*?>)(${thisChapORS})\\s?</span>([^\`\\]~]{3,}?)<\\/b>`,
      // use to start collapsible section div with button in leadline:
      `${endSec}<div class="section" break="~"><button class="collapser" id="$1"><p class="leadline">$1$2</p></button><div class="collapsible"><p class=default>`
    );
  };

  /** Creates divs for forms */
  const createFormDivs = () => {
    body.replacerAll(
      `(form[^]*?:<\\/p>)${tabs}<p[^>]*>_{77,}<\\/p>`, // finds starts of each form (contains "form" and ends in ":" followed by horizontal line);
      "$1<div class=orsForm break='`'>" // puts in new form div and tags with (`) (form break)
    ); 
    // to find form end, start with new break (`) look forward until last ending mend line before end of section OR new form starts)
    const formEnd = /(orsForm break='`'>)(([^~`]*_{77,})|([^~`]*?)(?=<div class=orsForm))/ 
    console.log(formEnd)
    console.log(body.aHtml)
    body.replacerAll(
        formEnd, // finds form end 
        "$1$2</p></div break='`'>" // closes form div (break is necessary for keeping headings straight, below)
      );
    body.replacerAll(`<p[^>]*?>${tabs}_{77,}(?:<\/p>)?${tabs}(<\/div[^>]*>)`, "$1"); // removes ending form underlines _____
    //body.replacerAll(/_{68,}/, '<hr style="width:80%; text-align:center>') // replaces horizontal lines of underscores with actual horizontal lines
  };
  /** replace ORS cross references for sections within chapter */  
  function orsChapLink() {
    body.replacerAll(
      `<span class=ors(>(${thisChapNum}\\.\\d{3,4}\\b)[^]*?<\\/)span`, // finds ORS references to ORS within chapter
      '<a class=ors href="#$2"$1a' // creates link to ORS #tag
    );
    body.replacerAll(
      `span\\sclass=ors>((${orsChapter}).\\d{3}\\b|(\\b7\\dA?)\\.\\d{4}\\b)<\\/span`, // find ORS references to ORS outside chapter
      `a href="https://www.oregonlegislature.gov/bills_laws/ors/ors00$2$3.html#$1" target="_blank">$1</a` // create link to external chapter
    );
    body.replacerAll(/(ors)0+(\d{3})/, "$1$2"); // delete any extra zeros in link URLs
  }
  /** Moves TOC to a separate variable (theTOC) to edit separately */
  function separateToc() {
    theTOC.aHtml = ifRegExMatch(`<div id[^]*(?:${tocBreak})`, body.aHtml); // copy TOC to separate variable
    body.replacerOne(
      `${theTOC.aHtml.slice(0, 50)}[^]*${tocBreak}`,
      "<p class=default>"
    ); // and remove it from the body document
    if (theTOC.aHtml == "")
      warnCS("No table of contents found", "syncClean.js", "separateTOC");
  }
  /** Classifies <p> tags as subsections, paragraphs and sub(+)paragraph based on info in parentheses */
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
      "=para break='!'>$1" // re-classing all as paragraphs (lowercase) and adding "!" tag
    );
    body.replacerAll(
      /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/, // uppercase (A) through ZZZZ
      "=subpara break='?'>$1" // re-classing all as subparagraphs (uppercase) and adding "?" tag
    );
    RomanNumbers: {
      const romanLowerLead = "((=subsubpara>[^!~]*))=para[^>]*?>(?=\\("; // common data in para that needs converted to roman
      const romanLowerRepl = "$1=subsubpara>";
      const romanUpperLead = "((subsubsubpara>[^~!?]*))=subpara[^>]*>(?=\\("; // upper case
      const romanUpperRepl = "$1=subsubsubpara>";
      /** Ensure that when matches dry up, stop looking for more
       * @param {string} romanNum */
      const doBreak = (romanNum) =>
        new RegExp(`/\(${romanNum}\)/`).test(body.aHtml);
      if (doBreak("ii")) break RomanNumbers; // if there are no (ii) in document, stop search
      body.replacerAll(
        /=para[^>]*>((?:\([A-Z]\))?\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/, // [(X)](i) through (ii) (if no breaks "!~")
        "=subsubpara>$1=subsubpara>" // both are sub-sub-paragraphs
      );
      body.replacerAll(romanLowerLead + "iii)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "v)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "x)", romanLowerRepl);
      body.replacerAll(romanLowerLead + "xx)", romanLowerRepl);
      if (doBreak("II")) break RomanNumbers; // if there are no (II) in document, done looking
      body.replacerAll(
        /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/, // (I) through (II) (if no breaks "?~")
        "=subsubsubpara>$1=subsubsubpara>"
      );
      if (doBreak("III")) break RomanNumbers;
      body.replacerAll(romanUpperLead + "III)", romanUpperRepl);
      if (doBreak("V")) break RomanNumbers;
      body.replacerAll(romanUpperLead + "V)", romanUpperRepl);
      if (doBreak("X")) break RomanNumbers;
      body.replacerAll(romanUpperLead + "X)", romanUpperRepl);
      if (doBreak("XX")) break RomanNumbers;
      body.replacerAll(romanUpperLead + "XX)", romanUpperRepl);
    }
    body.replacerAll(
      /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/, // big (L) following directly after a little (k)
      "$1=para" // re-class as paragraph
    );
  }
  function headingReformat() {
    const headFind = /<p class=default>([^a-z(_]{4,}?)<\/p>/g; // Heading (4+ initial capital letters) (E.g., "PENALTIES")
    const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g; // Leading parens with at least 5 letters (E.g. "(Disputes)")
    const tempHeadFind =
      /<p class=default>(\(Temporary\sprovisions[^~]*?)<\/p>/; // "(Temporary provisions ...) with:
    replaceBodyHeadings: {
      body.replacerAll(
        tempHeadFind,
        `${endSec}<div class=tempHead><p>$1</p><div>`
      );
      body.replacerAll(
        headFind,
        `#hClose#${endSec}<div class=heading><p class=headingLabel><b>$1</b></p><div><div>`
      ); // wrap with div after #hClose tag
      body.replacerAll(
        subheadFind,
        `#sClose#${endSec}<div class=subhead><p class=subheadLabel>$1</p><div><div>`
      ); // wrap with div after #sClose tag
    }
    replaceTOCHeadings: {
      theTOC.replacerAll(tempHeadFind, "<p class=tocTemp>$1</p>");
      theTOC.replacerAll(headFind, "<p class=tocHeading>$1</p>"); // wrap with tocHeading div
      theTOC.replacerAll(subheadFind, "<p class=tocSub>$1</p>"); // wrap with tocSubheading div
    }
    /** search (<Heading> through <end of form>) without break
     * Can only replace one at a time (because can only use <end of form> once per search) per form
     * Repeats until it finds them all */
    HeadingsInForms: {
      const headInForm =
        /(=orsForm break='`'[^`~]*)#hClose#[^`~]*?<p[^`~>]*>([^`~]*?)<div><div>/;
      const subheadInForm =
        /(=orsForm break='`'[^`~]*)#sClose#[^`~]*?<p[^`~>]*>([^`~]*?)<div><div>/;
      while (headInForm.test(body.aHtml) || subheadInForm.test(body.aHtml)) {
        body.replacerAll(headInForm, "$1<p class=formHeading>$2"); // "headings" remain headings (bold & colors), but don't start new div
        body.replacerAll(subheadInForm, "$1<p class=default>$2"); // "subheadings" turned to default text
      }
    }
  }
  function notesRepl() {
    body.replacerAll(
      `<p[^>]*>\\s?<b>${tabs}(Note(\\s\\d)?:\\s?<\\/b>[^]*?<\\/p>)`, // Notes paragraphs ("Note:", "Note #:")
      "<div class=note><p><b>$1</div>" // Wrap in new bold note div
    );
    body.replacerAll(
      // Bold ORS links following div ending with "user's convenience" (i.e. note sections)
      `(user\\Ws\\sconvenience.</p>)<\\/div>([^~]*?)<div`,
      // Notify that it's note section; move <div> close to end
      "$1$2</div><div"
    );
    // running twice to deal with issue of neighboring temp sections ending w/ div that starts next
    for (let i = 0; i < 2; i++) {
      body.replacerAll(
        // session law preamble (Section xx, chapter xx ... provides:) ...
        /<div\sclass=note>[^~]{0,15}\s((Section[^\<~]+),\sc[^~]+?\sprovides?:)[^~]*?<\/div>([^~]*?)<div/,
        // close previous sec; put in separate note div classed as "noteSec"
        `${endSec}<div class="section" break="~"><button id="$2" class="collapser"><p class=leadline>$1</p></button><div class="collapsible">$3<div`
      );
    }
    body.replacerAll(
      `<b>${tabs}(Sec\\.\\s\\d{1,3}\\.[^>\\]]*?)<\\/b>`, // session law sections (E.g., "Sec. 14.") and leadline, if any
      "<p class=leadline>$1</p><p class=default>" // re-classed as leadline (whether there is a leadline or not) but not collapsible
    );
    body.replacerAll(
      /(Preface\sto\sOregon\sRevised\sStatutes)/, // "Preface to ORS text"
      '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf" target="_blank">$1</a>' // Links to preface pdf
    );
    body.replacerAll(
      /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/, // "CST" references in text is replaced by link:
      '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#" target="_blank">$1</a>' // links to ORS page for CST (not great, can't find better option)
    );
    body.replacerAll(
      /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/, // all subSec (1)'s (which were ignored first round before because they didn't start paragraph)
      "<p class=subsec>$1</p>" // classed as subSecs
    );
  }
  function sourceNotesRepl() {
    body.replacerAll(
      /(\[(19\d{2}|20\d{2}|Sub|Fo|Re|Am)[^]+?\]<\/p>)/, // source notes (e.g., [20.., [Formerly, ... etc.) not in separate paragraph
      "<p class=sourceNote>$1</p>" // labeled as source notes
    );
    body.replacerAll(
      // source notes renumbered or repealed (rsec)
      /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/, 
      // wrap in div labeled as burnt
      `${endSec}<div p class="burntDiv"><button class="collapser" id="$1"><p class="burnt"><b>[Former ORS $1]</b></p></button><div class="collapsible burnt">` 
    );
  }

  /** Makes sure all headings & subheading divs close exactly once & no subheading w/o heading
   * by replacing #hClose & #sClose tags with appropriate number of closing divs */
  function matchHeadingDivs() {
    const closeHeadTags = /(#hClose#|#sClose#)/;
    let hCount = 0;
    let divHeadClose = "";
    while (closeHeadTags.test(body.aHtml)) {
      // checks second character for "h" or "s"
      if (ifRegExMatch(closeHeadTags, body.aHtml)[1] == "s") {
        // for new heading before second+ subheading - single div close (otherwise none)
        divHeadClose = (hCount == 2 && "</div>") || "";
        hCount = 2; // state = after 1st subheading
      } else {
        // for new heading close after subheading close both; if after 1st just close heading; & if very first heading: none
        divHeadClose =
          (hCount == 2 && "</div></div>") || (hCount == 1 && "</div>") || "";
        hCount = 1; // state = before 1st (if any) subheading; but after 1st heading
      }
      body.replacerOne(closeHeadTags, divHeadClose);
    }
  }
  // MAIN sync Clean
  // Global variables
  let thisChapNum;
  let body=wordObj(document.body.innerHTML)
  const tabs = "(?:&nbsp;|\\s){0,8}";
  const endSec = "</div></div>";
  const para = "<p[^>]*?>([^]*?)<\\/p>";
  const orsChapter = "\\b[1-9]\\d{0,2}[A-C]?\\b";
  const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\\b)`;
  let theTOC = wordObj();
  // run functions
  htmlCleanup(); // delete span syntax & msoClasses & existing divs & empty tags from HTML
  const mainHead = chapterHeadRepl(); // Replace heading at top of page.
  createTOC(); // create & label new table of contents div
  classifyOrsRefs(); // classify internal cross references to ORS sections (xx.xxx) (to be replaced later by relevant links)
  classLeadlines(); // classify leadlines & create new div for each new section
  createFormDivs(); // create new div for forms
  orsChapLink(); // builds links to ORS sections in chapter to #id of ORS section
  // orsChapLink(); // builds links to ORS sections in other chapters
  separateToc(); // separate TOC & chapter heading from rest of body to facilitate editing body
  classifySubunits(); // finds and classifies subunits (subsections, paragraphs, subsections etc.)
  headingReformat(); // classify HEADINGS and (Subheadings) and (Temporary Labels) & build divs for each
  notesRepl(); // Notes put into divs, source notes styled, adds hyperlinks for Preface to ORS & vol22
  sourceNotesRepl(); // Find source notes and classify
  matchHeadingDivs(); // Ensures heading & subheading divs close properly
  // returns cleaned up Heading, TOC & body as object
  const emptyContent = `<(\\w+)(\s[^>]*?)?>${tabs}<\\/\\1>`;
  body.replacerAll(emptyContent, ""); // deletes empty nodes (e.g. "<p></p>")
  return {
    Head: mainHead,
    TOC: theTOC.aHtml,
    Body: body.aHtml,
  };
}