//popup.js
//@ts-nocheck
"use strict";

//set global variables for popup.html form
let darkSelector = document.getElementById("isDark");
let orLawSelector = document.getElementById("OrLaws");
let chpLaunchButton = document.getElementById("chapterLaunch");
let orLawsLaunchButton = document.getElementById("orLawsLaunch");
let darkFormInitial = "";
let orLawFormInitial = "";
let orLawOrLegLookup = {
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

// update displayed info at page launch & after dropdown changes:
displayUserOptions();

//setup event listeners for form dropdowns & buttons
darkSelector.addEventListener("change", () => {
  darkSelector = document.getElementById("isDark");
  console.log(
    `Dark form initial value = ${darkFormInitial} Dark form current value = ${darkSelector.value}`
  );
  if (darkFormInitial != darkSelector.value) {
    // if new value selected...
    chrome.storage.sync.set(
      { isDarkStored: darkSelector.value == "Dark" },
      refreshPage(darkFormInitial, darkSelector.value)
    );
    displayUserOptions();
  } else {
  }
});
orLawSelector.addEventListener("change", () => {
  console.log(
    `Dark form initial value = ${orLawFormInitial} Dark form current value = ${orLawSelector.value}`
  );
  orLawSelector = document.getElementById("OrLaws");
  if (orLawFormInitial != orLawSelector.value) {
    // if new value selected...
    chrome.storage.sync.set(
      { lawsReaderStored: orLawSelector.value },
      reloadORS()
    );
    displayUserOptions();
  } else {
  }
});
chpLaunchButton.addEventListener("click", () => {
  let orsSection = document.getElementById("orsChapter").value;
  let orsChapter = "00" + orsSection;
  orsChapter = orsChapter.match(/\d{3}[A-C]?\b/)[0];
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
  darkFormInitial = darkSelector.value;
  orLawFormInitial = orLawSelector.value;
  let promiseGetDark = new Promise((resolve, reject) => {
    chrome.storage.sync.get("isDarkStored", (object) => {
      if (object) {
        resolve((object.isDarkStored && "Dark") || "Light");
      } else {
        reject(false);
      }
    });
  });
  let promiseGetOrLaw = new Promise((resolve) => {
    chrome.storage.sync.get("lawsReaderStored", (object) => {
      if (object) {
        resolve(object.lawsReaderStored);
      } else {
        reject(false);
      }
    });
  });
  promiseGetDark
    .then((resolve) => {
      for (let i = 0; i < darkSelector.options.length; i++) {
        if (darkSelector.options[i].value == resolve) {
          darkSelector.selectedIndex = i;
          break;
        }
      }
      darkFormInitial = darkSelector.value;
    })
    .catch((reject) => {
      if (reject) {
        alert("Error: user's stored dark/light status not found!");
      }
    });
  promiseGetOrLaw
    .then((resolve) => {
      for (let i = 0; i < orLawSelector.options.length; i++) {
        if (orLawSelector.options[i].value == resolve) {
          orLawSelector.selectedIndex = i;
          break;
        }
      }
    })
    .catch((reject) => {
      if (reject) {
        alert("Error: Ore Laws source not found!");
      }
    });
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
  chrome.tabs.query(
    { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html" },
    (tabs) => {
      for (const aTab of tabs) {
        try {
          chrome.scripting.removeCSS(
            {
              target: { tabId: aTab.id },
              files: [`mORS_${oldCSS.toLowerCase()}.css`],
            },
            () => {}
          );
        } catch (error) {
          console.log(error);
        }
        chrome.scripting.insertCSS(
          {
            target: { tabId: aTab.id },
            files: [`mORS_${newCSS.toLowerCase()}.css`],
          },
          () => {}
        );
      }
    }
  );
}
