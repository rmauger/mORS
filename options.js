//@ts-check

const background = document.getElementById("background");
const altBack = document.getElementById("altBack");
const formBack = document.getElementById("formBack");
const buttonColor = document.getElementById("buttonColor");
const maintext = document.getElementById("maintext");
const heading = document.getElementById("heading");
const linkExt = document.getElementById("linkExt");

const loadData = () => {
    try {
        chrome.storage.sync.get("userColors", (userColors) => {
            const colors = userColors.userColors
            console.log(colors)
            background.value = colors.background;
            altBack.value = colors.altBack;
            formBack.value = colors.formBack;
            buttonColor.value = colors.buttonColor;
            maintext.value = colors.maintext;
            heading.value = colors.heading;
            linkExt.value = colors.linkExt;
        });
    } catch (e) {
        console.log (e)
    }
  };

const itemList = () => {
    return new Promise((resolve) => {
    chrome.storage.sync.get(null, (items) => {
        resolve(items)
    })
})
}

(async ()=>{console.log (await itemList())})()

document.getElementById("save").addEventListener("click", () => {
  console.log (background)
  try {
  chrome.storage.sync.set(
    {
      userColors: {
        background: background.value, 
        altBack: altBack.value,
        formBack: formBack.value,
        buttonColor: buttonColor.value,
        maintext: maintext.value,
        heading: heading.value,
        linkExt: linkExt.value,
      },
    },
    () => {
      // update css on options.html
      // notify tabs that css is updataed
    }
  );
  console.log ("Successful save")
} catch(e) {
    console.log (e)
}
});
window.addEventListener("load", loadData);



