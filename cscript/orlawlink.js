//orlawlinking.js
//@ts-check

/**
 * @param {string} htmlTxt
 */
function OrLawLinking(htmlTxt) {
  const html = wordObj(htmlTxt);
  return new Promise((resolve, reject) => {
    function heinLinks() {
      infoCS("Building HeinOnline Links", 'orlink.js, "HeinLinks');
      const heinURL = (
        /** @type {string} */ year, 
        /** @type {string} */ chapter
      ) => {
        return `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chapter}&sgo=Search&collection=ssl&search=go`
      }
      html.replacerAll(
        /((?:20|19)\d{2})\W*c\.\W*(\d+)/,
        `<a href="${heinURL('$1','$2')}" target="_blank">$&</a>`
      );
      html.replacerAll(/(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/,
      `<a href="${heinURL('$2','$1')}" target="_blank">$&</a>`);
      resolve(html.aHtml); // send finished product back to mORS.js
    }
    function orLeg() {
      infoCS("building OrLeg links", "orlink.js", "OrLeg");
      // uses lookup to find url type by year
      /**
       * @param {string} years
       * @param {string} strFormat
       */
      function orLawReplacer(years, strFormat) {
        const snRepl = `<a href="${strFormat}" target="_blank">$&</a>`; //wrap replacement url in href link
        html.replacerAll(`(${years})\\W+c\\.\\W*(\\d{1,4})`, snRepl);
        chapterYear: {
          // figure out replacement string (order of chapter & year flipped, different calc for lookup values)
          const chapLawsRepl = (() => {
            if (ifRegExMatch(/\$1/, snRepl).length > 1) {
              return snRepl.replace(
                new RegExp(`(\\$1|${years})([^]*?)(\\$2)`, ""),
                "$3$2$1"
              );
            } else {
              return snRepl.replace(/\$2/, "$1"); // chapter is now 1st match group (year is already include)
            }
          })();
          // figure out search string (different for special sessions)
          //e.g. '2020 s.s.3, c.3' => 'chapter 3, Oregon Laws 2020 (third special sesssion)'
          const chapLawsSearch = (() => {
            if (/s\.s\./.test(years)) {
              const year = parseInt(years);
              const session = ifRegExMatch(/s\.s\.(\d)/, years, 0, 1);
              const sessPos =
                (session == "1" && "first") ||
                (session == "2" && "second") ||
                (session == "3" && "third");
              return `(?:C|c)hapter\\s(\\d{1,4}),\\sOregon\\sLaws\\s${year}\\s\\(${sessPos} special session\\)`;
            } else {
              return `(?:C|c)hapter\\s(\\d{1,4}),\\sOregon\\sLaws\\s(${years})(?=[.,])`;
            }
          })();
          html.replacerAll(chapLawsSearch, chapLawsRepl); // finally execute replacement
        }
      }
      // build replacement text for recent years
      orLawReplacer(
        "(?:202[\\d]|2019|2018|2017|2016|2015|2013)",
        "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/$1orlaw000$2.pdf"
      );
      // replacement text for various years saved with same file name
      orLawReplacer(
        "(?:2011|2010|2009|2008|2007|1999)",
        "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/$1orlaw000$2.html"
      ); // others looked up individually from background.js
      let promiseGetAllLinks = [];
      [
        "2014",
        "2012",
        "2006",
        "2005",
        "2003",
        "2001",
        "2020 s.s.1",
        "2020 s.s.2",
        "2020 s.s.3",
        "2021 s.s.1",
        "2021 s.s.2",
      ].forEach((aYear) => {
        // use list to create promises (background msg & lookup is async)
        promiseGetAllLinks.push(
          new Promise((resolve, reject) => {
            try {
              sendAwaitResponse({
                orLawObj: { year: aYear, chap: "$2", reader: "OrLeg" },
              }).then((response) => {
                // call back
                resolve(orLawReplacer(aYear, response.response));
              });
            } catch (e) {
              reject(e);
            }
          })
        );
      });
      Promise.all(promiseGetAllLinks).then(() => {
        // await background queries and match replacements (async), then...
        html.replacerAll(/(aw|adv)s?0+(\d{4})/, "$1$2"); // remove extra zeros throughout document (pad to exactly 4 digits)
        resolve(html.aHtml); // send finished product back to mORS.js
      });
    }
    // OrLawLinking MAIN
    sendAwaitResponse("getOrLaw").then(
      (response) => {
        const orLaw = response.response;
        if (orLaw == "Hein") {
          heinLinks(); // replace with URL to HeinOnline search link through SOLL
        } else if (orLaw == "OrLeg") {
          orLeg(); // replace with URL to Or.Leg.
        } else {
          resolve(html.aHtml);
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
