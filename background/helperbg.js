//helperbg.js
//@ts-check

console.clear()

const infoLog = (/** @type {string} */ infoTxt, script="helperbg.js", calledBy="", /** @type {string} */ color) => {
  if (color == undefined) color = "cyan";
  if (calledBy == undefined) calledBy = "";
  if (script == undefined) script = "helperbg.js";
  console.info(
    `%c${script} ${calledBy}:%c ${infoTxt}`,
    `color:${color}`,
    "color:default"
  );
};

const warnLog = (/** @type {string} */ warnTxt, script="helperbg.js", calledBy="", color="cyan") => {
  console.warn(
    `%c${script} ${calledBy}:%c ${warnTxt}`,
    `color:${color}`,
    "color:default"
  );
};