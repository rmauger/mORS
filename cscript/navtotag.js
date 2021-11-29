const promiseGetTabURL = () => {
  return new Promise((resolve, reject) => {
    //@ts-ignore
    chrome.runtime.sendMessage({ message: "getCurrentTab" }, (msg) => {
      try {
        const tab = msg.response;
        resolve(tab.url);
      } catch (e) {
        console.warn(`Error retrieving URL: ${e}`);
        reject(`Error retrieving URL: ${e}`);
      }
    });
  });
};
const promiseGetNavID = (theTabUrl) => {
  return new Promise(async (resolve, reject) => {
    try {
      setTimeout(() => {
        const idFinder = /(?<=\.html\#)[^\/]*/;
        if (idFinder.test(theTabUrl)) {
          const pinCiteButton = document.getElementById(
            ifRegExMatch(idFinder, theTabUrl)
          );
          if (pinCiteButton) {
            resolve(pinCiteButton);
          } else {
            resolve("");
          }
        } else {
          resolve("");
        }
      }, 10);
    } catch (e) {
      console.warn(`promiseGetNavID: ${e}`);
      reject(`promiseGetNavID: ${e}`);
    }
  });
};
const navigateToTag = async (tabUrl) => {
  try {
    const navID = await promiseGetNavID(tabUrl);
    if (navID) {
      console.info(`navigating to ${navID.innerText}`);
      expandSingle(navID);
      navID.scrollIntoView();
    } else {
      console.info("No ORS section found in URL");
    }
  } catch (error) {
    console.warn(`Error getting tabURL: ${error}`);
  }
};