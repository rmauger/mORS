//@ts-check

browser.omnibox.onInputEntered.addListener((omniText) => parseUrls(sanitize(omniText)));

const orsRegExp = /\b(\d{1,3}[A-C]?)(?:\.\d{3,4})?/g;

/** removes characters other than letters, numbers, hyphen and period from omnibox input
 * @param {string} omniText */ 
const sanitize=(omniText) => {
  return omniText.replace(/[\\\(\)\{\}\]\[\,\`\~\$\%\#\@\!\^\&\*\_\+\=\"\'\?\<\>\|]/g, '-') 
}

const parseUrls = (omniText) => {
  async function getOrLaw() {
    let reader = "";
    // let year = "";
    let readerArray = omniText.match(/(hein|or\s?\.?\s?leg)/i); // checks if reader specified in omnibox text
    if (readerArray != null) {
      reader = readerArray[0];
    }
    let year = omniText
      .match(new RegExp(`${yearSearch}\\s?${specialSession}?`, ""))[0] // year (+ special session if any)
      .trim();
    year = year.replace(/\s*?s.?s.?\s?(\d)/, " s.s.$1"); // reformats various attempts at special session to work with lookup
    const chap = omniText.match(/\d{1,4}$/)[0];
    if (reader == "") reader = await promiseGetFromStorage("lawsReaderStored"); // if user didn't request reader, use stored default
    try {
      const orsLawUrl = await promiseGetOrLegUrl(year, chap, reader);
      if (orsLawUrl.length > 1) {
        return orsLawUrl;
      } else {
        return "";
      }
    } catch (e) {
      warnLog(e, "omnibox.js", "getOrLaw");
      return;
    }
  }

/** creates new tab based on search
 * @param {string} aUrl */
 const newUrlTab = (aUrl) => {
  if (aUrl == "") aUrl = "https://github.com/rmauger/mORS/mORSerror.md";
  infoLog(`Creating new tab for ${aUrl}`, "omnibox.js", "newUrlTab");
  browser.tabs.create({ url: aUrl });
};

const newTabOrs = (/** @type {string} */ requestStr) => {
  const orsSearch = requestStr.toUpperCase();
  const orsList = orsSearch.match(orsRegExp);
  orsList.forEach((/** @type {string} */ orsSec) => {
    let urlBuild = orsSec.replace(orsRegExp, "00$1.html#$&");
    urlBuild = urlBuild.replace(/0{1,2}(\d{3})/, "$1"); // trim any excess leading 0s to 3 digits
    newUrlTab(
      `https://www.oregonlegislature.gov/bills_laws/ors/ors${urlBuild}`
    );
  });
};
  // MAIN
  const yearSearch = "((?:19|20)\\d{2})";
  const specialSession = "(s.?s.?\\s?\\d\\s?)";
  const orLawDivider = "(?:[-\.]|\\s|c\\.)";
  const chapterSearch = "(\\d{1,4})";
  const orlawRegExp = new RegExp(
    `${yearSearch}\\s?${specialSession}?${orLawDivider}\\s?${chapterSearch}$[^]*`,
    "g"
  ); // special session is optional
  infoLog(`Received '${omniText}' from omnibar`, "omnibox.js", "parseUrls");
  if (orlawRegExp.test(omniText)) {
    getOrLaw().then((/** @type {string} */ theUrl) => newUrlTab(theUrl));
    return;
  }
  if (orsRegExp.test(omniText)) {
    newTabOrs(omniText);
    return;
  }
  warnLog(`Type ORS '{chapter}' or '{section}' or '{year} c.{chap#} or 'hein/orlaw '\n
    (E.g., '659A', '174.010', '2015 c.614' or 'Hein 2020 s.s.3 c.3)`);
};
