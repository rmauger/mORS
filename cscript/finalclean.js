//finalclean.js
//@ts-check

/**
 * @param {{ [x: string]: any; head?: string; toc?: string; body?: any; }} html
 */
 function finalCleanUp(html) {
    document.body.innerHTML = html["head"] + html["toc"] + html["body"];
    let tocID = document.getElementById("toc");
    if (Boolean(tocID)) {
      let allTocPs = tocID.getElementsByTagName("p");
      for (let aP of allTocPs) {
        aP.className += " toc";
      }
    }
    let cleanUpBreaks = document.querySelectorAll("[break]");
    for (let elem of cleanUpBreaks) {
      elem.removeAttribute("break");
    }
    let allElements = document.getElementsByTagName("*");
    for (let elem of allElements) {
      //@ts-ignore
      if (/^(\s|\&nbsp)+$ /.test(elem.innerText)) {
        console.info(`deleting ${elem.innerHTML}`);
        elem.remove();
      }
    }
  }