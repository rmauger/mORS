window.addEventListener("load", ReplaceText);
window.addEventListener("load", StyleSheet);

function ReplaceText(){
	//common variables:
	const tabs = "(?:&nbsp;|\\s){0,8}";
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
		const edYear = /(?=<\/h1>)[^]*?<p class=default>([^]+?)<\/p>/; // is replaced by:
		const yearClean = '</h1><h2>$1</h2>'
		const title = /<h1>([^]*?)<\/h1>[^]*?(<h2>[^]*?<\/h2>)[^]*?<p[^]*?\/p>[^]*?<p[^]*?>([^]*?)<\/p>/; //is replaced by:
		const titleClean = '<h3>TITLE: $3</h3><h1>$1</h1>$2';
		temp = temp.replace(chapHead, headClean);
		temp = temp.replace(edYear, yearClean);
		temp = temp.replace(title, titleClean);
	};

	TableOfContents();
	function TableOfContents(){
		const tOC = new RegExp("(?<=<\\/h2>[^]*?)(<p[^>]*?>[^]*?<\\/p>)([^]*?)(?=\\1|<p class=default><b>)"); // is replaced by:
		const repTOC = '<div id=toc><h2>Table of Contents</h2><div class=tocItems>$1$2</div></div><div class=orsbody><div class=temp>';
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
		const repOrsH = '</div><div class=section id="$1" break="~"><p class=leadline>$1$2</p><p class=default>';
		temp = temp.replace(orsHead, repOrsH);
	};

	Forms();
	function Forms(){

		const startForm = new RegExp("(form[^]*?:)<\\/p>"+ tabs +"(<p[^>]*>)_{78}", 'g');
		const repStartForm = "$1</p><div class=orsForm break='`'>$2"
		const endForm = /(`([^~`]*_{78}|[^`~]*?(?=<div class=orsForm)))/g;
		const repEndForm = "$1</div>";
		const endFormClean =/_{78}(<\/div>)/g;
		temp = temp.replace(startForm, repStartForm);
		temp = temp.replace(endForm, repEndForm);
		temp = temp.replace(endFormClean, '$1')
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
		const aNote = new RegExp('<p[^>]*>\\s?<b>' + tabs + '(Note(\\s\\d)?:\\s?<\\/b>[^]*?)(?=<\\/p>)', 'g'); // is replaced by:
		const repNote = "<p class=note><b>$1"
		const noteSec = new RegExp('<p[^>]*?><b>' + tabs + "(<a[^>]*?>[\\S]{5,8}<\\/a>)\\.<\\/b>", 'g'); //is replaced by:
		const repNS = '<p class=note><b>Note section for ORS $1:</b></p><p class=default>'
		const preface = /(Preface\sto\sOregon\sRevised\sStatutes)/g // is replaced by:
		const repPref = '<a href="https://www.oregonlegislature.gov/bills_laws/BillsLawsEDL/ORS_Preface.pdf">$1</a>';
		const v22 = /(\d{4}\sComparative\sSection\sTable\slocated\sin\sVolume\s22)/g; // is replaced by:
		const repV22 = '<a href="https://www.oregonlegislature.gov/bills_laws/Pages/ORS.aspx#">$1</a>';
		temp = temp.replace(aNote, repNote);
		temp = temp.replace(noteSec, repNS);
		temp = temp.replace(preface, repPref);
		temp = temp.replace(v22, repV22);
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
		temp = temp.replace(Sub1, repA);
		temp = temp.replace(aSub, repA);
		temp = temp.replace(bPar, repB);
		temp = temp.replace(cSPar, repC);

		Romans();
		function Romans(){
	  // Lower Case:
			const sameLetter = /=subsubpara>(\(([a-z])(?:\2){0,4}\))/g; // turn roman back into paragraphs if 1 letter or matching letters (aa)
			const repSameL = "=para break='!'>$1";
			const ii = /=para[^>]*>(\(i\)[^!~]*?)=para[^>]*>(?=\(ii\))/g; // next, get matching (i) & (ii) labeled as subsubs again
			const iiRep = "=subsubpara>$1=subsubpara>"
			const leadRoman = "(?<=(?:=subsubpara>[^!]*))=para[^>]*>(?=\\("; // last dealing with the more ambiguous ones (iii, v, x, xx, xxx) should work through 27 (XXVIII is too large)
			const repRoman = "=subsubpara>";
			const iii = new RegExp(leadRoman + "iii)", 'g');
			const v = new RegExp(leadRoman + "v)", 'g');
			const x = new RegExp(leadRoman + "x)", 'g');
			const xx = new RegExp(leadRoman + "xx)", 'g');

			temp = temp.replace(sameLetter, repSameL);
			temp = temp.replace(ii, iiRep);
			temp = temp.replace(iii, repRoman);
			temp = temp.replace(v, repRoman);
			temp = temp.replace(x, repRoman);
	  // Upper Case:
			const sameLetterC = /=subsubsubpara>(\(([A-Z])(?:\2){0,4}\))/g; // turn roman back into paragraphs if 1 letter or matching letters (aa)
			const repSameLC = "=subpara break='?'>$1";
			const iiC = /=subpara[^>]*>(\(I\)[^?~]*?)=subpara[^>]*>(?=\(II\))/g; // next, get matching (i) & (ii) labeled as subsubs again
			const iiRepC = "=subsubsubpara>$1=subsubsubpara>"
			const leadRomanC = "(?<=(?:=subsubsubpara>[^?]*))=subpara[^>]*>(?=\\("; // last dealing with the more ambiguous ones (iii, v, x, xx, xxx) should work through 27 (XXVIII is too large)
			const repRomanC = "=subsubsubpara>";
			const iiiC = new RegExp(leadRomanC + "III)", 'g');
			const vC = new RegExp(leadRomanC + "V)", 'g');
			const xC = new RegExp(leadRomanC + "X)", 'g');
			const xxC = new RegExp(leadRomanC + "XX)", 'g');

			temp = temp.replace(sameLetterC, repSameLC);
			temp = temp.replace(iiC, iiRepC);
			temp = temp.replace(iiiC, repRomanC);
			temp = temp.replace(vC, repRomanC);
			temp = temp.replace(xC, repRomanC);
			}

		LittleL();
		function LittleL() {
			const littleL = /(?<=(?:=para[^>]*>\(k\)[^~!]*))(?:=subpara)[^>]*(?=>\(L\))/g
			const repLL = "=para";
			temp = temp.replace(littleL, repLL);
		}
	}

	Headings();
	function Headings(){
		const head = /<p class=default>([^a-z_]{4,}?)<\/p>/g //is replaced by:
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
			const deadOrs = /<p class=default><b>[^>\[]*?<a[^>\[]+?>([^<\[]+?)\s?<\/a>\s?<\/b>\s?<p class=sourceNote>/g
			const repDeadO = "<p class='sourceNote leadline' id='$1'><b>$1</b>: "
			temp = temp.replace(deadOrs, repDeadO);
		}

		HeinLinks();
		function HeinLinks(){
			const heinURL = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$1&chapter=$2&sgo=Search&collection=ssl&search=go";
			const orLaw = /((?:20|19)\d{2})\W*c\.\W*(\d+)/g; // is replaced by:
			const repOL = '<a href=' + heinURL + '>$&</a>';
			const heinURL2 = "https://heinonline-org.soll.idm.oclc.org/HOL/SSLSearchCitation?journal=ssor&yearhi=$2&chapter=$1&sgo=Search&collection=ssl&search=go";
			const orLaw2 =/(?:C|c)hapter\s(\d{1,4}),\sOregon\sLaws\s(\d{4})/g
			const repOL2 ='<a href=' + heinURL2 + '>$&</a>';
			temp = temp.replace(orLaw, repOL);
			temp = temp.replace(orLaw2, repOL2);
		}
	}

	FinalClean();
	function FinalClean(){
		document.body.innerHTML = temp;
		document.body.innerHTML = document.body.innerHTML.replace(doubleP, '');
	}
}

function StyleSheet() {
	chrome.runtime.sendMessage({message: "updateCSS"});  // sends message to background.js
};

function SendToConsole(htmlText, logText){
	let cleanUp = htmlText.replace(/(\r|\n|\f)+/g, '');
	cleanUp = cleanUp.replace(/(<\/[^]+?>)/g, '$1\n');
	console.log(logText);
	console.log(cleanUp);
}

//from manifest.json             "css": ["mORS_light.css", "mORS_dark.css"]