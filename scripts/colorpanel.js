/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

window.onerror = function(err){
	chrome.extension.sendMessage('error::colorpanel:: '+err);
}

var colorCube = document.getElementsByClassName('colorCube');
var fontColor = localStorage.fontColor?localStorage.fontColor:'000000';
var fd = 0;

for(var i = 0; i < colorCube.length; i++){
	colorCube[i].onclick = function(){
		var colorCubeBorder = document.getElementsByName('colorCube');
		for(var j = 0; j< colorCubeBorder.length; j++){
			colorCubeBorder[j].style.border = '1px solid transparent';
		}
		this.parentElement.parentElement.style.border = '1px dotted black';
		fontColor = this.getAttribute('value');
	}
	if(fontColor == colorCube[i].getAttribute('value')){
		document.getElementsByName('colorCube')[i].style.border = '1px dotted black';
		fd = 1;
	}
}

if(!fd){
	document.getElementById('colorInput').value = fontColor;
	document.getElementById('customColor').style.background = '#'+fontColor;
	document.getElementById('customColor').setAttribute('value', fontColor);
	document.getElementById('customColor').parentElement.parentElement.style.border = '1px dotted black';
}

document.getElementsByClassName('actionButton')[0].onclick = function(){
	localStorage.fontColor = fontColor;
	sendRequest('color', function(){});
	self.close();
}

document.getElementsByClassName('actionButton')[1].onclick = function(){
	self.close();
}

document.getElementById('colorInput').onkeyup = function(){
	if(/^[0-9a-fA-F]{6}$/.test(this.value)){
		document.getElementById('customColor').setAttribute('value', this.value);
		document.getElementById('customColor').style.background = '#'+this.value;
	}
	else{
		document.getElementById('customColor').setAttribute('value', 'ffffff');
		document.getElementById('customColor').style.background = '#ffffff';
	}
}

function sendRequest(request, callback){
	chrome.extension.sendMessage(request, callback);
}