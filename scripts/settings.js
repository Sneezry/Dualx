window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::settings:: <'+l+'> '+err);
}

var boxs = document.getElementsByTagName('input');
for(var i=0; i<boxs.length; i++){
	boxs[i].onclick = save;
	if(localStorage[boxs[i].id]){
		boxs[i].checked = 'checked';
	}
}

function save(){
	if(this.checked){
		localStorage[this.id] = 'true';
	}
	else{
		localStorage[this.id] = '';
	}
}