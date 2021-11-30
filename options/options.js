//@ts-check

const background = document.getElementById("background");
const altBack = document.getElementById("altBack");
const formBack = document.getElementById("formBack");
const buttonColor = document.getElementById("buttonColor");
const maintext = document.getElementById("maintext");
const heading = document.getElementById("heading");
const linkExt = document.getElementById("linkExt");
const docStyle = document.head.getElementsByTagName("style")

const loadData = () => {
    try {
        // @ts-ignore
        chrome.storage.sync.get("userColors", (userColors) => {
            const colors = userColors.userColors
            console.log(colors)
            // @ts-ignore
            background.value = colors.background;
            // @ts-ignore
            altBack.value = colors.altBack;
            // @ts-ignore
            formBack.value = colors.formBack;
            // @ts-ignore
            buttonColor.value = colors.buttonColor;
            // @ts-ignore
            maintext.value = colors.maintext;
            // @ts-ignore
            heading.value = colors.heading;
            // @ts-ignore
            linkExt.value = colors.linkExt;
        });
    } catch (e) {
        console.log (e)
    }
  };

const itemList = () => {
    return new Promise((resolve) => {
    // @ts-ignore
    chrome.storage.sync.get(null, (items) => {
        resolve(items)
    })
})
}

(async ()=>{console.log (await itemList())})()

document.getElementById("save").addEventListener("click", () => {
  console.log (background)
  try {
    // @ts-ignore
    chrome.storage.sync.set(
      {
        userColors: {
          // @ts-ignore
          background: background.value, 
          // @ts-ignore
          altBack: altBack.value,
          // @ts-ignore
          formBack: formBack.value,
          // @ts-ignore
          buttonColor: buttonColor.value,
          // @ts-ignore
          maintext: maintext.value,
          // @ts-ignore
          heading: heading.value,
          // @ts-ignore
          linkExt: linkExt.value,
        },
      },
      async () => {
        // update css on options.html
        // notify tabs that css is updataed
        // Message passing to ORS tabs (no response)

        try {
          const orsTabs = await getOrsTabs();
          for (const aTab of orsTabs) {
            //@ts-ignore
            chrome.tabs.sendMessage(aTab.id, { toMORS: "css" });
          }
        } catch (e) {
          console.warn(e)
        }

        console.log ("Successful save")
      }
    );
  } catch (e) {
    console.warn(e)
  }
  window.addEventListener("load", loadData);
})

function getOrsTabs() {
  return new Promise((resolve, reject) => {
    try {
      //@ts-ignore
      chrome.tabs.query(
        { url: "*://www.oregonlegislature.gov/bills_laws/ors/ors*.html*" },
        (tabs) => {
          resolve(tabs);
        }
      );
    } catch (e) {
      reject(`Failed while looking for tabs with ORS. Error ${e}`);
    }
  });
}

