"use strict"
displayUserOptions();
document.getElementById('optionsSubmit').onclick = function () {
  let orLaws="";
  const radioButtons = document.querySelectorAll('input[name="orLaws"]');
  for (const choice of radioButtons){
    if (choice.checked) {
      const orLaws = choice.value;
    }
  }
  let UserData = {
    doesExist: true,
    isDark: (document.getElementById('isDark').checked),
    sourceOrLaws: orLaws
  }
  chrome.storage.sync.set({'mORSoptions': UserData});
};

function displayUserOptions(){
  
  chrome.storage.sync.get(['mORSoptions'], function(object) {
  let SavedData = object.mORSoptions || []; 
    if (SavedData.doesExist){
      alert (SavedData.sourceOrLaws + SavedData.doesExist + SavedData.isDark);
      switch (SavedData.sourceOrLaws) {
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
      document.getElementById('isDark').checked=SavedData.isDark
    }; 
  });  
}