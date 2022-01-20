//helperbg.js
//@ts-check

console.clear()

const infoLog = (infoTxt, script, calledBy, color) => {
  if (color == undefined) color = "green";
  if (calledBy == undefined) calledBy = "";
  if (script == undefined) script = "helperbg.js";
  console.info(
    `%c${script}%c:${calledBy} ${infoTxt}`,
    `color:${color}`,
    "color:default"
  );
};

const warnLog = (warnTxt, script="helperbg.js", calledBy="", color="green") => {
  console.warn(
    `%c${script}%c:${calledBy} ${warnTxt}`,
    `color:${color}`,
    "color:default"
  );
};