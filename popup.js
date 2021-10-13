//popup.js

"use strict";

function displayUserOptions() {
  let promiseGetDark = new Promise((resolve, reject) => {
    chrome.storage.sync.get('isDarkStored', (object) => {
      if (object) {
        resolve(object.isDarkStored)
      } else {
        reject(false);
      }
    });
  })
  let promiseGetOrLaw = new Promise((resolve) => {
    chrome.storage.sync.get('lawsReaderStored', (object) => {
      if (object) {
        resolve(object.lawsReaderStored)
      }
    });
  });
  promiseGetDark.then((resolve) => {document.getElementById("isDark").checked = resolve});
  promiseGetOrLaw.then((resolve) => {document.getElementById(resolve).checked=true;})
};

displayUserOptions();

document.getElementById('optionsSubmit').onclick = () => {
  chrome.storage.sync.set({'isDarkStored': document.getElementById("isDark").checked}) 
  let orLaws="";
  const orLawRadios = document.querySelectorAll('input[name="orLaws"]');
  for (const choice of orLawRadios){
    if (choice.checked) {
      chrome.storage.sync.set({'lawsReaderStored': choice.id});
      orLaws=choice.id;
    };
  };
};

document.getElementById('chapterLaunch').onclick = () => {
  let orsChapter = makeThreeDigit(document.getElementById("orsChapter").value);
  chrome.tabs.create({url: 'https://www.oregonlegislature.gov/bills_laws/ors/ors' + orsChapter +'.html'});
};

function makeThreeDigit(orsNumber){
  orsNumber=orsNumber.toString();  //ensuring ORS chapter number is string
  let myLen = orsNumber.length;
  if (orsNumber.match(/\d+[A-C]/)) {
    myLen=myLen-1
  };
  switch(myLen) {
    case 1:
      return "00" + orsNumber;
    case 2:
      return "0" + orsNumber;
    default:
      return "" + orsNumber
  };
};
