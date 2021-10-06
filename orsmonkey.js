// ==UserScript==
// @name         mORS
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Cleans up orleg's ORS chapters
// @author       Robert Mauger (bobby.mauger@gmail.com)
// @match        *://www.oregonlegislature.gov/bills_laws/ors/*.html
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
/* Misc used later */
    const tabs = "(?:&nbsp;){2,8}";
    const chapStr = /(?<=Chapter\s)(\d{1,3}[A-C]?)/;

/*    HTML Cleanup    */
    const styleGarb = /<span style=[\s\S]+?>([\s\S]+?)<\/span>/g; // is deleted
    const msoGarb = /<p\sclass="?MsoNormal"?[\s\S]+?(?:"|')>/g; // is replaced by next line:
    const msoClean = '<p class=default>';
    const doubleP = /<p[^>]*?>(?:&nbsp;)+<\/p>/g; // is deleted
    const divGarb = /<div[^]*?>/g; // is deleted

/*    Chapter Headings    */
    const chapHead = /<p class=default>(Chapter (\d{1,3}[A-C]?) — ([\s\S]*?))<\/p>/; // is replaced by:
    const headClean = '<title>ORS $2: $3</title><h1>$1</h1>';
    const edYear = /(?=<\/h1>)[\s\S]*?<p class=default>([\s\S]+?)<\/p>/ // is replaced by:
    const yearClean = '</h1><h2>$1</h2>'
    const title = /<h1>([\s\S]*?)<\/h1>[\s\S]*?(<h2>[\s\S]*?<\/h2>)[\s\S]*?<p[\s\S]*?\/p>[\s\S]*?<p[\s\S]*?>([\s\S]*?)<\/p>/ //is replaced by:
    const titleClean = '<h3>TITLE: $3</h3><h1>$1</h1>$2'

/*   ORS References    */
    const orsRef = /((\d{1,3}[A-C]?\.\d{3})((?:\s?(?:\(\w{1,4}\))){0,5})( to (?:(?:\(\w{1,4}\))))?)/g; // is replaced by:
    const repORS = '<span class=ors>$1</span>';

/*   Subsections */
    const Sub1 = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
    const aSub = new RegExp("<p[^>]*?>"+ tabs + "?\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g');
    const bPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([a-z]{1,3}\\)[^]+?)</p>", 'g');
    const cSPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([A-Z]{1,3}\\)[^]+?)</p>", 'g');
    const dSSPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g');
    const repA = '<p class=subsec>$1</p>'
    const repB = '<p class=para>$1</p>'
    const repC = '<p class=subpara>$1</p>'
    const repD = '<p class=subsubpara>$1</p>'

/*   Source Notes    */
    const orLaw = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
    const hein = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
    const repOL = '<a href=' + hein + '>$1 c.$2</a>';
    const sNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
    const repSN = '<p class=sourceNote>$1</p>'

/*   TOC    */
    const tOC = new RegExp("(?<=<\\/h2>[^]*?).*?((\\d{1,3}\\.\\d{3}\\b)[^]*)(?=<p[^]*"+ tabs + "\\s?\\2)"); // is replaced by:
    const repTOC = '<div class=toc><h2>Table of Contents</h2><div class=tocitems><p class=default>$1</div></div><div class=orsbody>';
    window.addEventListener("load", ReplaceText);


    function ReplaceText(){
        /* basic cleanup */
        let temp=document.body.innerHTML
        temp = temp.replace(styleGarb, '$1');
        temp = temp.replace(msoGarb, msoClean);
        temp = temp.replace(divGarb, '');
        temp = temp.replace(doubleP, '');
        temp = temp.replace(chapHead, headClean);
        temp = temp.replace(edYear, yearClean);
        temp = temp.replace(title, titleClean);
        temp = temp.replace(tOC, repTOC);
        temp = temp.replace(orsRef, repORS);
        temp = temp.replace(sNote, repSN);

        /* Finding leadlines */
        const chapNum = temp.match(chapStr)[1];
        const orsLead = "((?:<span class=ors>)?(" + chapNum + "\\.\\d{3})[^\\]]+?\\.)"
        let orsHead = new RegExp("<b>[^\\[]*?" + tabs + "\\s?" + orsLead + "</b>",'g');
        let repOrsH = '<p class=leadline id="$2">$1</p><p class=default>';
        temp = temp.replace(orsHead, repOrsH);

        /* In chapter hyperlinks */
        const hyperOrs = new RegExp("<span class=ors(>(" + chapNum + "\\.\\d{3})[^]*?<)\\/span>", 'g');
        const repHOrs = '<a class=ors href="#$2"$1a>';
        SendToConsole(temp, hyperOrs);
        temp = temp.replace(hyperOrs, repHOrs)

        /* finding subsections */
        temp = temp.replace(Sub1, repA);
        temp = temp.replace(aSub, repA);
        temp = temp.replace(bPar, repB);
        temp = temp.replace(cSPar, repC);

        /* HeinOnline Links */
        temp = temp.replace(orLaw, repOL);
        document.body.innerHTML = temp;

        /* replacing stylesheet */
        let newStyle = `
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
        .leadline {
            font:12pt "Times New Roman", Times, serif;
            font-weight: bold;
            color: #900000;
            margin-block-start: 1.5em;
        }
        .ors {
            background-color: #bbffdd;
        }
        .toc {
            padding: 1em;
            border: 3px solid red;
            background-color: #ffffc0;
        }
        .tocitems {
            columns: 300px 4;
        }
        .orsbody {
            background-color: #fff9f3;
        }
        .default {
            color:#666666;
        }
        .sourceNote {
            color:#000099;
            font: 9pt "Times New Roman", Times, serif;
            margin-block-start:0;
            margin-block-end:1em;
        }
        .subsec{
            color:#007000;
            text-indent:-1em;
            padding-left:1.5%;
            margin-block-end:0;
            margin-block-start: .2em;
        }
        .para{
            color:#5500d0;
            text-indent:-1em;
            padding-left:3%;
            margin-block-end:0;
            margin-block-start: .2em;
        }
        .subpara{
            color:#d00055;
            text-indent:-1em;
            padding-left:4.5%;
            margin-block-end:0;
            margin-block-start: .2em;
        }
        .subsubpara{
            color:#c00055;
            padding-left:6%;
            text-indent:-1em;
            margin-block-end:0;
            margin-block-start: .2em;
        }
        `;
        document.head.querySelectorAll("style")[0].innerHTML=newStyle;
    }

    function SendToConsole(htmlText, logText){
        let cleanUp = htmlText.replace(/(\r|\n|\f)+/g, '\n');
        cleanUp = cleanUp.replace(/(<\/[^]+?>)/g, '$1\n');
        cleanUp = cleanUp.replace(/(\r|\n|\f)+/g, '\n');
        console.log(logText);
        console.log(cleanUp);
    }

})();
