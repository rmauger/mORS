//navToTag.js
//@ts-check

const promiseGetTabURL = () => {
  return new Promise((resolve, reject) => {
    sendAwaitResponse("getCurrentTab").then(
      (response) => {
        const tab = response.response[0];
        resolve(tab.url);
      },
      (e) => {
        warnCS(`Error retrieving URL: ${e}`, "navToTag.js", "promiseGetTabURL");
        reject(`Error retrieving URL: ${e}`);
      }
    );
  });
};
/**  */
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
      warnCS(`Threw error ${e}`, "navToTag.js", "promiseGetNavID");
      reject(`promiseGetNavID: ${e}`);
    }
  });
};
/** scroll to html id tag in url, if any */
const navigateToTag = async (tabUrl) => {
  try {
    const navID = await promiseGetNavID(tabUrl);
    if (navID) {
      infoCS(
        `navigating to ${navID.innerText}`,
        "navToTag.js",
        "navigateToTag"
      );
      navID.scrollIntoView();
      expandSingle(navID.nextElementSibling);
    } else {
      infoCS(
        "No ORS section found in content URL",
        "navToTag.js",
        "navigateToTag"
      );
    }
  } catch (error) {
    warnCS(`Error getting tabURL: ${error}`, "navToTag.js", "navigateToTag");
  }
};
