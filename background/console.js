/**
 * @param {string} warningId
 * @param {string} msgTxt
 */
 function logOrWarn(msgTxt, warningId = "") {
    console.warn(`%cNotification: ${msgTxt}`, "color:pink");
    if (warningId != "") {
      const newDate = new Date();
      const myId =
        warningId +
        newDate.getHours() +
        newDate.getMinutes +
        newDate.getMilliseconds;
      // @ts-ignore
      chrome.notifications.create(
        myId,
        {
          // @ts-ignore
          iconUrl: chrome.runtime.getURL("images/icon48.png"),
          title: `Warning! ${warningId}`,
          type: "basic",
          message: msgTxt,
          priority: 2,
        },
        () => {}
      );
    }
  }