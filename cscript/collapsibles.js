//collapsibles.js
//CHROME = FIREFOX
//@ts-check

// Collapses all ORS sections to button height
function collapseAllSections() {
  const collapsibles = document.getElementsByClassName("collapsible");
  let collapseObjHeightList = [];
  for (let i = 0; i < collapsibles.length; i++) {
    const buttonElement = collapsibles[i];
    collapseObjHeightList.push(findCollapseHeight(buttonElement));
  }
  for (let i = collapsibles.length - 1; i >= 0; i--) {
    collapseSingle(collapseObjHeightList[i]);
  }
}
/** returns object (HTML elements & their collapsed heights) (just one element, but may edit later)
 * @param {Element} buttonElement
 */
function findCollapseHeight(buttonElement) {
  const thisElement = buttonElement.parentElement;
  const thisHeight = `${buttonElement.scrollHeight}px`;
  buttonElement.classList.remove("expanded");
  return { anElement: thisElement, height: thisHeight };
}
/** collapses single ORS section
 * @param {{ anElement: HTMLElement; height: any; }} collapseObj
 */
function collapseSingle(collapseObj) {
  if (!collapseObj) {
    console.warn("No button found in object!?");
  } else {
    collapseObj.anElement.style.maxHeight = collapseObj.height;
  }
}
/** expands single ORS section
 * @param {Element} buttonElement
 */
function expandSingle(buttonElement) {
  if (buttonElement) {
    if (buttonElement.classList.contains("collapsible")) {
      const sectionDiv = buttonElement.parentElement;
      buttonElement.classList.add("expanded");
      sectionDiv.style.maxHeight = "none";
    } else {
      console.warn(
        `Target ${buttonElement.innerHTML} is not an expanded section`
      );
    }
  } else {
    console.warn("No button element found.");
  }
}
// Expands all ORS sections to full height
function expandAllSections() {
  const collapsibles = document.getElementsByClassName("collapsible");
  for (let i = collapsibles.length - 1; i >= 0; i--) {
    expandSingle(collapsibles[i]);
  }
}
