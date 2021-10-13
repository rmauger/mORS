window.addEventListener("load", ReplaceText);
window.addEventListener("load", StyleSheetRefresh);

function ReplaceText(){
	//common variables:
	const tabs = "(?:&nbsp;|\\s){0,8}";
	let chapHTML=document.body.innerHTML;
	const chapNum = chapHTML.match(/(?<=Chapter\s)(\d{1,3}[A-C]?)/)[1];
	const doubleP = /<(\w)[^>]*?>(?:&nbsp;|\s)*<\/\1>/g; // is deleted (used in FinalClean also)
	HTMLCleanUp();
	function HTMLCleanUp(){
		const styleGarb = /<span style=[^]+?>([^]+?)<\/span>/g; // is deleted
		const msoGarb = /<p\sclass="?MsoNormal"?[^]+?(?:"|')>/g; // is replaced by next line:
		const msoClean = '<p class=default>';
		const divGarb = /<div[^]*?>/g; // is deleted
		chapHTML = chapHTML.replace(/(\n|\r|\f)/g, ' ');
		chapHTML = chapHTML.replace(/\s\s/, ' ');
		chapHTML = chapHTML.replace(styleGarb, '$1');
		chapHTML = chapHTML.replace(msoGarb, msoClean);
		chapHTML = chapHTML.replace(divGarb, '');
		chapHTML = chapHTML.replace(doubleP, '');
	};
	ChapterHeadings();
	function ChapterHeadings(){
		const chapHead = /<p class=default>(Chapter (\d{1,3}[A-C]?) — ([^]*?))<\/p>/; // is replaced by:
		const headClean = '<title>ORS $2: $3</title><h1>$1</h1>';
		const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/; // is replaced by:
		const yearClean = '</h1><h2>$1</h2>'
		const title = /<h1>([^]*?)<\/h1>[^]*?(<h2>[^]*?<\/h2>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/; //is replaced by:
		const titleClean = '<h3>TITLE: $3</h3><h1>$1</h1>$2';
		chapHTML = chapHTML.replace(chapHead, headClean);
		chapHTML = chapHTML.replace(edYear, yearClean);
		chapHTML = chapHTML.replace(title, titleClean);
	};
	TableOfContents();
	function TableOfContents(){
		const tOC = new RegExp("(?<=<\\/h2>[^]*?)(<p[^>]*?>[^]*?<\\/p>)([^]*?)(?=\\1|<p class=default><b>)"); // is replaced by:
		const repTOC = '<div id=toc><h1>Table of Contents</h1><div class=tocItems>$1$2</div></div><div class=orsbody><div class=chapHTML>';
		chapHTML = chapHTML.replace(tOC, repTOC);
	};
	ORSHighlight();
	function ORSHighlight(){
		const orsRef = /((\d{1,3}[A-C]?\.\d{3})((?:\s?(?:\(\w{1,4}\))){0,5})(\sto\s(?:(?:\(\w{1,4}\))))?)/g; // is replaced by:
		const repORS = '<span class=ors>$1</span>';
		chapHTML = chapHTML.replace(orsRef, repORS);
	};
	Leadlines();
	function Leadlines(){
		const orsLead = "(?:<span class=ors>)(" + chapNum + "\\.\\d{3})<\/span>([^\\.][^\\]]+?\\.)";
		const orsHead = new RegExp("<p class=default><b>" + tabs + orsLead + "</b>",'g');
		const repOrsH = '</div><div class=section id="$1" break="~"><p class=leadline>$1$2</p><p class=default>';
		chapHTML = chapHTML.replace(orsHead, repOrsH);
	};
	Forms();
	function Forms(){

		const startForm = new RegExp("(form[^]*?:)<\\/p>"+ tabs +"(<p[^>]*>)_{78}", 'g');
		const repStartForm = "$1</p><div class=orsForm break='`'>$2"
		const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g;
		const repEndForm = "$1</div>";
		const endFormClean =/_{78}(<\/div>)/g;
		chapHTML = chapHTML.replace(startForm, repStartForm);
		chapHTML = chapHTML.replace(endForm, repEndForm);
		chapHTML = chapHTML.replace(endFormClean, '$1')
	};
	orsInChapLink();
	function orsInChapLink(){
		const inChap = new RegExp("<span class=ors(>(" + chapNum + "\\.\\d{3})[^]*?<\\/)span", 'g');
		const repInChap = '<a class=ors href="#$2"$1a';
		chapHTML = chapHTML.replace(inChap, repInChap);
	}
	orsOutChapLink();
	function orsOutChapLink(){
		let orsList =[];
		const orsURL = "https://www.oregonlegislature.gov/bills_laws/ors/ors";
		const notChap = /=ors>\d{1,3}[A-C]?\.\d{3}/g;

		//getting list of referenced ORS chapters not in chapter
		let whileBreak = 0;
		let continueLoop= true;
		let temp=chapHTML;
		while(continueLoop) {
			if (whileBreak>500) {continueLoop=false};
			strMatch=temp.match(notChap);
			if (strMatch) {
				chapNo=strMatch[0].match(/\d{1,3}[A-C]?/);
				orsList.push(chapNo);
				tempReplace = new RegExp('>'+chapNo +'\\.', 'g')
				temp=temp.replace(tempReplace, "XXX");
				whileBreak++;
			} else {
				continueLoop=false;
			};
		};
		function onlyUnique(value, index, self) {
			return self.indexOf(value) === index;
		};
		orsList = orsList.filter(onlyUnique);
		
		//replacing each reference to external chapter
		
		if (orsList.length>0){
			for (let orsChap of orsList) {
				if (orsChap.length<1) {break;};
				let orsSearch = new RegExp("<span class=ors>("+orsChap+"\\.\\d{3}[^]*?)<\\/span>", 'g');
				let urlChp = makeThreeDigit(orsChap);
				let chpRep=`<a href="${orsURL}${urlChp}.html">$1</a>`;
				chapHTML=chapHTML.replace(orsSearch, chpRep);
			};
		};
		
		function makeThreeDigit(orsNumber){
			orsNumber=orsNumber.toString();  //ensuring ORS chapter number is string
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

		let spanElements = document.body.getElementsByTagName('span')
		for (let element of spanElements) {
			element.tag
		}
	};
	Notes();
	function Notes(){
		const aNote = new RegExp('<p[^>]*>\\s?<b>' + tabs + '(Note(\\s\\d)?:\\s?<\\/b>[^]*?)(?=<\\/p>)', 'g'); // is replaced by:
		const repNote = "<p class=note><b>$1"
		const noteSec = new RegExp('<p[^>]*?><b>' + tabs + "(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>", 'g'); //is replaced by:
		const repNS = '<p class=note><b>Note section for ORS $1:</b></p><p class=default>'
		const preface = /(Preface\sto\sOregon\sRevised\sStatutes)/g // is replaced by:
		const repPref = '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
		const v22 = /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // is replaced by:
		const repV22 = '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
		chapHTML = chapHTML.replace(aNote, repNote);
		chapHTML = chapHTML.replace(noteSec, repNS);
		chapHTML = chapHTML.replace(preface, repPref);
		chapHTML = chapHTML.replace(v22, repV22);
	}
	SubUnits();
	function SubUnits(){
		const Sub1 = /<p[^>]*?>\s?(\(1\)[^]+?)<\/p>/g;
		const aSub = new RegExp("<p[^>]*?>"+ tabs + "?\\s?(\\(\\d{1,2}\\)[^]+?)</p>", 'g'); //subsection (1)
		const bPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([a-z]{1,5}\\)[^]+?)</p>", 'g'); //subsubparagraphs (roman) (for now)
		const cSPar = new RegExp("<p[^>]*?>"+ tabs + "\\s?(\\([A-Z]{1,5}\\)[^]+?)</p>", 'g'); //subparagraphs (A)
		const repA = '<p class=subsec>$1</p>'
		const repB = "<p class=subsubpara>$1</p>"
		const repC = '<p class=subsubsubpara>$1</p>'
		chapHTML = chapHTML.replace(Sub1, repA);
		chapHTML = chapHTML.replace(aSub, repA);
		chapHTML = chapHTML.replace(bPar, repB);
		chapHTML = chapHTML.replace(cSPar, repC);

		
		Romans();
		
		function Romans(){
		
	  // Lower Case:
			const sameLetter = /=subsubpara>(\(([a-z])(?:\2){0,4}\))/g; // turn roman back into paragraphs if 1 letter or matching letters (aa)
			const repSameL = "=para break='!'>$1";
			chapHTML = chapHTML.replace(sameLetter, repSameL);
			const sameLetterC = /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/g; // turn roman back into paragraphs if 1 letter or matching letters (aa)
			const repSameLC = "=subpara break='?'>$1";
			chapHTML = chapHTML.replace(sameLetterC, repSameLC);

			Roman_wrapper: {
				breakIf = (romanNum) => {
					Boolean(chapHTML.match(`(${romanNum})`) == false)
				}
				if(breakIf('ii')) {break Roman_wrapper}
				const ii = /=para[^>]*>(\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/g; // next, get matching (i) & (ii) labeled as subsubs again
				const iiRep = "=subsubpara>$1=subsubpara>"
				const leadRoman = "((=subsubpara>[^!~]*))=para[^>]*?>(?=\\("; // last dealing with the more ambiguous ones (iii, v, x, xx, xxx) should work through 27 (XXVIII is too large)
				const repRoman = "$1=subsubpara>";
				const iii = new RegExp(leadRoman + "iii)", 'g');
				const v = new RegExp(leadRoman + "v)", 'g');
				const x = new RegExp(leadRoman + "x)", 'g');
				const xx = new RegExp(leadRoman + "xx)", 'g');
				chapHTML = chapHTML.replace(ii, iiRep);
				if(breakIf('iii')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(iii, repRoman);
				if(breakIf('v')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(v, repRoman);
				if(breakIf('x')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(x, repRoman);
				if(breakIf('xx')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(xx, repRoman);
		// Upper Case:
				if(breakIf('II')) {break Roman_wrapper}
				const iiC = /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/g; // next, get matching (i) & (ii) labeled as subsubs again
				const iiRepC = "=subsubsubpara>$1=subsubsubpara>"
				const leadRomanC = "((subsubsubpara>[^~!?]*))=subpara[^>]*>(?=\\("; // last dealing with the more ambiguous ones (iii, v, x, xx, xxx) should work through 27 (XXVIII is too large)
				const repRomanC = "$1=subsubsubpara>";
				const iiiC = new RegExp(leadRomanC + "III)", 'g');
				const vC = new RegExp(leadRomanC + "V)", 'g');
				const xC = new RegExp(leadRomanC + "X)", 'g');
				const xxC = new RegExp(leadRomanC + "XX)", 'g');				
				chapHTML = chapHTML.replace(iiC, iiRepC);
				if(breakIf('III')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(iiiC, repRomanC);
				if(breakIf('V')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(vC, repRomanC);
				if(breakIf('X')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(xC, repRomanC);
				if(breakIf('XX')) {break Roman_wrapper}
				chapHTML = chapHTML.replace(xxC, repRomanC);
			}			
		}

		LittleL();
		function LittleL() {
			const littleL = /((=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g
			const repLL = "$1=para";
			chapHTML = chapHTML.replace(littleL, repLL);
		}
	}
	Headings();
	function Headings(){
		const head = /<p class=default>([^a-z][^a-z]{3,}?)<\/p>/g //is replaced by:
		const repHead = '<p class=heading>$1</p>'
		const subHead = /<p class=default>(\([^]{5,}?\))<\/p>/g //is replaced by:
		const repSHead = '<p class=subhead>$1</p>'
		chapHTML = chapHTML.replace(head, repHead);
		chapHTML = chapHTML.replace(subHead, repSHead);
	}
	SourceNotes();
	function SourceNotes(){
		const sNote = /(\[(19\d{2}|20\d{2}|Fo|Re|Am)[^]+?\]<\/p>)/g; //is replaced by:
		const repSN = '<p class=sourceNote>$1</p>'
		chapHTML = chapHTML.replace(sNote, repSN);

		DeadORS();
		function DeadORS(){
			const deadOrs = /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g
			const repDeadO = "<p class='sourceNote leadline' id='$1'><b>$1</b>: "
			chapHTML = chapHTML.replace(deadOrs, repDeadO);
		}
	}
	FinalClean();
	function FinalClean(){
		document.body.innerHTML = chapHTML;
		document.body.innerHTML = document.body.innerHTML.replace(doubleP, '');
		allTocPs = document.getElementById('toc').getElementsByTagName("p");
		for (let aP of allTocPs) {
			aP.className+=' toc'
		};
	};

	OrLawLinking();
	function OrLawLinking() {
		let backgroundPort = chrome.runtime.connect({name: "OrLawsSource"});
		backgroundPort.postMessage({message: "RequestOrLawsSource"});
		backgroundPort.onMessage.addListener((msg) => {
			console.log("mORS.js heard: " + msg.response);
  			if (msg.response == "Hein") {
				HeinLinks();
			} else if (msg.response == "OrLeg") {
				OrLeg();
			} else {
				console.log ('No OrLaw Lookup Ran.')
				cssButtons();
			}
		});
		function HeinLinks(){
			const heinURL = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
			const orLaw = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
			const repOL = '<a href=' + heinURL + '>$&</a>';
			const heinURL2 = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
			const orLaw2 =/(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g
			const repOL2 ='<a href=' + heinURL2 + '>$&</a>';
			chapHTML= document.body.innerHTML;
			chapHTML = chapHTML.replace(orLaw, repOL);
			chapHTML = chapHTML.replace(orLaw2, repOL2);
			document.body.innerHTML = chapHTML;
			cssButtons();
		}
		function OrLeg(){
			const orLegURL = "https://www.oregonlegislature.gov/bills_laws/lawsstatutes/";
			const orLawTail = "\\W+c\\.\\W*(\\d{1,4})"
			const orLaw1 = new RegExp('(20(?:2[\\d]|19|18|17|16|15|13))'+ orLawTail, 'g')
			const repOrLaw1 = '<a href=' + orLegURL + '$1orlaw$2.pdf>$&</a>';
			const orLaw2 = new RegExp('(20(?:11|10|09|08|07)|1999)'+ orLawTail, 'g')
			const repOrLaw2 = '<a href=' + orLegURL + '$1orlaw000$2.html>$&</a>';
			const orLaw3 = new RegExp('(20(?:05|03|01))'+ orLawTail, 'g')
			const repOrLaw3 = '<a href=' + orLegURL + '$1orlaw000$2ses.html>$&</a>';
			const orLaw4 = new RegExp('(2014)'+ orLawTail, 'g')
			const repOrLaw4 = '<a href=' + orLegURL + '$1R1orlaw000$2ses.html>$&</a>';	
			const orLaw5 = new RegExp('(2012)'+ orLawTail, 'g')
			const repOrLaw5 = '<a href=' + orLegURL + '$1adv000$2ss.pdf>$&</a>';	
			const orLaw6 = new RegExp('(2006)'+ orLawTail, 'g')
			const repOrLaw6 = '<a href=' + orLegURL + '$1orLaw000$2ss1.pdf>$&</a>';
			const xtraZero = /(aw|adv)\d*(\d{4})/g
			const repZero ='$1$2'
			chapHTML= document.body.innerHTML;
			chapHTML = chapHTML.replace(orLaw1, repOrLaw1);
			chapHTML = chapHTML.replace(orLaw2, repOrLaw2);
			chapHTML = chapHTML.replace(orLaw3, repOrLaw3);
			chapHTML = chapHTML.replace(orLaw4, repOrLaw4);
			chapHTML = chapHTML.replace(orLaw5, repOrLaw5);
			chapHTML = chapHTML.replace(orLaw6, repOrLaw6);
			chapHTML = chapHTML.replace(xtraZero, repZero);
			document.body.innerHTML = chapHTML;
			cssButtons();
		};
	};
	function cssButtons(){
		document.head.getElementsByTagName('style')[0].innerHTML="";
		var cssOffButton = document.createElement("button");
		var cssRefreshButton = document.createElement("button");
		cssOffButton.innerHTML = "Remove Stylesheet";
		cssRefreshButton.innerHTML = "Refresh Stylesheet";
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

function StyleSheetRefresh() {
	chrome.runtime.sendMessage({message: "updateCSS"});  // sends message to background.js
};

function SendToConsole(htmlText, logText){
	let cleanUp = htmlText.replace(/(\r|\n|\f)+/g, '');
	cleanUp = cleanUp.replace(/(<\/[^]+?>)/g, '$1\n');
	console.log(logText);
	console.log(cleanUp);
};