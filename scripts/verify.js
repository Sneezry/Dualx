/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

window.onerror = function(err){
	chrome.extension.sendMessage('error::verify:: '+err);
}

var verifyInfo = location.search.substr(1).split('&');
document.getElementById('verifyCodeImg').src = "http://captcha.qq.com/getimage?aid=1003903&r="+Math.random()+"&uin="+verifyInfo[0]+"&vc_type="+verifyInfo[1];
document.getElementById('ok').onclick = function(){
	chrome.extension.sendMessage('verify;'+document.getElementById('verifyCode').value);
	self.close();
}

document.getElementById('verifyCode').onkeydown = function(){
	if(event.keyCode==13){
		chrome.extension.sendMessage('verify;'+document.getElementById('verifyCode').value);
		self.close();
	}
}

document.getElementById('verifyCode').select();