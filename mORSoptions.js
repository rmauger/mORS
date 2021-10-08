"use strict"
displayUserOptions();
document.getElementById('optionsSubmit').onclick = function () {
  let orLaws="";
  const radioButtons = document.querySelectorAll('input[name="orLaws"]');
  for (const choice of radioButtons){
    if (choice.checked) {
      orLaws = choice.id;
    }
  }
  let UserData = {
    isDark:document.getElementById("isDark").checked,    
  }
  chrome.storage.sync.set({'checkedOptions': UserData})
  chrome.storage.sync.set({'lawsReader': orLaws});
};

function displayUserOptions(){
  
  chrome.storage.sync.get(['checkedOptions'], function(object) {
    let SavedData = object.checkedOptions || false;
    document.getElementById('isDark').checked=SavedData.isDark
  });
  chrome.storage.sync.get(['lawsReader'], function(object) {
    let SavedData = object.lawsReader || "";
    switch (SavedData) {
      case "Hein":
        document.getElementById('Hein').checked=true;
      break;
      case "OrLeg": 
        document.getElementById('OrLeg').checked=true;
      break
      default:
        document.getElementById('None').checked=true; 
      break;
    };
  });  
}