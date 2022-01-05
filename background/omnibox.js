//@ts-check

/**
 * @param {string} aUrl
 */

const orsRegExp = /\b(\d{1,3}[A-C]?)(?:\.\d{3,4}|\b)/g;

const newUrlTab = (aUrl) => browser.tabs.create({ url: aUrl });

const newTabOrs = (/** @type {string} */ requestStr) => {
  const orsSearch = requestStr.toUpperCase();
  const orsList = orsSearch.match(orsRegExp);
  orsList.forEach((/** @type {string} */ orsSec) => {
    let urlBuild = orsSec.replace(orsRegExp, "00$1.html#$&");
    urlBuild = urlBuild.replace(/\d{1,2}(\d{3}[A-C]?\.html)/, "$1");
    newUrlTab(
      `https://www.oregonlegislature.gov/bills_laws/ors/ors${urlBuild}`
    );
  });
};

browser.omnibox.onInputEntered.addListener((omniText) => {
  async function getOrLaw() {
    const year = omniText.match(/(19|20)\d{2}/)[0];
    const chap = omniText.match(/\d{1,4}$/)[0];
    try {
      const reader = await promiseGetFromStorage("lawsReaderStored");
      const orsLawUrl = await promiseGetOrLegUrl(year, chap, reader);
      newUrlTab(orsLawUrl);
    } catch (e) {
      logOrWarn(e, "Invalid OrLaw Request");
    }
  }
  const orlawRegExp =
    /[^]*((?:19|20)\d{2})\s*?([/|&]|\s|c\.)\s*?(\d{1,4}$)[^]*/g;
  if (orlawRegExp.test(omniText)) {
    getOrLaw();
    return;
  }
  if (orsRegExp.test(omniText)) {
    newTabOrs(omniText);
    return;
  }
  logOrWarn(`Type 'mORS' + ORS '{chapter}' or '{section}' or '{year} c.{chapter#}\n
    (E.g., '659A', '174.010', or '2015 c.614')`);
});