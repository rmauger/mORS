// ==UserScript==
// @name         mORS
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Cleans up Oregon Legislature's ORS chapters
// @author       Robert Mauger (bobby.mauger@gmail.com)
// @match        *://www.oregonlegislature.gov/bills_laws/ors/*.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    window.addEventListener("load", ReplaceText);
    window.addEventListener("load", StyleSheet);

    function ReplaceText(){
        //common variables:
        const tabs = "(?:&nbsp;|\\s){2,8}";
        let temp=document.body.innerHTML;
        const chapNum = temp.match(/(?<=Chapter\s)(\d{1,3}[A-C]?)/)[1];

        const doubleP = /<(\w)[^>]*?>(?:&nbsp;|\s)*<\/\1>/g; // is deleted (used in FinalClean also)
        HTMLCleanUp();
        function HTMLCleanUp(){
            const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
            const msoGarb = /<p\sclass="?MsoNormal"?[^]+?(?:"|')>/g; // is replaced by next line:
            const msoClean = '<p class=default>';
            const divGarb = /<div[^]*?>/g; // is deleted
            temp = temp.replace(/(\n|\r|\f)/g, ' ');
            temp = temp.replace(/\s\s/, ' ');
            temp = temp.replace(styleGarb, '$1');
            temp = temp.replace(msoGarb, msoClean);
            temp = temp.replace(divGarb, '');
            temp = temp.replace(doubleP, '');
        };

        ChapterHeadings();
        function ChapterHeadings(){
            const chapHead = /<p class=default>(Chapter (\d{1,3}[A-C]?) — ([^]*?))<\/p>/; // is replaced by:
            const headClean = '<title>ORS $2: $3</title><h1>$1</h1>';
            const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/ // is replaced by:
            const yearClean = '</h1><h2>$1</h2>'
            const title = /<h1>([^]*?)<\/h1>[^]*?(<h2>[^]*?<\/h2>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/ //is replaced by:
            const titleClean = '<h3>TITLE: $3</h3><h1>$1</h1>$2'
            temp = temp.replace(chapHead, headClean);
            temp = temp.replace(edYear, yearClean);
            temp = temp.replace(title, titleClean);
        };

        TableOfContents();
        function TableOfContents(){
            const tOC = new RegExp("(?<=<\\/h2>[^]*?)(<p[^>]*?>[^]*?<\\/p>)([^]*?)(?=\\1|<p class=default><b>)"); // is replaced by:
            const repTOC = '<div id=toc><h2>Table of Contents</h2><div class=tocItems>$1$2</div></div><div class=orsbody>';
            temp = temp.replace(tOC, repTOC);
        };

        ORSHighlight();
        function ORSHighlight(){
            const orsRef = /((\d{1,3}[A-C]?\.\d{3})((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)/g; // is replaced by:
            const repORS = '<span class=ors>$1</span>';
            temp = temp.replace(orsRef, repORS);
        };

        Leadlines();
        function Leadlines(){
            const orsLead = "(?:<span class=ors>)(" + chapNum + "\\.\\d{3})<\/span>([^\\.][^\\]]+?\\.)";
            const orsHead = new RegExp("<p class=default><b>" + tabs + orsLead + "</b>",'g');
            const repOrsH = '<p class=leadline id="$1">$1$2</p><p class=default>';
            temp = temp.replace(orsHead, repOrsH);
        };

        ORSHyperLinks();
        function ORSHyperLinks(){
            const inChap = new RegExp("<span class=ors(>(" + chapNum + "\\.\\d{3})[^]*?<\\/)span", 'g');
            const repInChap = '<a class=ors href="#$2"$1a';
            temp = temp.replace(inChap, repInChap);

            OutOfChapter();
            function OutOfChapter(){
                let oocCount = 0;
                let tempReplace = "";
                let repNotChap = "";
                const orsURL = "https://www.oregonlegislature.gov/bills_laws/ors/ors";
                const notChap = /<span class=ors(>\d{1,3}[A-C]?\.\d{3}[^<[]*?<\/)span/;
                const otherChap = /\d{1,3}[A-C]?(?=\.)/

                while (temp.match(notChap) && oocCount < 1000) {
                    oocCount +=1;
                    tempReplace = temp.match(notChap)[1];
                    tempReplace = tempReplace.match(otherChap);
                    tempReplace = ThreeDigit(tempReplace);
                    repNotChap = "<a href='" + orsURL + tempReplace + ".html'$1a";
                    temp = temp.replace(notChap, repNotChap);
                };

                function ThreeDigit(orsNumber){
                    orsNumber=orsNumber.toString();
                    let myLen = orsNumber.length;
                    if (orsNumber.match(/\d+[A-C]/)) {
                        myLen=myLen-1
                    };
                    switch(myLen) {
                        case 1:
                            return "00" + orsNumber;
                        case 2:
                            return "0" + orsNumber;
                        default:
                            return "" + orsNumber
                    };
                };
            };
        };

        Notes();
        function Notes(){
            const aNote = new RegExp('<p[^>]*><b>' + tabs + '(Note:<\\/b>[^]*?)(?=<\\/p>)', 'g');
            const repNote = "<p class=note><b>$1"
            temp = temp.replace(aNote, repNote);
            const noteSec = new RegExp('<p[^>]*?><b>' + tabs + "(<a[^>]*?>[\\S]{5,8}<\\/a>\\.<\\/b>)", 'g');
            const repNS = '<p class=note><b>Note section for $1</p><p class=default>'
            SendToConsole(temp, noteSec);
            temp = temp.replace(noteSec, repNS);
        }

        SubUnits();
        function SubUnits(){
            const Sub1 = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
            const aSub = new RegExp("<p[^>]*?>"+ tabs + "?\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g');
            const bPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([a-z]{1,3}\\)[^]+?)</p>", 'g');
            const cSPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([A-Z]{1,3}\\)[^]+?)</p>", 'g');
            const dSSPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g');
            const repA = '<p class=subsec>$1</p>'
            const repB = '<p class=para>$1</p>'
            const repC = '<p class=subpara>$1</p>'
            const repD = '<p class=subsubpara>$1</p>'
            temp = temp.replace(Sub1, repA);
            temp = temp.replace(aSub, repA);
            temp = temp.replace(bPar, repB);
            temp = temp.replace(cSPar, repC);
        }

        Headings();
        function Headings(){
            const head = /<p class=default>((?:[A-Z]|\s){5,}?)<\/p>/g //is replaced by:
            const repHead = '<p class=heading>$1</p>'
            const subHead = /<p class=default>(\([^]{5,}?\))<\/p>/g //is replaced by:
            const repSHead = '<p class=subhead>$1</p>'
            temp = temp.replace(head, repHead);
            temp = temp.replace(subHead, repSHead);
        }

        SourceNotes();
        function SourceNotes(){
            const sNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
            const repSN = '<p class=sourceNote>$1</p>'
            temp = temp.replace(sNote, repSN);

            DeadORS();
            function DeadORS(){
                const deadOrs = /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)<\/a><\/b> <p class=sourceNote>/g
                const repDeadO = "<p class='sourceNote dead'><b>$1</b>: "
                temp = temp.replace(deadOrs, repDeadO);
            }

            HeinLinks();
            function HeinLinks(){
                const heinURL = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
                const orLaw = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
                const repOL = '<a href=' + heinURL + '>$1 c.$2</a>';
                temp = temp.replace(orLaw, repOL);
            }
        }

        FinalClean();
        function FinalClean(){
            document.body.innerHTML = temp;
            document.body.innerHTML = document.body.innerHTML.replace(doubleP, '');
        }
    }

    function StyleSheet() {
        const indent1=3;
        const indentInc=1.5;
        const newStyle = `
h1 {
  color: #004499;
  font:18pt Garamond, serif;
  font-weight: bold;
  text-align: center;
}
h2 {
  font:16pt Garamond, serif;
  text-align: center;
}
h3 {
  font:14pt Garamond, serif;
  font-weight: bold;
  text-align: center;
}
p {
  margin-block-start: .5em;
  margin-block-end:.5em;
  font: 11pt Arial, sans-serif;
}
.default {
  color:#333300;
}
#toc {
  margin: 0% 1%;
  padding: 2% 3%;
  border: 3px solid #dddda9;
  background-color: #ffffc0;
}
#toc .default, .heading, .subhead {
  font-size: 10pt;
  text-indent:-1em;
  break-inside: avoid;
}
.tocItems {
  columns: 250px 4;
  column-gap:5%
}
.orsbody {
}
.heading {
  font:12pt "Times New Roman", Times, serif;
  font-weight: bold;
  text-align:center;
  margin-block-start: 1.5em;
  margin-block-end: .5em;
}
.subhead {
  font:12pt "Times New Roman", Times, serif;
  text-align:center;
  font-style:italic;
  margin-block-start: 1em;
  margin-block-end: .5em;
}
.leadline {
  font:12pt "Times New Roman", Times, serif;
  font-weight: bold;
  color: #900000;
  margin-block-start: 1.5em;
}
.sourceNote {
  color:#000099;
  font: 10pt "Times New Roman", Times, serif;
  margin-block-start:.2em;
  margin-block-end:1em;
}
.dead {
  margin-block-start:1.5em;
}
.note {
  font: 10pt, "Times New Roman", Times, serif;
  max-width: 600px;
  min-width: 300px;
  width: 60%;
  margin: .5em 3%;
  border: 3px solid #ffff00;
  background-color: #ffffdd;
}
.ors {
  color: #dd0000;
}
  a.ors:link, a.ors:visited {
  color:#337555;
}
a.ors:hover {
  color:#7777ee;
}
.subsec{
  text-indent:-1em;
  padding-left:`+ indent1 +`%;
  margin-block-end:0;
  margin-block-start: .2em;
}
.para{
  text-indent:-1em;
  padding-left:`+ (indent1+indentInc) +`%;
  margin-block-end:0;
  margin-block-start: .2em;
}
.subpara{
  text-indent:-1em;
  padding-left:`+ (indent1+2*indentInc)+`%;
  margin-block-end:0;
  margin-block-start: .2em;
}
.subsubpara{
  padding-left:`+ (indent1+3*indentInc) +`%;
  text-indent:-1em;
  margin-block-end:0;
  margin-block-start: .2em;
}`;
        document.head.querySelectorAll("style")[0].innerHTML=newStyle;
    }

    function SendToConsole(htmlText, logText){
        let cleanUp = htmlText.replace(/(\r|\n|\f)+/g, '');
        cleanUp = cleanUp.replace(/(<\/[^]+?>)/g, '$1\n');
        console.log(logText);
        console.log(cleanUp);
    }

})();
