//navtotag.js
//@ts-check

const promiseGetTabURL = () => {
  return new Promise((resolve, reject) => {
    sendAwaitResponse("getCurrentTab").then(
      (response) => {
        const tab = response.response[0];
        resolve(tab.url);
      },
      (e) => {
        warnCS(`Error retrieving URL: ${e}`, "navtoTag");
        reject(`Error retrieving URL: ${e}`);
      }
    );
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
      warnCS(`Threw error ${e}`, "navtotag.js");
      reject(`promiseGetNavID: ${e}`);
    }
  });
};
const navigateToTag = async (tabUrl) => {
  try {
    const navID = await promiseGetNavID(tabUrl);

    if (navID) {
      infoCS(
        `navigating to ${navID.innerText}`,
        "navtotag.js",
        "navigateToTag"
      );
      navID.scrollIntoView();
      expandSingle(navID.nextElementSibling);
    } else {
      infoCS(
        "No ORS section found in content URL",
        "navtotag.js",
        "navigateToTag"
      );
    }
  } catch (error) {
    warnCS(`Error getting tabURL: ${error}`, "navtotag.js", "navigateToTag");
  }
};
