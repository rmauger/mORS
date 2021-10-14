window.addEventListener("load", ReplaceText);
window.addEventListener("load", StyleSheetRefresh);

function ReplaceText() { //main function adjusting HTML of Oregon Legislature ORS pages
	//common variables:
	const tabs = "(?:&nbsp;|\\s){0,8}";
	let chapHTML=document.body.innerHTML;
	const chapNum = chapHTML.match(/(?<=Chapter\s)(\d{1,3}[A-C]?)/)[1];
	const doubleP = /<(\w)[^>]*?>(?:&nbsp;|\s)*<\/\1>/g; // is deleted (used in FinalClean also)
	HTMLCleanUp();  // delete stylesheet & references to it and confusing span syntex from HTML
	function HTMLCleanUp() {
		const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
		const msoGarb = /<p\sclass="?MsoNormal"?[^]+?(?:"|')>/g; // is replaced by next line:
		const msoRepl = '<p class=default>';
		const divGarb = /<div[^]*?>/g; // is deleted
		chapHTML = chapHTML.replace(/(\n|\r|\f)/g, ' ');
		chapHTML = chapHTML.replace(/\s\s/, ' ');
		chapHTML = chapHTML.replace(styleGarb, '$1');
		chapHTML = chapHTML.replace(msoGarb, msoRepl);
		chapHTML = chapHTML.replace(divGarb, '');
		chapHTML = chapHTML.replace(doubleP, '');
	};
	ChapterHeadings();
	function ChapterHeadings() { // Add tags to volume title & ORS chapter & edition year; set title displayed on tab
		const chapMainHead = /<p class=default>(Chapter\s(\d{1,3}[A-C]?)\s—?\s?([^]*?))<\/p>/; // is replaced by:
		const mainHeadRepl = '<title>ORS $2: $3</title><h1>$1</h1>';
		const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/; // is replaced by:
		const yearRepl = '</h1><h2>$1</h2>'
		const title = /<h1>([^]*?)<\/h1>[^]*?(<h2>[^]*?<\/h2>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/; //is replaced by:
		const titleRepl = '<h3>TITLE: $3</h3><h1>$1</h1>$2';
		chapHTML = chapHTML.replace(chapMainHead, mainHeadRepl);
		chapHTML = chapHTML.replace(edYear, yearRepl);
		chapHTML = chapHTML.replace(title, titleRepl);
	};
	TableOfContents();
	function TableOfContents() { //create & label new division for table of contents
		const tocFind = new RegExp("(?<=<\\/h2>[^]*?)(<p[^>]*?>[^]*?<\\/p>)([^]*?)(?=\\1|<p class=default><b>)"); // is replaced by:
		const tocRepl = '<div id=toc><h1>Table of Contents</h1><div class=tocItems>$1$2</div></div><div class=orsbody><div class=chapHTML>';
		chapHTML = chapHTML.replace(tocFind, tocRepl);
	};
	ORSHighlight();
	function ORSHighlight() { //highlight all cross references to ORS sections (xx.xxx) (to be replaced later by relevant links)
		const orsFind = /((\d{1,3}[A-C]?\.\d{3})((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)/g; // is replaced by:
		const orsRepl = '<span class=ors>$1</span>';
		chapHTML = chapHTML.replace(orsFind, orsRepl);
	};
	Leadlines();
	function Leadlines() { //highlight & create new div for each new section 
		const orsSecLead = "(?:<span class=ors>)(" + chapNum + "\\.\\d{3})<\/span>([^\\.][^\\]]+?\\.)";
		const leadFind = new RegExp("<p class=default><b>" + tabs + orsSecLead + "</b>",'g');
		const leadRepl = '</div><div class=section id="$1" break="~"><p class=leadline>$1$2</p><p class=default>';
		chapHTML = chapHTML.replace(leadFind, leadRepl);
	};
	Forms();
	function Forms() { // find beginning and end of forms to create new div for each
		const startForm = new RegExp("(form[^]*?:)<\\/p>"+ tabs +"(<p[^>]*>)_{78}", 'g');
		const startFormRepl = "$1</p><div class=orsForm break='`'>$2"
		const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g;
		const endFormRepl = "$1</div>";
		const endFormCleanup =/_{78}(<\/div>)/g;
		chapHTML = chapHTML.replace(startForm, startFormRepl);
		chapHTML = chapHTML.replace(endForm, endFormRepl);
		chapHTML = chapHTML.replace(endFormCleanup, '$1')
	};
	orsInChapLink();
	function orsInChapLink() { // change xrefs to ORS sections in chapter to links to #id of ORS section
		const orsInChp = new RegExp("<span class=ors(>(" + chapNum + "\\.\\d{3})[^]*?<\\/)span", 'g');
		const orsInChpRepl = '<a class=ors href="#$2"$1a';
		chapHTML = chapHTML.replace(orsInChp, orsInChpRepl);
	};
	orsOutChapLink();
	function orsOutChapLink() { // change xrefs to ORS sections outside chapter to links to ORS chapter external webpage.
		let listOfORSChps =[];
		const orsOrLegURL = "https://www.oregonlegislature.gov/bills_laws/ors/ors";
		const notChap = /=ors>\d{1,3}[A-C]?\.\d{3}/g; //TODO: Update for UTC (79.0100)
		let whileBreak = 0;	let continueLoop= true;	let temp=chapHTML;
		for (let i = 0; i < 500; i++) { //getting list of referenced ORS sections not in this chapter & chapter for each
			strMatch=temp.match(notChap);
			if (strMatch) {
				chapNo=strMatch[0].match(/\d{1,3}[A-C]?/);
				listOfORSChps.push(chapNo);
				temp=temp.replace(new RegExp('>'+chapNo +'\\.', 'g'), "XXX");
			} else {
				break;  //TODO: This may be broken, in which case can maybe make i 499 or just wait for it to cycle through 
			};
		};
		function onlyUnique(value, index, self) { // removing duplicates from the list of ORS chapters
			return self.indexOf(value) === index;
		};
		listOfORSChps = listOfORSChps.filter(onlyUnique);
		if (listOfORSChps.length>0){ 
			for (let eachORSChp of listOfORSChps) {
				//TODO: if (orsChap.length<1) {break;}; <-- if not broken, probably redundant & can kill entirely.
				let orsOutChp = new RegExp("<span class=ors>("+eachORSChp+"\\.\\d{3}[^]*?)<\\/span>", 'g');
				
				let urlChp = makeThreeDigit(eachORSChp); //TODO: Probably running two regexp replace is faster/easier
				
				let orsOutChpRepl=`<a href="${orsOrLegURL}${eachORSChp}.html">$1</a>`;
				chapHTML=chapHTML.replace(orsOutChp, orsOutChpRepl);
				chapHTML=chapHTML.replace(/\d+(\d{3}[A-C].html)/g, $1)
			};
		};		
		function makeThreeDigit(chapNo){  // TODO:Depreciate & delete if running 2 regExp is easier
			chapNo=chapNo.toString();  // ensures ORS chapter number is string
			let myLen = chapNo.length;
			if (chapNo.match(/\d+[A-C]/)) {
				myLen=myLen-1
			};
			switch(myLen) {
				case 1:
					return "00" + chapNo;
				case 2:
					return "0" + chapNo;
				default:
					return "" + chapNo
			};
		};
		/* TODO: Pretty sure this is garbage & can be deleted:
		let spanElements = document.body.getElementsByTagName('span')
		for (let element of spanElements) {
			element.tag
		}*/
	};
	Notes();
	function Notes() { // finds Note: in ORS & classes; finds note secs; Adds hyperlinks for Preface to ORS & vol22
		const noteFind = new RegExp('<p[^>]*>\\s?<b>' + tabs + '(Note(\\s\\d)?:\\s?<\\/b>[^]*?)(?=<\\/p>)', 'g'); // is replaced by:
		const noteRepl = "<p class=note><b>$1"
		const noteSec = new RegExp('<p[^>]*?><b>' + tabs + "(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>", 'g'); //is replaced by:
		const noteSecRepl = '<p class=note><b>Note section for ORS $1:</b></p><p class=default>'
		const prefaceFind = /(Preface\sto\sOregon\sRevised\sStatutes)/g // is replaced by:
		const prefaceRepl = '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
		const v22Find = /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // is replaced by:
		const v22Repl = '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
		chapHTML = chapHTML.replace(noteFind, noteRepl);
		chapHTML = chapHTML.replace(noteSec, noteSecRepl);
		chapHTML = chapHTML.replace(prefaceFind, prefaceRepl);
		chapHTML = chapHTML.replace(v22Find, v22Repl);
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
		chapHTML = chapHTML.replace(subsecOne, subsecRepl);
		chapHTML = chapHTML.replace(subsecFind, subsecRepl);
		chapHTML = chapHTML.replace(subsubPara, subsubRepl);
		chapHTML = chapHTML.replace(subsubsubPara, subsubsubRepl);
		Romans();
		function Romans() { // separate roman numerals (subsubpara & subsubsubpara) from letters (para & subpara)
	  		const sameLtrLower = /=subsubpara>(\(([a-z])(?:\2){0,4}\))/g; // paragraphs if 1 letter (a) or letters match (aa)
			const sameLetterUpper = /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/g; // subpara if 1 letter (A) or matching letters (AA)
			const ltrLowerRepl = "=para break='!'>$1";
			const ltrUpperRepl = "=subpara break='?'>$1";
			chapHTML = chapHTML.replace(sameLtrLower, ltrLowerRepl);
			chapHTML = chapHTML.replace(sameLetterUpper, ltrUpperRepl);
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
				breakIf = (romanNum) => { // ensure that when matches dry up, stop looking for more
					Boolean(chapHTML.match(`(${romanNum})`) == false)
				}
				if(breakIf('ii')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(iiLower, iiRepl);
				chapHTML = chapHTML.replace(iiiLower, romanLowerRepl);
				chapHTML = chapHTML.replace(vLower, romanLowerRepl);
				chapHTML = chapHTML.replace(xLower, romanLowerRepl);
				chapHTML = chapHTML.replace(xxLower, romanLowerRepl);
				if(breakIf('II')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(IIUpper, IIRepl);
				if(breakIf('III')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(IIIUpper, romanUpperRepl);
				if(breakIf('V')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(VUpper, romanUpperRepl);
				if(breakIf('X')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(XUpper, romanUpperRepl);
				if(breakIf('XX')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(XXUpper, romanUpperRepl);
			}
		}
		LittleL(); 
		function LittleL() { // reclasses (L) as paragraph if following (k)
			const lilL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g
			const lilLRepl = "$1=para";
			chapHTML = chapHTML.replace(lilL, lilLRepl);
		}
	}
	headingsRepl();
	function headingsRepl() { // classify HEADINGS and (Subheadings)
		const headingFind = /<p class=default>([^a-z][^a-z]{3,}?)<\/p>/g //is replaced by:
		const headingRepl = '<p class=heading>$1</p>'
		const subheadFind = /<p class=default>(\([^]{5,}?\))<\/p>/g //is replaced by:
		const subheadRepl = '<p class=subhead>$1</p>'
		chapHTML = chapHTML.replace(headingFind, headingRepl);
		chapHTML = chapHTML.replace(subheadFind, subheadRepl);
	}
	sourceNotesRepl();
	function sourceNotesRepl() { // Find source notes and classify
		const sourceNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
		const sourceNoteRepl = '<p class=sourceNote>$1</p>'
		chapHTML = chapHTML.replace(sourceNote, sourceNoteRepl);
		burntORS();
		function burntORS(){ // Find burnt ORS (repealed/renumbered) and classify
			const deadOrs = /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g
			const repDeadO = "<p class='sourceNote leadline' id='$1'><b>$1</b>: "
			chapHTML = chapHTML.replace(deadOrs, repDeadO);
		}
	}
	finalCleanUp();
	function finalCleanUp() { // dump HTML back into document, clean up double returns & classify TOC paragraphs
		document.body.innerHTML = chapHTML;
		document.body.innerHTML = document.body.innerHTML.replace(doubleP, '');
		let allTocPs = document.getElementById('toc')
		//console.log(allTocPs.toString)
		if (Boolean(allTocPs)) {
			allTocPs = allTocPs.getElementsByTagName("p")
			for (let aP of allTocPs) {
				aP.className+=' toc'
			};
		};
	};
	OrLawLinking();
	function OrLawLinking() { // get user data for OrLaws for link for 'year c.###' & 'chapter ###, Oregon Laws [year]'
		let backgroundPort = chrome.runtime.connect({name: "OrLawsSource"}); //open port to background.cs 
		backgroundPort.postMessage({message: "RequestOrLawsSource"});
		backgroundPort.onMessage.addListener((msg) => { //listen to its response
			console.log("mORS.js heard: " + msg.response);
  			if (msg.response == "Hein") {HeinLinks();
			} else if (msg.response == "OrLeg") {OrLeg();
			} else {
				console.log ('No OrLaw Lookup Ran.')
				cssButtons();
			}
		});
		function HeinLinks() { // replace with HeinOnline search link
			const heinURL = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
			const orLawH1 = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
			const orLawH1Repl = '<a href=' + heinURL + '>$&</a>';
			const heinURL2 = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
			const orLawH2 =/(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g
			const orLawH2Repl ='<a href=' + heinURL2 + '>$&</a>';
			chapHTML= document.body.innerHTML;
			chapHTML = chapHTML.replace(orLawH1, orLawH1Repl);
			chapHTML = chapHTML.replace(orLawH2, orLawH2Repl);
			document.body.innerHTML = chapHTML;
			cssButtons();
		}
		function OrLeg() { // replace with URL to Or.Leg.
			const orLegURL = "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/";
			const orLawTail = "\\W+c\\.\\W*(\\d{1,4})"
			const orLaw1 = new RegExp('(20(?:2[\\d]|19|18|17|16|15|13))'+ orLawTail, 'g')
			const orLaw1Repl = '<a href=' + orLegURL + '$1orlaw$2.pdf>$&</a>';
			const orLaw2 = new RegExp('(20(?:11|10|09|08|07)|1999)'+ orLawTail, 'g')
			const orLaw2Repl = '<a href=' + orLegURL + '$1orlaw000$2.html>$&</a>';
			const orLaw3 = new RegExp('(20(?:03|01))'+ orLawTail, 'g')
			const orLaw3Repl = '<a href=' + orLegURL + '$1orlaw000$2ses.html>$&</a>';
			const orLaw4 = new RegExp('(2014)'+ orLawTail, 'g')
			const orLaw4Repl = '<a href=' + orLegURL + '$1R1orlaw000$2ses.html>$&</a>';	
			const orLaw5 = new RegExp('(2012)'+ orLawTail, 'g')
			const orLaw5Repl = '<a href=' + orLegURL + '$1adv000$2ss.pdf>$&</a>';	
			const orLaw6 = new RegExp('(2006)'+ orLawTail, 'g')
			const orLaw6Repl = '<a href=' + orLegURL + '$1orLaw000$2ss1.pdf>$&</a>';
			const orLaw7 = new RegExp('(2005)'+ orLawTail, 'g')
			const orLaw7Repl = '<a href=' + orLegURL + '$1orLaw000$2ses.html>$&</a>';
			const xtraZero = /(aw|adv)\d*(\d{4})/g
			const xtraZeroRepl ='$1$2'
			chapHTML= document.body.innerHTML;
			chapHTML = chapHTML.replace(orLaw1, orLaw1Repl);
			chapHTML = chapHTML.replace(orLaw2, orLaw2Repl);
			chapHTML = chapHTML.replace(orLaw3, orLaw3Repl);
			chapHTML = chapHTML.replace(orLaw4, orLaw4Repl);
			chapHTML = chapHTML.replace(orLaw5, orLaw5Repl);
			chapHTML = chapHTML.replace(orLaw6, orLaw6Repl);
			chapHTML = chapHTML.replace(orLaw7, orLaw7Repl);
			chapHTML = chapHTML.replace(xtraZero, xtraZeroRepl);
			document.body.innerHTML = chapHTML;
			cssButtons();
		};
	};
	function cssButtons(){ // add buttons to remove & refresh stylesheet
		document.head.getElementsByTagName('style')[0].innerHTML="";
		var cssOffButton = document.createElement("button");
		var cssRefreshButton = document.createElement("button");
		cssOffButton.innerHTML = "Remove Stylesheet";
		cssRefreshButton.innerHTML = "Refresh Stylesheet"; //TODO: Consider depreciating if form autorefresh works fine
		cssOffButton.setAttribute('id', 'removeCssButton');
		cssRefreshButton.setAttribute('id', 'refreshCssButton');
		document.body.appendChild(cssRefreshButton);
		document.body.appendChild(cssOffButton);
		cssOffButton.addEventListener("click", () => {
			chrome.runtime.sendMessage({message: "removeCSS"});  // sends message to background.js
			console.log("Remove button press")
		});
		cssRefreshButton.addEventListener("click", () => {
			console.log("Refresh button press")
			StyleSheetRefresh();
		});
	}
};

function StyleSheetRefresh() { // sends message to background.js to apply right stlye sheet
	chrome.runtime.sendMessage({message: "updateCSS"});  
};