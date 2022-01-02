//foxhelp.js
//@ts-check

function sendAwaitResponse(messageItem) {
  return browser.runtime.sendMessage({ message: messageItem });
}

function createStyleSheet (){
  window.addEventListener("load", styleSheetCreate());
}

function startUp() {
  window.addEventListener("DOMContentLoaded", runMain());
}