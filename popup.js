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
  // Updates stylesheet on any page, not just ORS. Needs to check tabs first ==> chrome.runtime.sendMessage({message: "updateCSS"});
};