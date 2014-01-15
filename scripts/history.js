/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

var HTML5QQ;
var info = location.search.substr(1).split('|');
var type = info[0];
var uin = info[1];

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::history:: <'+l+'> '+err);
}

chrome.extension.sendMessage('hello', function(result){
	HTML5QQ = result;
	chrome.storage.local.get('history', function(history){
		if(!history){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
			return;
		}
		if(!history.history){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
			return;
		}
		if(!history.history[HTML5QQ.qq]){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
			return;
		}
		if(!history.history[HTML5QQ.qq][type]){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
			return;
		}
		if(!history.history[HTML5QQ.qq][type][uin]){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
			return;
		}
		history = history.history[HTML5QQ.qq][type][uin];
		if(!history.length){
			document.getElementById('chatBox').innerHTML = '<div class="notice">此会话下暂无任何消息记录。</div>';
		}
		for(var i = 0; i < history.length; i++){
			var msg = history[i].msg;
			var today = new Date(history[i]['time']);
			var hh = today.getHours();
			if(hh<10) hh = '0' + hh;
			var mm = today.getMinutes();
			if(mm<10) mm = '0' + mm;
			var ss = today.getSeconds();
			if(ss<10) ss = '0' + ss;
			if(msg.from_uin){
				var el = document.createElement('div');
				el.className = 'msgName';
				el.innerHTML = history[i]['name']+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
				document.getElementById('chatBox').appendChild(el);
				 el = document.createElement('div');
				document.getElementById('chatBox').appendChild(decodeMsg(msg.content, type=='friend'?msg.from_uin:msg.send_uin, type));
			}
			else if(!msg.from_uin){
				var el = document.createElement('div');
				el.className = 'msgNameSelf';
				el.innerHTML = history[i]['name']+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
				document.getElementById('chatBox').appendChild(el);
				el = document.createElement('div');
				document.getElementById('chatBox').appendChild(decodeMsg(msg.content, HTML5QQ.qq, type));
			}
		}
		scrollBottom();
	});
});

function decodeMsg(msg, fuin){
	if(typeof(msg) == 'string'){
		msg = JSON.parse(msg);
	}
	var message = '';
	var msgBody = document.createElement('div');
	msgBody.style.marginLeft = '15px';
	for(var i = 0; i < msg.length; i++){
		if(typeof(msg[i]) == 'string'){
			message += msg[i].replace(/&/g, '&amp;').replace(/\n/g, '<br />').replace(/\r/g, '<br />');
		}
		else if(msg[i] && typeof(msg[i]) == 'object'){
			switch(msg[i][0]){
				case 'face':{
					message += '<img src="faces/'+msg[i][1]+'.gif" />';
					break;
				}
				case 'offpic':{
					if(typeof(msg[i][1])=='string'){
						message += '<img lowsrc="images/img_loading.gif" src="http://d.web2.qq.com/channel/get_offpic2?file_path='+msg[i][1]+'&f_uin='+fuin+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'" />';
					}
					else{
						message += '<img lowsrc="images/img_loading.gif" src="http://d.web2.qq.com/channel/get_offpic2?file_path=%2F'+msg[i][1].file_path.substr(1)+'&f_uin='+fuin+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'" />';
					}
					break;
				}
				case 'cface':{
					if(typeof(msg[i][1])=='string'){
						message += '<img lowsrc="images/img_loading.gif" src="http://web.qq.com/cgi-bin/webqq_app/?cmd=2&bd='+msg[i][2]+'&vfwebqq='+HTML5QQ.vfwebqq+'" />';
					}
					else{
						var t = new Date;
						var now = t.getTime();
						message += '<img lowsrc="images/img_loading.gif" src="http://web.qq.com/cgi-bin/get_group_pic?type=0&gid='+info[2]+'&uin='+fuin+'&rip='+(msg[i][1].rip?msg[i][1].rip:msg[i][1].server.split(':')[0])+'&rport='+(msg[i][1].rport?msg[i][1].rport:msg[i][1].server.split(':')[1])+'&fid='+(msg[i][1].fid?msg[i][1].fid:msg[i][1].file_id)+'&pic='+(msg[i][1].pic?msg[i][1].pic:msg[i][1].name)+'&vfwebqq='+HTML5QQ.vfwebqq+'&t='+now+'" />';
					}
					break;
				}
				case 'font':{
					msgBody.style.fontSize = (msg[i][1].size)+'pt';
					msgBody.style.lineHeight = (Number(msg[i][1].size)+10)+'pt';
					msgBody.style.color = '#'+msg[i][1].color;
					msgBody.style.fontFamily = msg[i][1].name;
					if(msg[i][1].style[0]){
						msgBody.style.fontWeight = 'bold';
					}
					if(msg[i][1].style[1]){
						msgBody.style.fontStyle = 'italic';
					}
					if(msg[i][1].style[2]){
						msgBody.style.textDecoration = 'underline';
					}
				}
			}
		}
	}
	msgBody.innerHTML = message;
	return msgBody;
}

function scrollBottom(){
	var div = document.getElementById('chatBox');
	div.scrollTop = div.scrollHeight;
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 200);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 500);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 1000);
}