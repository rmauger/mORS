//@ts-check
//FIREFOX = CHROME
//mORS.js

const runMain = async ()=> {
  const initialTabUrl = await promiseGetTabURL(); // pull out any tag (#) from URL to navigate to specific section after load
  const html = SyncReplaceText(); // make tweaks to head, toc & body based namely on regEx (all sync, no async/await)
  const addOrLaws = await OrLawLinking(html["body"]); // add links for OrLaws based on stored data
  finalCleanUp({head: html["mainhead"], toc: html["headAndToc"], body: addOrLaws,}); // finalclean.js - puts together pieces
  await javaDOM(); // javadom.js : add buttons for collapsable sections & popover floating fixed div buttons menu 
  await implementUserParameters(); // storeddata.js : implement remaing stored data (other than OrLaw lookup/menu) 
  navigateToTag(initialTabUrl); // navtotag.js : navigate to any tag (#) in url
}

startUp()