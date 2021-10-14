//popup.js
"use strict";

//set global variables from popup.html form
let darkSelector=document.getElementById("isDark");
let orLawSelector=document.getElementById("OrLaws");
let chpLaunchButton=document.getElementById("chapterLaunch");
let darkTempValue="";
let orLawTempValue="";

//setup event listeners for form dropdowns & buttons
darkSelector.addEventListener("change", ()=>{
  if (darkTempValue!=darkSelector.value) {   // if new value selected...
    chrome.storage.sync.set({'isDarkStored': (darkSelector.value == 'Dark')}, refreshPage(darkTempValue, darkSelector.value))
    displayUserOptions();
  }
});
orLawSelector.addEventListener("change", ()=>{
  if (orLawTempValue!=orLawSelector.value) {  // if new value selected...
    chrome.storage.sync.set({'lawsReaderStored': orLawSelector.value}, reloadORS());
    displayUserOptions();
  };
});
chpLaunchButton.addEventListener("click", () => {
  let orsChapter = "00"+document.getElementById("orsChapter").value
  orsChapter = orsChapter.match(/\d{3}[A-C]?\b/)
  chrome.tabs.create({url: 'https://www.oregonlegislature.gov/bills_laws/ors/ors' + orsChapter +'.html'});
});
// update displayed info at page launch & after dropdown changes:
displayUserOptions();
function displayUserOptions() {
  darkTempValue=darkSelector.value;
  orLawTempValue=orLawSelector.value;
  let promiseGetDark = new Promise((resolve, reject) => {
    chrome.storage.sync.get('isDarkStored', (object) => {
      if (object) {
        resolve(object.isDarkStored && "Dark" || "Light")
      } else {reject(false);}
    });
  })
  let promiseGetOrLaw = new Promise((resolve) => {
    chrome.storage.sync.get('lawsReaderStored', (object) => {
      if (object) {
        resolve(object.lawsReaderStored)
      } else {reject(false);}
    });
  });
  promiseGetDark.then((resolve) => {
    for (let i=0; i<darkSelector.options.length; i++) {
      if(darkSelector.options[i].value==resolve) {
        darkSelector.selectedIndex=i;
        break;
      }
    }
    darkTempValue=darkSelector.value;
  }).catch((reject) => {
    if (reject) {alert("Error: user's stored dark/light status not found!")};
  });
  promiseGetOrLaw.then((resolve) => {
    for (let i=0; i<orLawSelector.options.length; i++) {
      if(orLawSelector.options[i].value==resolve) {
        orLawSelector.selectedIndex=i;
        break;
      }
    }
  }).catch((reject) => {
    if (reject) {alert("Error: Ore Laws source not found!")};
  })
};

function reloadORS() {
  chrome.tabs.query({url:'*://www.oregonlegislature.gov/bills_laws/ors/ors*.html'}, (tabs)=> {
    for (const aTab of tabs) {
      chrome.tabs.reload(aTab.id)
    };
  });
};

function refreshPage(oldCSS, newCSS) {
  chrome.tabs.query({url:'*://www.oregonlegislature.gov/bills_laws/ors/ors*.html'}, (tabs)=> {
    for (const aTab of tabs) {
      chrome.tabs.removeCSS(aTab.id, {file:`mORS_${oldCSS.toLowerCase()}.css`})
      chrome.tabs.insertCSS(aTab.id, {file:`mORS_${newCSS.toLowerCase()}.css`});  
    }
  });
};