/* Not sure if this will ever work, but low priority...
chrome.storage.onChanged.addListener(function (changes, namespace) {
  alert('running, at least')
  var keys=Object.keys(Object.entries(changes));
  for (var i=0; i < keys.length; i++) {
    var myVal = Object.entries[keys[i]];
    alert(myVal);
  }
}); 

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var myA="";
  const myQ = request.bgQuery;
    switch (myQ) {
    case "isDark":
      chrome.storage.sync.get('isDarkStored', (object) => {
        myA = object.isDarkStored||false
      });
      break;
    case "lawsReader":
      chrome.storage.sync.get('lawsReaderStored', function(object) {
        myA = object.lawsReaderStored||"flagFalse"
      });
      break;
    default:      
      myA= "I don't understand the question."
      break;
    };
  sendResponse({ans: myA});
  console.log(`Sending in response to *${myQ}* answer: *${myA}*`);
  return true;
});

function getDark() {
  return chrome.storage.sync.get('isDarkStored', function(object) {return object.isDarkStored || false})
}
*/