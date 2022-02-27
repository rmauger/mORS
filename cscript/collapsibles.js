//collapsibles.js
//CHROME = FIREFOX
//@ts-check

/**
 * collapses single ORS section
 * @param {Element} collapseElem
 */
 function collapseSingle(collapseElem) {
  if (!collapseElem) {
    warnCS("No collapsible found?", "collapsibles.js", "collapseSingle");
  } else {
    collapseElem.style.maxHeight = "0px";
    collapseElem.previousSibling.classList.remove("expanded")
  }
}
/** expands single ORS section
 * @param {Element} collapseElem
 */
function expandSingle(collapseElem) {
  if (collapseElem) {
    if (collapseElem.classList.contains("collapsible")) {
      collapseElem.previousSibling.classList.add("expanded");
      collapseElem.style.maxHeight = "none";
    } else {
      warnCS(
        `Target ${collapseElem.innerHTML} is not an expanded section`,
        "collapsibles.js"
      );
    }
  } else warnCS("No button element found.", "collapslibles.js");
}


// Collapses all ORS sections to 0 height
function collapseAllSections() {
  const collapsibles = document.getElementsByClassName("collapsible");
  for (let i = collapsibles.length - 1; i >= 0; i--) {
    collapseSingle(collapsibles[i]);
  }
}
// Expands all ORS sections to full height
function expandAllSections() {
  const collapsibles = document.getElementsByClassName("collapsible");
  for (let i = collapsibles.length - 1; i >= 0; i--) {
    expandSingle(collapsibles[i]);
  }
}