// @ts-check

//returns tabs matching object (returning promises works in Chrome mv3, for this at least)
function queryPromise (queryObj) {
  return (browser.tabs.query(queryObj))
}

// Returns list of tabs in active window displaying ORS pages
function promiseGetOrsTabs() {
  return queryPromise({ url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html*" })
}

//returns activeTab
function promiseGetActiveTab(_pass) {
  return queryPromise({ currentWindow: true, active: true })
}