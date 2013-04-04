// short version of get ID
function getID(id) {
	return document.getElementById(id);
}

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
	getID('colorInput').value = fontColor;
	getID('customColor').style.background = '#'+fontColor;
	getID('customColor').setAttribute('value', fontColor);
	getID('customColor').parentElement.parentElement.style.border = '1px dotted black';
}

document.getElementsByClassName('actionButton')[0].onclick = function(){
	localStorage.fontColor = fontColor;
	sendRequest('color', function(){});
	self.close();
}

document.getElementsByClassName('actionButton')[1].onclick = function(){
	self.close();
}

getID('colorInput').onkeyup = function(){
	if(/^[0-9a-fA-F]{6}$/.test(this.value)){
		getID('customColor').setAttribute('value', this.value);
		getID('customColor').style.background = '#'+this.value;
	}
	else{
		getID('customColor').setAttribute('value', 'ffffff');
		getID('customColor').style.background = '#ffffff';
	}
}

function sendRequest(request, callback){
	chrome.extension.sendMessage(request, callback);
}