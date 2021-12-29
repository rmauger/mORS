//background/orlaws.js
//@ts-check

/**
 * @param {number} year
 * @param {number} chapter
 * @param {string} reader
 */
 function promiseGetOrLegUrl(year, chapter, reader) {
    function orLawErrorCheck() {
      let errMsg = "";
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
        errMsg +=
          "A session law lookup source is required. See extension options.";
      }
      return errMsg;
    }
    return new Promise((resolve, reject) => {
      const errorMessage = orLawErrorCheck();
      if (errorMessage.length < 1) {
        try {
          if (reader == "OrLeg") {
            (async () => {
              const orLawOrLegLookup = await promiseReadJsonFile(
                "orLawLegLookup.json"
              );
              let orLawFileName = orLawOrLegLookup["OL" + year].replace(
                /~/,
                "000" + chapter
              );
              orLawFileName = orLawFileName.replace(
                /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
                "$1$2"
              );
              resolve(
                `https://www.oregonlegislature.gov/bills_laws/lawsstatutes/${orLawFileName}`
              );
            })();
          } else if (reader == "Hein") {
            resolve(
              `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${year}&chapter=${chapter}&sgo=Search&collection=ssl&search=go`
            );
          }
        } catch (e) {
          reject(e);
        }
      } else {
        reject(errorMessage);
      }
    });
  }