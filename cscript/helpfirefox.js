//foxhelp.js
//@ts-check

const sendAwaitResponse = (messageItem) => {
  return browser.runtime.sendMessage({ message: messageItem });
}

const createStyleSheet = () => {
  window.addEventListener("load", styleSheetCreate());
}

const startUp = () => {
  window.addEventListener("DOMContentLoaded", runMain());
}