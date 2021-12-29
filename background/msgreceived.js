//@ts-check
  browser.runtime.onMessage.addListener((message, sender, response) => {
    const received = message.message;
    if (typeof received == "string") {
      switch (received) {
        case "getOrLaw":
          msgHandler(promiseGetFromStorage("lawsReaderStored"), response);
          break;
        case "getCssUserOption":
          msgHandler(promiseGetFromStorage("cssSelectorStored"), response);
          break;
        case "getShowSNs":
          msgHandler(promiseGetFromStorage("showSNsStored"), response);
          break;
        case "getShowBurnt":
          msgHandler(promiseGetFromStorage("showBurntStored"), response);
          break;
        case "getShowMenu":
          msgHandler(promiseGetFromStorage("showMenuStored"), response);
          break;
        case "getCollapsed":
          msgHandler(promiseGetFromStorage("collapseDefaultStored"), response);
          break;
        case "getUserColors":
          msgHandler(promiseGetFromStorage("userColors"), response);
          break;
        case "getCurrentTab":
          msgHandler(promiseGetActiveTab("msgHandler"), response);
          break;
        case "getOrsTabs":
          msgHandler(promiseGetOrsTabs(), response);
          break;
        case "generateCssString":
          msgHandler(promiseGenerateCss(), response);
          break;
        case "getCssTemplateFile":
          msgHandler(promiseGetCssTemplate(), response);
          break;
        case "getCssObjectJson":
          msgHandler(promiseReadJsonFile("cssObject.json"), response);
          break;
        default:
          logOrWarn(
            `Received message "${received}"made no sense.`,
            "Invalid message to script; no response sent."
          );
          break;
      }
    } else if (received.orLawObj) {
      try {
        msgHandler(
          promiseGetOrLegUrl(
            received["orLawObj"].year,
            received["orLawObj"].chap,
            received["orLawObj"].reader
          ),
          response
        );
      } catch (e) {
        logOrWarn(e)
      }
    } else if (received.info) {

    } else if (received.warn) {
    
    } else if (received) {
        console.group("Unidentified message");
        console.warn(`Received unidentified message`);
        console.warn(received);
        console.groupEnd();
        response(`Error: Received unidentified message ${received}`);
    }
    return true;
  });