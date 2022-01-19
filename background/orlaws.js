//background/orlaws.js
//@ts-check


/**
 * @param {string} yearStr
 * @param {string} chpStr
 * @param {string} reader
 * validates data; returns "" if valid
 */
function orLawErrorCheck(yearStr, chpStr, reader) {
  let errMsg = "";
  const year = parseInt(yearStr);
  let chapter = parseInt(chpStr);
  if (isNaN(chapter)) {
    chapter = 1;
  }
  infoLog(chapter)
  if ((year > 1859 && year < 2030) == false) {
    errMsg += "Oregon Laws volume must be a year after 1859.\n";
    // @ts-ignore
  } else if (year > 1999 == false && reader == "OrLeg") {
    errMsg +=
      "Oregon Laws on the Oregon Legislature's website are only available after 1999.\n";
  }
  if ((chapter < 2001 && chapter > 0) == false) {
    errMsg += "Chapter must be a number between 1 and 2000.\n";
  }
  // @ts-ignore
  if (reader == "None") {
    errMsg += "A session law lookup source is required. See extension options.";
  }
  return errMsg;
}

/**
 * @param {string} year
 * @param {string} chapter
 * @param {string} reader
 */
function promiseGetOrLegUrl(year = "2021", chapter = "$1", reader = "OrLeg") {
  return new Promise((resolve, reject) => {
    const errorMessage = orLawErrorCheck(year, chapter, reader); // returns errors if Oregon Laws not available from redaer
    if (errorMessage.length > 1) {
      reject(errorMessage); // data not valid
    } else {
      try {
        if (reader == "OrLeg") {
          resolve(orLegUrl(year, chapter));
        } else if (reader == "Hein") {
          resolve(heinUrl(year, chapter));
        }
      } catch (e) {
        reject(e);
      }
    }
  });
}

const heinUrl = (year, chapter) => {
  `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chapter}&sgo=Search&collection=ssl&search=go`;
};

const orLegUrl = async (year, chapter) => {
  const orLawOrLegLookup = await promiseReadJsonFile("orLawLegLookup.json");
  let orLawFileName = orLawOrLegLookup[year].replace(/~/, "000" + chapter);
  orLawFileName = orLawFileName.replace(
    /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
    "$1$2"
  );
  return `https://www.oregonlegislature.gov/bills_laws/lawsstatutes/${orLawFileName}`;
};
