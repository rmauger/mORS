//background/helpchrome.js
//@ts-check

function sendAwaitResponseBG(messageItem) {
  return new Promise((resolve, reject) => {
    try {
      browser.runtime.sendMessage({ message: messageItem }, (response) => {
        resolve(response);
      });
    } catch (error) {
      warnLog(error, "helpchrome.js", "sendAwaitResponseBG");
      reject(error);
    }
  });
}

//Set initial variables on installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == "install") {
    browser.storage.sync.clear();
    browser.storage.sync.set(
      {
        cssSelectorStored: "Dark",
        lawsReaderStored: "OrLeg",
        showBurntStored: true,
        showSNsStored: true,
        collapseDefaultStored: false,
        showMenuStored: true,
        userColors : {
          background: '#39667f',
          altBack: '#192d38',
          formBack: '#1e333e',
          buttonColor: '#335b70',
          buttonHover: '#2d4f62',
          maintext: '#f1d6d0',
          heading: '#fde849',
          subheading: '#cab302',
          sourceNote: '#c77543',
          linkExt: '#37d2d2',
          linkInt: '#9be8e8',
          linkVisited: '#d68472',
          highContrast: undefined,
        }
      },
      () => {}
    );
  }
});

/**
 * @param {Promise<any>} soughtPromise
 * @param {(arg0: {response: any;}) => void} response
 */
async function msgHandler(soughtPromise, response) {
  try {
    const resolvedPromise = await soughtPromise;
    response({ response: await resolvedPromise });
  } catch (e) {
    response({ response: `Error: ${e}` });
  }
}