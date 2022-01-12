//foxhelp.js
//@ts-check

const sendAwaitResponse = (messageItem) => {
  return browser.runtime.sendMessage({ message: messageItem });
};

const createStyleSheet = () => {
  infoCS("loading CSS", "helpfirefox.js", "createStyleSheet");
  window.addEventListener("load", styleSheetCreate());
};

const startUp = () => {
  infoCS("running ORS cleanup", "helpfirefox.js", "startup");
  window.addEventListener("DOMContentLoaded", runMain());
};

infoCS("Running on firefox", "helpfirefox.js");
