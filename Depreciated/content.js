document.addEventListener("load", myFunction())
//document.onload = myFunction();

function myFunction (){
//	window.alert("I'm running.");
	let count = 0;
	const aTab = /\&nbsp\;/
	const findORS = /((?<!(\W|\d){2,})\d{1,3}[A-C]?\.\d{3})/g;
	const findSN = /((19|20)(\d{2}))\sc\.(\d{1,4})/g;
	const findTitle = /(?<=\>)(([A-Z0-9]|\s){5,})/g;
	const replaceORS = '<span style="color:green">$1</span>';
	const replaceSN = '<span style="color:red">$3 OL $4</span>';
	const replaceTitle = '<span style="font-size:16pt;align:center">$1</span>'
	let pageParas = document.body.querySelectorAll("p.MsoNormal");
	Array.from(pageParas).forEach(function (para){
		console.log("Ran on: " + para.innerHTML.substring(0,100)+ '...');
			count+=1
			para.innerHTML = para.innerHTML.replace(findTitle, replaceTitle);
			para.innerHTML = para.innerHTML.replace(findORS, replaceORS);
			para.innerHTML = para.innerHTML.replace(findSN, replaceSN);
			
 	});
	const findTOC = /((\d{1,3}\.\d{3})(.|\n)+)(?=(&nbsp;){2}\s?\2)/;
	const replaceTOC = '<div style="background-color:cyan">$1</div>';
	document.body.innerHTML=document.body.innerHTML.replace(findTOC, replaceTOC)
	console.log('Ran on ' + count +' paragraphs')
}