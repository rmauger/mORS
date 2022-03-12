//@ts-check
//mORS.js

const runMain = async ()=> {
  const initialTabUrl = await promiseGetTabURL(); // pull out tag (#) from URL, if any (done first in case user changes active tab during load)
  
  // TODO: #50 split errata fixing into new module 
  ErrataFixer: {let tempText = document.body.innerHTML
  const jsonErrata = await sendAwaitResponse("getErrataJson")
  const errataList=jsonErrata.response
  console.log (errataList)
    for(var key in errataList) {
      console.log (errataList[key])
      console.log (errataList[key]['old'])
      tempText = tempText.replace(new RegExp(errataList[key]['old'], "g"), errataList[key]['new'])
    }
    document.body.innerHTML=tempText}
  // END 
  let html = SyncReplaceText(); // syncclean.js : make tweaks to head, toc & body based (mostly) on regEx (no async/await)
  const addOrLaws = await OrLawLinking(html["Body"]); // orlawlink.js : add links for OrLaws based on stored data
  finalCleanUp({head: html["Head"], toc: html["TOC"], body: addOrLaws,}); // finalclean.js : puts together pieces, does post html rendering cleanup
  await javaDOM(); // javadom.js : add buttons for collapsable sections, expanding links & floating div menu 
  await implementUserParameters(); // storeddata.js : implement remaing stored data (other than OrLaw lookup/menu) for rsec
  navigateToTag(initialTabUrl); // navtotag.js : navigate to tag (#) in url, if any
}

// GlobalVariables 
const tocBreak = "!@%";
startUp() // helpchrome.js or helpfirefox.js