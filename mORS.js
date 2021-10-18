// @ts-check all errors resolved (except it doesn't understand "chrome")

window.addEventListener("load", ReplaceText);
window.addEventListener("load", StyleSheetRefresh);

function ReplaceText() { //main function adjusting HTML of Oregon Legislature ORS pages
	//global variables:
	let chpHTML=document.body.innerHTML;
	const tabs = "(?:&nbsp;|\\s){0,8}";
	const orsChapter = "\\b\\d{1,3}[A-C]?\\b"
	const orsSection = `(?:${orsChapter}\\.\\d{3}\\b|\\b7\\dA?\\.\\d{4}\b)`
	const chapMatch = new RegExp(`(?<=Chapter\\s)${orsChapter}`)
	const chapNum = chpHTML.match(chapMatch)[0];
	const doubleP = /<(\w)[^>]*?>(?:&nbsp;|\s)*<\/\1>/g; // is deleted (in first HTMLCleanUp & FinalClean)
	HTMLCleanUp();  // delete stylesheet & references to it and confusing span syntex from HTML
	function HTMLCleanUp() {
		document.head.getElementsByTagName('style')[0].innerHTML="";
		chpHTML=document.body.innerHTML;
		const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
		const msoGarb = /<p\sclass=\W?Mso[^>]*>/g; // is replaced by:
		const msoRepl = '<p class=default>';
		const divGarb = /<div[^>]*?>/g; // is deleted
		chpHTML = chpHTML.replace(/(\n|\r|\f)/g, ' ');
		chpHTML = chpHTML.replace(/\s\s/, ' ');
		chpHTML = chpHTML.replace(styleGarb, '$1');
		chpHTML = chpHTML.replace(msoGarb, msoRepl);
		chpHTML = chpHTML.replace(divGarb, '');
		chpHTML = chpHTML.replace(doubleP, '');
	};
	ChapterHeadings();
	function ChapterHeadings() { // Add tags to volume title & ORS chapter & edition year; set title displayed on tab
		const chapMainHead = new RegExp(`<p class=default>(Chapter\\s(${chapNum})\\s—?\\s?([^]*?))<\\/p>`); // is replaced by:
		const mainHeadRepl = '<title>ORS $2: $3</title><h1>$1</h1>';
		const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/; // is replaced by:
		const yearRepl = '</h1><h2>$1</h2>'
		const title = /<h1>([^]*?)<\/h1>[^]*?(<h2>[^]*?<\/h2>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/; //is replaced by:
		const titleRepl = '<h3>TITLE: $3</h3><h1>$1</h1>$2';
		chpHTML = chpHTML.replace(chapMainHead, mainHeadRepl);
		chpHTML = chpHTML.replace(edYear, yearRepl);
		chpHTML = chpHTML.replace(title, titleRepl);
	};
	TableOfContents();
	function TableOfContents() { //create & label new division for table of contents
		const tocFind = new RegExp("(?<=<\\/h2>[^]*?)(<p[^>]*?>[^]*?<\\/p>)([^]*?)(?=\\1|<p class=default><b>)"); // is replaced by:
		const tocRepl = '<div id=toc><h1>Table of Contents</h1><div class=tocItems><div><div>$1$2</div></div>?#@<div class=orsbody>';
		chpHTML = chpHTML.replace(tocFind, tocRepl);
	};
	ORSHighlight();
	function ORSHighlight() { //highlight all cross references to ORS sections (xx.xxx) (to be replaced later by relevant links)
		const orsFind = new RegExp (`(${orsSection}((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)`, 'g'); // is replaced by:
		const orsRepl = '<span class=ors>$1</span>';
		chpHTML = chpHTML.replace(orsFind, orsRepl);
	};
	Leadlines();
	function Leadlines() { //highlight & create new div for each new section 
		const orsSecLead = "(?:<span class=ors>)(" + chapNum + "\\.\\d{3,4}\\b)<\/span>([^\\.][^\\]]+?\\.)";
		const leadFind = new RegExp("<p class=default><b>" + tabs + orsSecLead + "</b>",'g');
		const leadRepl = '</div><div class=section id="$1" break="~"><b class=leadline>$1$2</b><p class=default>';
		chpHTML = chpHTML.replace(leadFind, leadRepl);
	};
	Forms();
	function Forms() { // find beginning and end of forms to create new div for each
		const startForm = new RegExp("(form[^]*?:)<\\/p>"+ tabs +"(<p[^>]*>)_{78}", 'g'); // finds start of form
		const startFormRepl = "$1</p><div class=orsForm break='`'>$2" //inserts it as a new div
		const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g;  
		const endFormRepl = "$1</div break='`'>";
		const endFormCleanup =/(_{78}<\/div>)/g;
		chpHTML = chpHTML.replace(startForm, startFormRepl);
		chpHTML = chpHTML.replace(endForm, endFormRepl);
		chpHTML = chpHTML.replace(endFormCleanup, '$1')
	};
	orsInChapLink();
	function orsInChapLink() { // change xrefs to ORS sections in chapter to links to #id of ORS section
		const orsInChp = new RegExp("<span class=ors(>(" + chapNum + "\\.\\d{3,4}\\b)[^]*?<\\/)span", 'g');
		const orsInChpRepl = '<a class=ors href="#$2"$1a';
		chpHTML = chpHTML.replace(orsInChp, orsInChpRepl);
	};
	orsOutChapLink();
	function orsOutChapLink() { // change xrefs to ORS sections outside chapter to links to ORS chapter external webpage.
		let listOfORSChps =[];
		const orsOrLegURL = "https://www.oregonlegislature.gov/bills_laws/ors/ors";
		const notChap = new RegExp(`=ors>${orsChapter}`, 'g'); 
		let temp=chpHTML;
		for (let i = 0; i < 500; i++) { //getting list of referenced ORS sections not in this chapter & chapter for each
			let strMatch=temp.match(notChap);
			if (strMatch) {
				let chapNo=strMatch[0].match(new RegExp(orsChapter)); // finds chapter to match
				listOfORSChps.push(chapNo);
				temp=temp.replace(new RegExp('>'+chapNo +'\\.', 'g'), "XXX"); // removes chapter so it doesn't get picked up again
			} else {
				break;
			};
		};
		function onlyUnique(value, index, self) { // removing duplicates from the list of ORS chapters
			return self.indexOf(value) === index;
		};
		listOfORSChps = listOfORSChps.filter(onlyUnique);
		if (listOfORSChps.length>0){ 
			for (let eachORSChp of listOfORSChps) {
				let orsOutChp = new RegExp("<span class=ors>("+eachORSChp+"\\.\\d{3,4}\\b[^]*?)<\\/span>", 'g');				
				let orsOutChpRepl=`<a href="${orsOrLegURL}${eachORSChp}.html">$1</a>`;
				chpHTML=chpHTML.replace(orsOutChp, orsOutChpRepl);
				chpHTML=chpHTML.replace(/\d+(\d{3}[A-C]?\\.html)/g, "$1")
			};
		};		
	};
	Notes();
	function Notes() { // finds Note: in ORS & classes; finds note secs; Adds hyperlinks for Preface to ORS & vol22
		const noteFind = new RegExp('<p[^>]*>\\s?<b>' + tabs + '(Note(\\s\\d)?:\\s?<\\/b>[^]*?)(?=<\\/p>)', 'g'); // is replaced by:
		const noteRepl = '<p class=note><b>$1'
		const noteSec = new RegExp('<p[^>]*?><b>' + tabs + "(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>", 'g'); //is replaced by:
		const noteSecRepl = '<p class=note><b>Note section for ORS $1:</b></p><p class=default>'
		const prefaceFind = /(Preface\sto\sOregon\sRevised\sStatutes)/g // is replaced by:
		const prefaceRepl = '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
		const v22Find = /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // is replaced by:
		const v22Repl = '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
		chpHTML = chpHTML.replace(noteFind, noteRepl);
		chpHTML = chpHTML.replace(noteSec, noteSecRepl);
		chpHTML = chpHTML.replace(prefaceFind, prefaceRepl);
		chpHTML = chpHTML.replace(v22Find, v22Repl);
	};
	SubUnits();
	function SubUnits() { // finds and classifies subunits (subsections, paragraphs, subsections etc.)
		const subsecOne = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
		const subsecFind = new RegExp("<p[^>]*?>"+ tabs + "?\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g'); //subsection (1)
		const subsubPara = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([a-z]{1,5}\\)[^]+?)</p>", 'g'); //subsubparagraphs (roman) (for now)
		const subsubsubPara = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([A-Z]{1,5}\\)[^]+?)</p>", 'g'); //subparagraphs (A)
		const subsecRepl = '<p class=subsec>$1</p>'
		const subsubRepl = "<p class=subsubpara>$1</p>"
		const subsubsubRepl = '<p class=subsubsubpara>$1</p>'
		chpHTML = chpHTML.replace(subsecOne, subsecRepl);
		chpHTML = chpHTML.replace(subsecFind, subsecRepl);
		chpHTML = chpHTML.replace(subsubPara, subsubRepl);
		chpHTML = chpHTML.replace(subsubsubPara, subsubsubRepl);
		Romans();
		function Romans() { // separate roman numerals (subsubpara & subsubsubpara) from letters (para & subpara)
	  		const sameLtrLower = /=subsubpara>(\(([a-z])(?:\2){0,4}\))/g; // paragraphs if 1 letter (a) or letters match (aa)
			const sameLetterUpper = /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/g; // subpara if 1 letter (A) or matching letters (AA)
			const ltrLowerRepl = "=para break='!'>$1";
			const ltrUpperRepl = "=subpara break='?'>$1";
			chpHTML = chpHTML.replace(sameLtrLower, ltrLowerRepl);
			chpHTML = chpHTML.replace(sameLetterUpper, ltrUpperRepl);
			const romanLowerLead = "((=subsubpara>[^!~]*))=para[^>]*?>(?=\\("; 
			const romanLowerRepl = "$1=subsubpara>";
			const romanUpperLead = "((subsubsubpara>[^~!?]*))=subpara[^>]*>(?=\\("; // last dealing with the more ambiguous ones (iii, v, x, xx, xxx) should work through 27 (XXVIII is too large)
			const romanUpperRepl = "$1=subsubsubpara>";
			const iiLower = /=para[^>]*>(\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/g; // next, get matching (i) & (ii) labeled as subsubs again
			const iiRepl = "=subsubpara>$1=subsubpara>"
			const IIUpper = /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/g; // next, get matching (i) & (ii) labeled as subsubs again
			const IIRepl = "=subsubsubpara>$1=subsubsubpara>"
			const iiiLower = new RegExp(romanLowerLead + "iii)", 'g');
			const vLower = new RegExp(romanLowerLead + "v)", 'g');
			const xLower = new RegExp(romanLowerLead + "x)", 'g');
			const xxLower = new RegExp(romanLowerLead + "xx)", 'g');
			const IIIUpper = new RegExp(romanUpperLead + "III)", 'g');
			const VUpper = new RegExp(romanUpperLead + "V)", 'g');
			const XUpper = new RegExp(romanUpperLead + "X)", 'g');
			const XXUpper = new RegExp(romanUpperLead + "XX)", 'g');				
			Roman_wrapper: {
				let breakIf = (romanNum) => { // ensure that when matches dry up, stop looking for more
					return (new RegExp(`/\(${romanNum}\)/`).test(chpHTML))
				}
				if(breakIf('ii')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(iiLower, iiRepl);
				chpHTML = chpHTML.replace(iiiLower, romanLowerRepl);
				chpHTML = chpHTML.replace(vLower, romanLowerRepl);
				chpHTML = chpHTML.replace(xLower, romanLowerRepl);
				chpHTML = chpHTML.replace(xxLower, romanLowerRepl);
				if(breakIf('II')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(IIUpper, IIRepl);
				if(breakIf('III')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(IIIUpper, romanUpperRepl);
				if(breakIf('V')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(VUpper, romanUpperRepl);
				if(breakIf('X')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(XUpper, romanUpperRepl);
				if(breakIf('XX')) {break Roman_wrapper}
				chpHTML = chpHTML.replace(XXUpper, romanUpperRepl);
			}
		}
		LittleL(); 
		function LittleL() { // reclasses (L) as paragraph if following (k)
			const lilL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g
			const lilLRepl = "$1=para";
			chpHTML = chpHTML.replace(lilL, lilLRepl);
		}
	}
	headingsRepl();
	function headingsRepl() { // classify HEADINGS and (Subheadings)
		const headingFind = /<p class=default>([A-Z][^a-z]{3,}?)<\/p>/g //is replaced by:
		const headingRepl = '</div></div><div class=headingSec><p class=heading><b>$1</b></p><div>'
		const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g //is replaced by:
		const subheadRepl = '</div></div><div class=subheadSec><p class=subhead>$1</p><div>'
		function cleanupTocBreadCrumbs() {
			let headCount = 0
			let extraDivs=""
			if ((/=head/).test) {headCount++}
			if ((/=subhead/).test) {headCount++}
			for (let i = 0; i < headCount; i++) {
				extraDivs+="</div>" ;
			}
			return extraDivs
		}	
		const tempSec = /<div class=subheadSec><p class=subhead">(\(Temporary\sprovision)/g;
		const tempSecRepl = '<div class=TempSec><p class=TempSec>$1'
		const headInForm = /(=orsForm break=\'\`\'[^`~]*)<\/div><\/div><div\sclass=headingSec>([^`~]*?)<div>/g
		const subheadInForm = /(=orsForm break=\'\`\'[^`~]*)<\/div><\/div><div\sclass=subheadSec>([^`~]*?)<div>/g
		chpHTML = chpHTML.replace(headingFind, headingRepl);
		chpHTML = chpHTML.replace(subheadFind, subheadRepl);
		chpHTML = chpHTML.replace("?#@", cleanupTocBreadCrumbs())
		console.log(chpHTML);
		console.log(headInForm + "\\");
		while (headInForm.test(chpHTML) || subheadInForm.test(chpHTML)) {
			chpHTML = chpHTML.replace(headInForm, '$1$2');
			chpHTML = chpHTML.replace(subheadInForm, '$1$2	');
		}
		chpHTML = chpHTML.replace(tempSec, tempSecRepl)
	}

	sourceNotesRepl();
	function sourceNotesRepl() { // Find source notes and classify
		const sourceNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
		const sourceNoteRepl = '<p class=sourceNote>$1</p>'
		chpHTML = chpHTML.replace(sourceNote, sourceNoteRepl);
		burntORS();
		function burntORS(){ // Find burnt ORS (repealed/renumbered) and classify
			const deadOrs = /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g
			const repDeadO = "</div><div class='sourceNote leadline' id='$1'>$1: "
			chpHTML = chpHTML.replace(deadOrs, repDeadO);
		}
	}
	finalCleanUp();
	function finalCleanUp() { // dump HTML back into document, clean up double returns & classify TOC paragraphs
		document.body.innerHTML = chpHTML;
		document.body.innerHTML = document.body.innerHTML.replace(doubleP, '');
		let tocID = document.getElementById('toc')
		if (Boolean(tocID)) {
			let allTocPs = tocID.getElementsByTagName("p")
			for (let aP of allTocPs) {
				aP.className+=' toc'
			};
		};
	};
	OrLawLinking();
	function OrLawLinking() { // get user data for OrLaws for link for 'year c.###' & 'chapter ###, Oregon Laws [year]'
		// @ts-ignore
		let backgroundPort = chrome.runtime.connect({name: "OrLawsSource"}); //open port to background.cs 
		backgroundPort.postMessage({message: "RequestOrLawsSource"});
		backgroundPort.onMessage.addListener((msg) => { //listen to its response
			console.log("mORS.js heard: " + msg.response);
  			if (msg.response == "Hein") {HeinLinks();} 
			else if (msg.response == "OrLeg") {OrLeg();}
			else {cssButtons();}
		});
		function HeinLinks() { // replace with URL to HeinOnline search link through SOLL
			const heinURL = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
			const orLawH1 = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
			const orLawH1Repl = '<a href=' + heinURL + '>$&</a>';
			const heinURL2 = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
			const orLawH2 =/(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g
			const orLawH2Repl ='<a href=' + heinURL2 + '>$&</a>';
			chpHTML= document.body.innerHTML;
			chpHTML = chpHTML.replace(orLawH1, orLawH1Repl);
			chpHTML = chpHTML.replace(orLawH2, orLawH2Repl);
			document.body.innerHTML = chpHTML;
			cssButtons();
		}
		function OrLeg() { // replace with URL to Or.Leg.
			const orLegURL = '<a href="https://www.oregonlegislature.gov/bills_laws/lawsstatutes/';
			const urlTail = '">$&</a>';
			const orLawSourceNoteTail = '\\W+c\\.\\W*(\\d{1,4})'
			const yearOrLawChpHead ='(?:C|c)hapter\\s(\\d{1,4}),\\sOregon\\sLaws\\s'
			chpHTML=document.body.innerHTML;
			function orLawReplacer(yearRegExp, strFormat) {
				let orLawSourceNote=(new RegExp(yearRegExp + orLawSourceNoteTail, 'g'));
				let yearOrLawChp=(new RegExp(yearOrLawChpHead + yearRegExp, 'g'));
				let orLawRepl=(orLegURL + strFormat + urlTail);
				chpHTML = chpHTML.replace(orLawSourceNote, orLawRepl);
				chpHTML = chpHTML.replace(yearOrLawChp, orLawRepl.replace(/(\$1)([^]*?)(\$2)/, '$3$2$1'));
			}
			orLawReplacer('(202[\\d]|2019|2018|2017|2016|2015|2013)','$1orlaw000$2.pdf');
			orLawReplacer('(2011|2010|2009|2008|2007|1999)','$1orlaw000$2.html');
			orLawReplacer('(2003|2001)','$1orlaw000$2ses.html');
			orLawReplacer('(2014)','$1R1orlaw000$2ses.html');	
			orLawReplacer('(2012)','$1adv000$2ss.pdf');	
			orLawReplacer('(2006)','$1orLaw000$2ss1.pdf');
			orLawReplacer('(2005)','$1orLaw000$2ses.html');
			const xtraZeros = /(aw|adv)\d+(\d{4})/g
			const xtraZerosRepl ='$1$2'
			chpHTML = chpHTML.replace(xtraZeros, xtraZerosRepl);
			document.body.innerHTML = chpHTML;
			cssButtons();
		};
	};
};

function cssButtons(){ // add buttons to remove & refresh stylesheet
	var cssOffButton = document.createElement("button");
	var cssRefreshButton = document.createElement("button");
	cssOffButton.innerHTML = "Remove Stylesheet";
	cssRefreshButton.innerHTML = "Add Stylesheet";
	cssOffButton.setAttribute('id', 'removeCssButton');
	cssRefreshButton.setAttribute('id', 'refreshCssButton');
	document.body.appendChild(cssRefreshButton);
	document.body.appendChild(cssOffButton);
	cssOffButton.addEventListener("click", () => {
		// @ts-ignore
		chrome.runtime.sendMessage({message: "removeCSS"});  // sends message to background.js
		console.log("Remove button press")
	});
	cssRefreshButton.addEventListener("click", () => {
		console.log("Refresh button press")
		StyleSheetRefresh();
	});
};

function StyleSheetRefresh() { // sends message to background.js to apply right stlye sheet
	// @ts-ignore
	chrome.runtime.sendMessage({message: "updateCSS"});  
};