
DisplayUserOptions();
document.getElementById('optionsSubmit').onclick = SaveUserOptions();

function SaveUserOptions() {
  SavedDataObj.formDark = document.getElementById('dark').value();
  let SavedUserData.doesExist = True;
  let SavedUserData.formHein = document.getElementById('Hein').value();
  let SavedUserData.formOrLeg = document.getElementById('OrLeg').value();
  let SavedUserData.formNone = document.getElementById('None').value();
  chrome.storage.local.set({'mORSoptions': SavedData});
  
//  chrome.tabs.executeScript(null, {
//    file: 'content_script.js'
};


function displayUserOptions(){
   chrome.storeage.local.get(['storedUserOptions', SavedData])
   if (SavedData.exists)
   
}