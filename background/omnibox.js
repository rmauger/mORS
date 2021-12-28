//@ts-check

/**
 * @param {string} aUrl
 */
 function navigateTo(aUrl) {
    //@ts-ignore
    browser.tabs.create({ url: aUrl });
  }
  
  //@ts-ignore
  browser.omnibox.onInputEntered.addListener((omniText) => {
    async function getOrLaw() {
      const year = omniText.match(/(19|20)\d{2}/)[0];
      const chap = omniText.match(/\d{1,4}$/)[0];
      try {
        const reader = await promiseGetFromStorage("lawsReaderStored");
        const orsLawUrl = await promiseGetOrLegUrl(year, chap, reader);
        navigateTo(orsLawUrl);
      } catch (e) {
        logOrWarn(e, "Invalid OrLaw Request");
      }
    }
    const orlaw = /[^]*((?:19|20)\d{2})\s*?([/|&]|\s|c\.)\s*?(\d{1,4}$)[^]*/g;
    const ors = /[^.|&/123456789]*(\b\d{1,3}[A-C]?)(?:\.?$|.\d{3,4}$)[^]*/g;
    console.info(orlaw);
    console.info(ors);
    console.info(omniText);
    if (orlaw.test(omniText)) {
      getOrLaw();
      return;
    }
    if (ors.test(omniText)) {
      let orsSearch = omniText.replace(ors, "00$1.html#$&");
      orsSearch = orsSearch.replace(/\d{1,2}(\d{3}[A-C]?\.html)/, "$1");
      navigateTo(
        `https://www.oregonlegislature.gov/bills_laws/ors/ors${orsSearch}`
      );
      return;
    }
    logOrWarn(`Type 'mORS' + ORS '{chapter}' or '{section}' or '{year} c.{chapter#}\n
      (E.g., '659A', '174.010', or '2015 c.614')`);
  });