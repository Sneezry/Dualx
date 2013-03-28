var login = false;
var stateListHover = false;

window.onunload = function(){
	chrome.extension.sendMessage('clogin');
}

chrome.extension.onMessage.addListener(function(request, sender) {
	if(request == 'finish'){
		self.close();
	}
});

var logining = location.search.substr(1);
if(logining == '101'){
	login = true;
	document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
	document.getElementById('beforeLogin').style.display = 'none';
	document.getElementById('afterLogin').style.display = 'block';
}

document.getElementById('loginButtonInner').onclick = function(){
	if(login){
		chrome.extension.sendMessage('cancel');
		location.reload();
		return;
	}
	var account = document.getElementById('account').value;
	var password = document.getElementById('password').value;
	var state = document.getElementById('state').getAttribute('state');
	if(account && password){
		login = true;
		document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
		document.getElementById('beforeLogin').style.display = 'none';
		document.getElementById('afterLogin').style.display = 'block';
		chrome.extension.sendMessage('login;'+encodeURIComponent(account)+';'+encodeURIComponent(password)+';'+encodeURIComponent(state));
	}
}

document.getElementById('state').onclick = function(){
	document.getElementById('stateList').style.display = 'block';
}

document.getElementById('state').onmouseover = function(){
	stateListHover = true;
}

document.getElementById('state').onmouseout = function(){
	stateListHover = false;
}

window.onclick = function(){
	if(!stateListHover){
		document.getElementById('stateList').style.display = 'none';
	}
}

window.onload = function(){
	var statelist = document.getElementsByClassName('stateList');
	for(var i = 0; i < statelist.length; i++){
		statelist[i].onclick = function(){
			document.getElementById('state').setAttribute('state', this.getAttribute('state'));
			document.getElementById('stateList').style.display = 'none';
			return false;
		}
	}
}