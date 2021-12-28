// @ts-check

// Returns list of tabs in active window displaying ORS pages
function promiseGetOrsTabs() {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.tabs.query(
        { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html*" },
        tabs => resolve(tabs)
      );
    } catch (e) {
      reject(`Failed while looking for tabs with ORS. Error ${e}`);
    }
  });
}

//TODO: Can ActiveTab be depreciated for some better method?
function promiseGetActiveTab(source) {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      if (tabs) {
        logOrWarn(
          `Active tab is #${tabs[0].id}, url: ${tabs[0].url}; requested by ${source}`
        );
        resolve(tabs[0]);
      } else {
        reject("Unable to determine active tab");
      }
    });
  });
}