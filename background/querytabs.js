// @ts-check
// Returns list of tabs in active window displaying ORS pages
function promiseGetOrsTabs() {
  return queryPromise({ url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html*" })
}

//returns activeTab
function promiseGetActiveTab(source) {
  return queryPromise({ currentWindow: true, active: true })
}