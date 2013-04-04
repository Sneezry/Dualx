// short version of get ID
function getID(id) {
	return document.getElementById(id);
}

window.onerror = function(err){
	chrome.extension.sendMessage('error::verify:: '+err);
}

var verifyInfo = location.search.substr(1).split('&');
getID('verifyCodeImg').src = "http://captcha.qq.com/getimage?aid=1003903&r="+Math.random()+"&uin="+verifyInfo[0]+"&vc_type="+verifyInfo[1];
getID('ok').onclick = function(){
	chrome.extension.sendMessage('verify;'+getID('verifyCode').value);
	self.close();
}