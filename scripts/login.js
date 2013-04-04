var login = false;
var stateListHover = false;

window.onunload = function(){
	chrome.extension.sendMessage('clogin');
}

// short version of get ID
function getID(id) {
	return document.getElementById(id);
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
		getID('loginButtonInner').innerHTML = '登&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;录';
		getID('beforeLogin').style.display = 'block';
		getID('afterLogin').style.display = 'none';
	}
});

var logining = location.search.substr(1);
if(logining == '101'){
	login = true;
	getID('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
	getID('beforeLogin').style.display = 'none';
	getID('afterLogin').style.display = 'block';
}

if(localStorage.rememberPwd){
	getID('rememberPwd').checked = 'checked';
}

if(localStorage.autoLogin){
	getID('autoLogin').checked = 'checked';
}

if(localStorage.account){
	getID('account').value = localStorage.account;
}

if(localStorage.password){
	getID('password').value = localStorage.password;
}

if(localStorage.state){
	getID('state').setAttribute('state', localStorage.state);
}

getID('loginButtonInner').onclick = doLogin;

getID('state').onclick = function(){
	getID('stateList').style.display = 'block';
}

getID('state').onmouseover = function(){
	stateListHover = true;
}

getID('state').onmouseout = function(){
	stateListHover = false;
}

getID('account').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

getID('password').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

getID('rememberPwd').onclick = function(){
	if(this.checked){
		localStorage.rememberPwd = 'true';
	}
	else{
		localStorage.rememberPwd = '';
		localStorage.account = '';
		localStorage.password = '';
		localStorage.state = '';
		localStorage.autoLogin = '';
		getID('autoLogin').checked = '';
	}
}

getID('autoLogin').onclick = function(){
	if(this.checked){
		localStorage.autoLogin = 'true';
	}
	else{
		localStorage.autoLogin = '';
	}
}

window.onclick = function(){
	if(!stateListHover){
		getID('stateList').style.display = 'none';
	}
}

window.onload = function(){
	var statelist = document.getElementsByClassName('stateList');
	for(var i = 0; i < statelist.length; i++){
		statelist[i].onclick = function(){
			getID('state').setAttribute('state', this.getAttribute('state'));
			getID('stateList').style.display = 'none';
			return false;
		}
	}
}

function doLogin(){
	if(login){
		chrome.extension.sendMessage('cancel');
		return;
	}
	var account = getID('account').value;
	var password = getID('password').value;
	var state = getID('state').getAttribute('state');
	if(account && password){
		if(getID('rememberPwd').checked){
			localStorage.account = account;
			localStorage.password = password;
			localStorage.state = state;
		}
		login = true;
		getID('loginButtonInner').innerHTML = '取&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;消';
		getID('beforeLogin').style.display = 'none';
		getID('afterLogin').style.display = 'block';
		chrome.extension.sendMessage('login;'+encodeURIComponent(account)+';'+encodeURIComponent(password.substr(0,16))+';'+encodeURIComponent(state));
	}
}