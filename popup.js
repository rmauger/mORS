//popup.js
//@ts-nocheck
"use strict";

//promise functions:
function promiseGetCss() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("cssSelectorStored", (object) => {
      if (object) {
        resolve(object.cssValue);
      } else {
        reject("Failed to retrieve stored user value for CSS Style");
      }
    });
  });
  // TODO: Still to implement, retrieve this from identical background.js function
}
function promiseGetOrLaw() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("lawsReaderStored", (object) => {
      if (object) {
        resolve(object.lawsReaderStored);
      } else {
        reject("Failed to retrieve stored user value for Oregon Laws Reader");
      }
    });
  });
  // TODO: Still to implement, retrieve this from identical background.js function
}

//setup event listeners for form dropdowns & buttons
formCssNew.addEventListener("change", async () => {
  const formCssOld = await promiseGetCss()
  formCssNew = document.getElementById("cssSelector");
  chrome.storage.sync.set(
    {cssSelectorStored: formCssNew.value}, ()=> {
      refreshPage(formCssOld, formCssNew.value)
      displayUserOptions();
    }
  );
});
orLawSelector.addEventListener("change", () => {
  orLawSelector = document.getElementById("OrLaws");
  chrome.storage.sync.set(
    { lawsReaderStored: orLawSelector.value }, ()=> {
      reloadORS()
      displayUserOptions();
    }
  );
});
chpLaunchButton.addEventListener("click", () => {
  let orsSection = document.getElementById("orsChapter").value;
  let orsChapter = `00${orsSection}`;
  orsChapter = orsChapter.match(/\d{3}[A-C]?\b/)[0]; // pad to exactly 3 digits
  let orsURL = `https://www.oregonlegislature.gov/bills_laws/ors/ors${orsChapter}.html#${orsSection}`;
  chrome.tabs.create({ url: orsURL });
});
orLawsLaunchButton.addEventListener("click", () => {
  let orLawsYear = document.getElementById("orLawsYear").value;
  let orLawsChp = document.getElementById("orLawsChapter").value;
  orLawSelector = document.getElementById("OrLaws");
  let errMsg = "";
  let orLawURL = "";
  if ((orLawsYear > 1859 && orLawsYear < 2030) == false) {
    errMsg += "Oregon Laws volume must be a year after 1859.\n";
  } else if (orLawsYear > 1999 == false && orLawSelector.value == "OrLeg") {
    errMsg +=
      "Oregon Laws are not available on the Oregon Legislature's website for years before 1999.\n";
  }
  if ((orLawsChp < 2001 && orLawsChp > 0) == false) {
    errMsg += "Chapter must be a number between 1 and 2000.\n";
  }
  if (orLawSelector.value == "None") {
    errMsg += "A session law lookup source (below) is required.";
  }
  if (errMsg.length > 1) {
    alert(errMsg);
    // TODO: #18 Create better display for error messages within popup.html
  } else {
    if (orLawSelector.value == "Hein") {
      orLawURL = `https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=${orLawsYear}&chapter=${orLawsChp}&sgo=Search&collection=ssl&search=go`;
    } else {
      let orLawFileName = orLawOrLegLookup["OL" + orLawsYear].replace(
        /~/,
        "000" + orLawsChp
      );
      orLawFileName = orLawFileName.replace(
        /([^]*?\w)\d*(\d{4}(?:\.|\w)*)/,
        "$1$2"
      );
      orLawURL =
        "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/" +
        orLawFileName;
    }
    chrome.tabs.create({ url: orLawURL });
  }
});
function displayUserOptions() {
  formCssOld = formCssNew.value;
  orLawFormInitial = orLawSelector.value;
  try {
    async () => {
      storedData = await Promise.all([promiseGetCss(), promiseGetOrLaw()]);
      for (let i = 0; i < formCssNew.options.length; i++) {
        if (formCssNew.options[i].value == storedData[0]) {
          formCssNew.selectedIndex = i;
          console.log(storedData[0])
          break;
        }
      }
      for (let i = 0; i < orLawSelector.options.length; i++) {
        if (orLawSelector.options[i].value == storedData[1]) {
          orLawSelector.selectedIndex = i;
          console.log(storedData[1])
          break;
        }
      }
    };
  } catch (e) {
    alert(e);
  }
}

function reloadORS() {
  chrome.tabs.query(
    { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html" },
    (tabs) => {
      for (const aTab of tabs) {
        chrome.tabs.reload(aTab.id);
      }
    }
  );
}

function refreshPage(oldCSS, newCSS) {
  console.log (oldCSS)
  const oldCssFile = `/css/${cssSourceLookup[oldCSS]}`
  const newCssFile = `/css/${cssSourceLookup[newCSS]}`
  console.log(newCssFile)
  console.log(oldCssFile)
  chrome.tabs.query(
    { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html" },
    (tabs) => {
      for (const aTab of tabs) {
        try {
          chrome.scripting.removeCSS(
            {
              target: { tabId: aTab.id },
              files: [oldCssFile],
            },
            () => {}
          );
        } catch (error) {
          console.log(error);
        }
        chrome.scripting.insertCSS(
          {
            target: { tabId: aTab.id },
            files: [newCssFile],
          },
          () => {}
        );
      }
    }
  );
}

// MAIN
const formCssNew = document.getElementById("cssSelector");
const orLawSelector = document.getElementById("OrLaws");
const chpLaunchButton = document.getElementById("chapterLaunch");
const orLawsLaunchButton = document.getElementById("orLawsLaunch");
const formCssOld = "";
const orLawFormInitial = "";
const orLawOrLegLookup = {
  OL2021: "2021orlaw~.pdf",
  OL2020: "2020orlaw~.pdf",
  OL2019: "2019orlaw~.pdf",
  OL2018: "2018orlaw~.pdf",
  OL2017: "2017orlaw~.pdf",
  OL2016: "2016orlaw~.pdf",
  OL2015: "2015orlaw~.pdf",
  OL2014: "2014R1orLaw~ss.pdf",
  OL2013: "2013orlaw~.pdf",
  OL2012: "2012adv~ss.pdf",
  OL2011: "2011orLaw~.html",
  OL2010: "2010orLaw~.html",
  OL2009: "2009orLaw~.html",
  OL2008: "2008orLaw~.html",
  OL2007: "2007orLaw~.html",
  OL2006: "2006orLaw~ss1.pdf",
  OL2005: "2005orLaw~ses.html",
  OL2003: "2003orLaw~ses.html",
  OL2001: "2001orLaw~ses.html",
  OL1999: "1999orLaw~.html",
};
const cssSourceLookup = {
  Dark: "dark.css",
  Light: "light.css",
  DarkGrey: "darkgrey.css"
} 
displayUserOptions();
