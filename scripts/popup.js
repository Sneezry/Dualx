/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

if(localStorage.popupmain){
	document.getElementById('showMain').style.display = 'none';
}

document.getElementById('showMain').onclick = function(){
	chrome.extension.sendMessage('showmain');
}

var HTML5QQ;

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::popup:: <'+l+'> '+err);
}

chrome.extension.sendMessage('hello', function(result){
	HTML5QQ = result;
	chrome.extension.sendMessage('newmsg', function(newMsg){
		for(var i = 0; i < newMsg.friend.length; i++){
			var uin = newMsg.friend[i];
			if (uin in HTML5QQ.friendsInfo.friends) {
				var friend = HTML5QQ.friendsInfo.friends[uin];
				var markname = friend.markname;
				var nick = friend.nick;
				
				var el = document.createElement('div');
				el.id = 'popupf_'+uin;
				el.onclick = function(){
					chrome.extension.sendMessage('otab'+uin);
				}
				el.className = 'searchResult';
				el.style.backgroundImage = 'url(http://face'+(uin%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=1&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq+')';
				el.innerHTML = markname?(markname+'('+nick+')'):nick;
				document.getElementById('resultList').appendChild(el);
			}
		}
		for(var i = 0; i < newMsg.qun.length; i++){
			for(var j = 0; j < HTML5QQ.groupsInfo.gnamelist.length; j++){
				if(HTML5QQ.groupsInfo.gnamelist[j].code == newMsg.qun[i]){
					var el = document.createElement('div');
					el.id = 'popupq_'+HTML5QQ.groupsInfo.gnamelist[j].code;
					el.onclick = function(){
						chrome.extension.sendMessage('oqtab'+this.id.substr(7));
					}
					el.className = 'searchResult';
					el.style.backgroundImage = 'url(http://face'+(HTML5QQ.groupsInfo.gnamelist[j].code%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=4&fid=0&uin='+HTML5QQ.groupsInfo.gnamelist[j].code+'&vfwebqq='+HTML5QQ.vfwebqq+')';
					el.innerHTML = HTML5QQ.groupsInfo.gnamelist[j].name;
					document.getElementById('resultList').appendChild(el);
					break;
				}
			}
		}
	});
});
