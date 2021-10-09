//popup.js

"use strict";
displayUserOptions();

function displayUserOptions() { 
  
  chrome.runtime.sendMessage({bgQuery:"isDark"}, function (response) {
    let isDark=response.ans;
    document.getElementById("isDark").checked=isDark;
  });

  chrome.runtime.sendMessage({bgQuery:"lawsReader"}, function(response) {
    let lawsReader= response.ans;
    alert("Asker received re:Reader: " + lawsReader)
    //document.getElementById(lawsReader).checked=true;
  })

//  alert (`Retrieved: is dark =${document.getElementById("isDark").checked}`);
    
};

document.getElementById('optionsSubmit').onclick = function () {
  chrome.storage.sync.set({'isDarkStored': document.getElementById("isDark").checked}) //, function( {chrome.tabs.executeScript({file: "content_script3.js})})
  let orLaws="";
  const orLawRadios = document.querySelectorAll('input[name="orLaws"]'); //pulls data from OrLaw source radio buttons on website
  for (const choice of orLawRadios){
    if (choice.checked) {
      chrome.storage.sync.set({'lawsReaderStored': choice.id});
      orLaws=choice.id;
    };
  };
  // defintely working: alert(`Saved: LawsReader = ${orLaws}  Is dark = ${document.getElementById("isDark").checked}`)
};
