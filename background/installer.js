//@ts-check

//@ts-ignore
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason == "install") {
      browser.storage.sync.clear();
      browser.storage.sync.set(
        {
          cssSelectorStored: "Dark" ,
          lawsReaderStored: "OrLeg" ,
          collapseDefaultStored: false ,
          showSNsStored: true ,
          showBurntStored: true ,
          showMenuCheck: true, 
        }
        , ()=>{}
      );
    }
  });