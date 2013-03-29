var login = false;
var stateListHover = false;

window.onunload = function(){
	chrome.extension.sendMessage('clogin');
}

chrome.extension.onMessage.addListener(function(request, sender) {
	if(request == 'finish'){
		self.close();
	}
	else if(request == 'cancel'){
		if(!localStorage.logout && localStorage.autoLogin && localStorage.account && localStorage.password){
			localStorage.autoShow = 'true';
		}
		login = false;
		document.getElementById('loginButtonInner').innerHTML = '登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录';
		document.getElementById('beforeLogin').style.display = 'block';
		document.getElementById('afterLogin').style.display = 'none';
	}
});

var logining = location.search.substr(1);
if(logining == '101'){
	login = true;
	document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
	document.getElementById('beforeLogin').style.display = 'none';
	document.getElementById('afterLogin').style.display = 'block';
}

if(localStorage.rememberPwd){
	document.getElementById('rememberPwd').checked = 'checked';
}

if(localStorage.autoLogin){
	document.getElementById('autoLogin').checked = 'checked';
}

if(localStorage.account){
	document.getElementById('account').value = localStorage.account;
}

if(localStorage.password){
	document.getElementById('password').value = localStorage.password;
}

if(localStorage.state){
	document.getElementById('state').setAttribute('state', localStorage.state);
}

document.getElementById('loginButtonInner').onclick = function(){
	if(login){
		chrome.extension.sendMessage('cancel');
		return;
	}
	var account = document.getElementById('account').value;
	var password = document.getElementById('password').value;
	var state = document.getElementById('state').getAttribute('state');
	if(account && password){
		if(document.getElementById('rememberPwd').checked){
			localStorage.account = account;
			localStorage.password = password;
			localStorage.state = state;
		}
		login = true;
		document.getElementById('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
		document.getElementById('beforeLogin').style.display = 'none';
		document.getElementById('afterLogin').style.display = 'block';
		chrome.extension.sendMessage('login;'+encodeURIComponent(account)+';'+encodeURIComponent(password.substr(0,16))+';'+encodeURIComponent(state));
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

document.getElementById('rememberPwd').onclick = function(){
	if(this.checked){
		localStorage.rememberPwd = 'true';
	}
	else{
		localStorage.rememberPwd = '';
		localStorage.account = '';
		localStorage.password = '';
		localStorage.state = '';
		localStorage.autoLogin = '';
		document.getElementById('autoLogin').checked = '';
	}
}

document.getElementById('autoLogin').onclick = function(){
	if(this.checked){
		localStorage.autoLogin = 'true';
	}
	else{
		localStorage.autoLogin = '';
	}
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