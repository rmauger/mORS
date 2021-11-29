//@ts-check
//mORS.js



// MAIN mORS.js
(() => {
  window.addEventListener("load", async function () {
    const initialTabUrl = await promiseGetTabURL(); // pull out any tag (#) from URL to navigate to specific section after load
    const html = SyncReplaceText(); // make tweaks to head, toc & body based namely on regEx (all sync, no async/await)
    const addOrLaws = await OrLawLinking(html["body"]); // add links for OrLaws based on stored chrome data
    finalCleanUp({head: html["mainhead"], toc: html["headAndToc"], body: addOrLaws,});
    await javaDOM(); // add buttons for collapsable sections & popover floating fixed div buttons menu 
    await implementStoredParameters(); // implement remaing stored chrome data (other than OrLaw lookup/menu) 
    navigateToTag(initialTabUrl); //navigate to any tag (#) in url
  })
})()