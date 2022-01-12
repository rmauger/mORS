//orlawlinking.js
//FIREFOX = CHROME
//@ts-check

function OrLawLinking(html) {
  return new Promise((resolve, reject) => {
    function HeinLinks() {
      infoCS("building HeinOnline Links", 'orlink.js, "HeinLinks');
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
      resolve(html);
    }
    function OrLeg() {
      /**
       * @param {string} years
       * @param {string} strFormat
       */
      infoCS("building OrLeg links", "orlink.js", "OrLeg");
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
      resolve(html);
    }
    // OrLawLinking MAIN
    sendAwaitResponse("getOrLaw").then(
      (response) => {
        const orLaw = response.response;
        if (orLaw == "Hein") {
          HeinLinks(); // replace with URL to HeinOnline search link through SOLL
        } else if (orLaw == "OrLeg") {
          OrLeg(); // replace with URL to Or.Leg.
        } else {
          resolve(html);
        }
      },
      (e) => {
        const warning = `Error attempting to generate OrLaws links: ${e}`;
        warnCS(warning, "orlawlink.js", "OrLawLinking");
        reject(warning);
      }
    );
  });
}
