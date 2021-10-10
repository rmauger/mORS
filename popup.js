//popup.js

"use strict";

let promiseGetDark = new Promise((resolve) => {
  chrome.storage.sync.get('isDarkStored', (object) => {
    if (object) {
      resolve(object.isDarkStored)
    }
  });
});
let promiseGetOrLaw = new Promise((resolve) => {
  chrome.storage.sync.get('lawsReaderStored', (object) => {
    if (object) {
      resolve(object.lawsReaderStored)
    }
  });
});
displayUserOptions();

function displayUserOptions() {
  promiseGetDark.then((resolve) => {document.getElementById("isDark").checked = resolve});
  promiseGetOrLaw.then((resolve) => {document.getElementById(resolve).checked=true;})
};

document.getElementById('optionsSubmit').onclick = function () {
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
