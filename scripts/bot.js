/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

var leftFrameWidth;
var msg_id = getMsg();
var savedRange;
var preSender;
var preSenderPeeker;
var newnotice = false;

var uin = location.search.substr(1);
var qqnum = uin;
var friendName = '';
var friendLongnick = '';
var HTML5QQ;
var fontStyle = [0, 0, 0];

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::chat:: <'+l+'> '+err);
}

window.onunload = function(){
	chrome.extension.sendMessage('ctab'+uin);
}

window.onresize = function(){
	leftFrameWidth=window.innerWidth-240;
	document.getElementById('chatBox').style.height = (window.innerHeight-251)+'px';
	scrollBottom();
}

window.onload = function(){
	chrome.windows.getCurrent(function(window){
		chrome.extension.sendMessage('ftab'+uin+'|'+window.id, function(msg){
			for(var i = 0; i < msg.length; i++){
				if(msg[i].type == 'friend'){
					recieveMsg(msg[i].msg);
				}
			}
		});
	});
	leftFrameWidth=window.innerWidth-240;
	document.getElementById('chatBox').style.height = (window.innerHeight-251)+'px';
	document.getElementById('leftFrame').style.width = '100%';
	scrollBottom();
	
	localStorage.fontColor=localStorage.fontColor?localStorage.fontColor:'000000';
	document.getElementById('inputBox').style.color = '#'+localStorage.fontColor;
	for(var i = 8; i <= 22; i++){
		var el = document.createElement('option');
		el.value = i;
		if(!localStorage.fontSize && 16 == i){
			el.selected = 'selected';
			document.getElementById('inputBox').style.fontSize = '16pt';
		}
		else if(localStorage.fontSize && localStorage.fontSize == i){
			el.selected = 'selected';
			document.getElementById('inputBox').style.fontSize = (localStorage.fontSize)+'pt';
		}
		el.innerHTML = i;
		document.getElementById('fontSize').appendChild(el);
	}
	
	if(localStorage.fontBold == 1){
		fontStyle[0] = 1;
		document.getElementById('fontBold').className = 'toolButtonActive';
		document.getElementById('inputBox').style.fontWeight = 'bold';
	}
	if(localStorage.fontItalic == 1){
		fontStyle[1] = 1;
		document.getElementById('fontItalic').className = 'toolButtonActive';
		document.getElementById('inputBox').style.fontStyle = 'italic';
	}
	if(localStorage.fontUnderline == 1){
		fontStyle[2] = 1;
		document.getElementById('fontUnderline').className = 'toolButtonActive';
		document.getElementById('inputBox').style.textDecoration = 'underline';
	}
}

((function(){
	//if(localStorage.chatstyle && !localStorage.popupmain){
	if(localStorage.chatstyle){
		var el = document.createElement('style');
		el.type = 'text/css';
		el.innerHTML = localStorage.chatstyle;
		document.getElementsByTagName('head')[0].appendChild(el);
	}
})())

document.getElementById('inputBox').focus();

chrome.extension.onMessage.addListener(function(request, sender) {
	if(typeof(request) == 'object'){
		switch(request.retcode){
			case 0:{
				for(var i = 0; i < request.result.length; i++){
					switch(request.result[i].poll_type){
						case 'message':{
							recieveMsg(request.result[i].value);
							break;
						}
					}
				}
			}
		}
	}
	else if(request == 'color'){
		document.getElementById('inputBox').style.color = '#'+localStorage.fontColor;
	}
	else if(request == 'logout'){
		self.close();
	}
});

function getMsg(){
	var t = new Date();
	var now = t.getTime();
	if(now%100000 < 10000){
		return now%100000*10000;
	}
	else{
		return Math.floor((now%100000)/10)*10000;
	}
}

function formatMsg(msg){
	msg = msg.childNodes;
	if(!msg){
		return;
	}
	var result = [];
	for(var i = 0; i < msg.length; i++){
		if(msg[i].nodeType == 3){
			if(msg[i].nodeValue == '==allfaces=='){
				result = result.concat(sendAllFaces());
				continue;
			}
			result.push(msg[i].nodeValue.replace(/\\/g, '\\\\\\\\'));
		}
		else if(msg[i].nodeName == 'IMG'){
			if(msg[i].getAttribute('imgtype') == 'offpic'){
				result.push([
					'offpic',
					msg[i].getAttribute('filepath'),
					msg[i].getAttribute('filename'),
					parseInt(msg[i].getAttribute('filesize'))
				]);
			}
			else{
				result.push(['face', parseInt(msg[i].getAttribute('face'))]);
			}
		}
		else{
			if(msg[i].nodeName == 'DIV' && i){
				result.push('\n');
			}
			result = result.concat(formatMsg(msg[i]));
		}
	}
	return result;
}

function decodeMsg(msg, fuin){
	if(typeof(msg) == 'string'){
		msg = JSON.parse(msg);
	}
	var message = '';
	var msgBody = document.createElement('div');
	msgBody.style.marginLeft = '10px';
	for(var i = 0; i < msg.length; i++){
		if(typeof(msg[i]) == 'string'){
			message += msg[i].replace(/&/g, '&amp;').replace(/\n/g, '<br />').replace(/\r/g, '<br />');
		}
		else if(typeof(msg[i]) == 'object'){
			switch(msg[i][0]){
				case 'face':{
					message += '<img src="faces/'+msg[i][1]+'.gif" />';
					break;
				}
				case 'cface':{
					if(typeof(msg[i][1])=='string'){
						message += '<img lowsrc="images/img_loading.gif" src="http://d.web2.qq.com/channel/get_cface2?lcid=5628&guid='+msg[i][2]+'&to='+uid+'&count=5&time=1&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'" />';
					}
					break;
				}
				case 'offpic':{
					if(typeof(msg[i][1])=='string'){
						for(var j = 0; j < picPaths.length; j++){
							if(picPaths[j][0] == msg[i][1]){
								message += '<img lowsrc="images/img_loading.gif" src="'+picPaths[j][1]+'" />';
								break;
							}
						}
					}
					else{
						message += '<img lowsrc="images/img_loading.gif" src="http://d.web2.qq.com/channel/get_offpic2?file_path=%2F'+msg[i][1].file_path.substr(1)+'&f_uin='+fuin+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'" />';
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

function sendMsg(){
	if(!document.getElementById('inputBox').innerHTML){
		return;
	}
	chrome.storage.local.get('fqcy', function(obj){
		var fqcy;
		if(!obj.fqcy){
			fqcy = new Object;
		}
		else{
			fqcy = obj.fqcy;
		}
		if(!fqcy[HTML5QQ.qq]){
			fqcy[HTML5QQ.qq] = new Object;
		}
		if(!fqcy[HTML5QQ.qq]['friend']){
			fqcy[HTML5QQ.qq]['friend'] = new Object;
		}
		if(!fqcy[HTML5QQ.qq]['friend'][qqnum]){
			fqcy[HTML5QQ.qq]['friend'][qqnum] = 0;
		}
		fqcy[HTML5QQ.qq]['friend'][qqnum]++;
		chrome.storage.local.set({'fqcy': fqcy});
	});
	msg_id++;
	var msg = formatMsg( document.getElementById('inputBox') );
	var testmsg = document.getElementById('inputBox').innerHTML.replace(/<.+?>/gim,'');
	document.getElementById('inputBox').innerHTML = '';
	var url = 'http://d.web2.qq.com/channel/send_buddy_msg2';
	var r = {
		'to': uin,
		'face': 0,
		'content': JSON.stringify(
			msg.concat([
				//msg will be added here
				['font', {
					'name': localStorage.fontFamily?localStorage.fontFamily:'宋体',
					'size': localStorage.fontSize?localStorage.fontSize:16,
					'style': [fontStyle[0], fontStyle[1], fontStyle[2]],
					'color': localStorage.fontColor
				}]
			])),
		'msg_id': msg_id,
		'clientid': HTML5QQ.clientid,
		'psessionid': HTML5QQ.psessionid
	};
	recieveMsg(r);
	getBotResponse(testmsg);
}

document.getElementById('sendMsgBtn').onclick = sendMsg;

function recieveMsg(msg){
	var today;
	if(msg.time){
		today = new Date(msg.time*1000);
	}else{
		today = new Date();
	}
	var hh = today.getHours();
	if(hh<10) hh = '0' + hh;
	var mm = today.getMinutes();
	if(mm<10) mm = '0' + mm;
	var ss = today.getSeconds();
	if(ss<10) ss = '0' + ss;
	var now = today.getTime();
	
	if(msg.from_uin == uin){
		newnotice = true;
		updateTitle();
		if(preSenderPeeker){
			clearTimeout(preSenderPeeker);
		}
		preSenderPeeker = setTimeout(function(){preSender = null},10000);
		if(preSender != uin){
			preSender = uin;
			var el = document.createElement('div');
			el.className = 'msgName';
			el.innerHTML = friendName+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
			document.getElementById('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		document.getElementById('chatBox').appendChild(decodeMsg(msg.content, msg.from_uin));
		scrollBottom();
	}
	else if(!msg.from_uin){
		chrome.storage.local.get('history', function(obj){
			if(!obj.history){
				history = new Object;
			}
			else{
				history = obj.history;
			}
			if(!history[HTML5QQ.qq]){
				history[HTML5QQ.qq] = new Object;
			}
			if(!history[HTML5QQ.qq]['friend']){
				history[HTML5QQ.qq]['friend'] = new Object;
			}
			if(!history[HTML5QQ.qq]['friend'][qqnum]){
				history[HTML5QQ.qq]['friend'][qqnum] = new Array;
			}
			history[HTML5QQ.qq]['friend'][qqnum].push({time: now, uin: uin, name: HTML5QQ.info.nick, msg: msg});
			chrome.storage.local.set({history: history});
		});
		if(preSenderPeeker){
			clearTimeout(preSenderPeeker);
		}
		preSenderPeeker = setTimeout(function(){preSender = null},10000);
		if(preSender != HTML5QQ.qq){
			preSender = HTML5QQ.qq;
			var el = document.createElement('div');
			el.className = 'msgNameSelf';
			el.innerHTML = HTML5QQ.info.nick+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
			document.getElementById('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		document.getElementById('chatBox').appendChild(decodeMsg(msg.content, HTML5QQ.qq));
		scrollBottom();
	}
}

function sendRequest(request, callback){
	chrome.extension.sendMessage(request, callback);
}

function httpRequest(method, action, query, urlencoded, callback, timeout){
	var url = "GET" == method ? (query ? action+"?"+query : action) : action;
	
	var xhr = new XMLHttpRequest();
	xhr.open(method, url, true);
	if("POST" == method && urlencoded){
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	}
	xhr.onreadystatechange = function() {
	  if (xhr.readyState == 4 && callback) {
	    callback(xhr.responseText);
	  }
	}
	if("POST" == method && query){
		xhr.send(query);
	}
	else{
		xhr.send();
	}
	if(timeout){
		setTimeout(function(){
			if(xhr.readyState != 4){
				xhr.abort();
				callback(null);
			}
		}, timeout);
	}
}

sendRequest('hello', function(result){
	HTML5QQ = result;
	var el = document.createElement('img');
	el.id = 'userHeadImg'
	el.src = '/images/bot/'+uin+'.png';
	el.width = 40;
	el.height = 40;
	document.getElementById('userHead').appendChild(el);
	friendName = uin;
	document.title = friendName;
	document.getElementById('userName').innerHTML = friendName + document.getElementById('userName').innerHTML;
});

chrome.fontSettings.getFontList(function(fonts){
	var elslc = false;
	for(var i = 0; i < fonts.length; i++){
		var el = document.createElement('option');
		el.id = 'font_id_'+i;
		el.value = fonts[i].fontId;
		el.innerHTML = fonts[i].displayName;
		if(!localStorage.fontFamily && '宋体' == fonts[i].fontId){
			el.selected = 'selected';
			elslc = true;
			document.getElementById('inputBox').style.fontFamily = '宋体';
		}
		else if(localStorage.fontFamily && localStorage.fontFamily == fonts[i].fontId){
			el.selected = 'selected';
			elslc = true;
			document.getElementById('inputBox').style.fontFamily = localStorage.fontFamily;
		}
		document.getElementById('fontFamily').appendChild(el);
	}
	if(!elslc){
		document.getElementById('font_id_0').selected = 'selected';
		document.getElementById('inputBox').style.fontFamily = fonts[0].fontId;
	}
});

document.getElementById('toolFontStyle').onclick = function(){
	if(document.getElementById('toolFontStyleTab').style.display != 'block'){
		document.getElementById('toolFontStyleTab').style.display = 'block';
		document.getElementById('toolFontStyle').className = 'toolButtonActive';
		leftFrameWidth=window.innerWidth-240;
		document.getElementById('chatBox').style.height = (window.innerHeight-279)+'px';
		document.getElementById('chatBox').style.marginBottom = '28px';
		scrollBottom();
	}
	else{
		document.getElementById('toolFontStyleTab').style.display = 'none';
		document.getElementById('toolFontStyle').className = 'toolButton';
		leftFrameWidth=window.innerWidth-240;
		document.getElementById('chatBox').style.height = (window.innerHeight-251)+'px';
		document.getElementById('chatBox').style.marginBottom = '0';
		scrollBottom();
	}
}

document.getElementById('fontFamily').onchange = function(){
	document.getElementById('inputBox').style.fontFamily = this.value;
	localStorage.fontFamily = this.value;
}

document.getElementById('fontSize').onchange = function(){
	document.getElementById('inputBox').style.fontSize = this.value+'pt';
	localStorage.fontSize = this.value;
}

document.getElementById('fontBold').onclick = function(){
	changeStyle(this.id);
}

document.getElementById('fontItalic').onclick = function(){
	changeStyle(this.id);
}

document.getElementById('fontUnderline').onclick = function(){
	changeStyle(this.id);
}

document.getElementById('fontColor').onclick = function(){
	chrome.windows.create({
		url: 'colorpanel.html',
		width: 236,
		height: 260,
		focused: true,
		type: 'popup'
	});
}

document.getElementById('toolMsgRec').onclick = function(){
	chrome.windows.create({
		url: 'history.html?friend|'+qqnum,
		width: 560,
		height: 510,
		focused: true,
		type: 'popup'
	});
}

function changeStyle(n){
	switch(n){
		case 'fontBold':{
			if(fontStyle[0] == 0){
				fontStyle[0] = 1;
				document.getElementById('fontBold').className = 'toolButtonActive';
				document.getElementById('inputBox').style.fontWeight = 'bold';
				localStorage.fontBold = 1;
			}
			else{
				fontStyle[0] = 0;
				document.getElementById('fontBold').className = 'toolButton';
				document.getElementById('inputBox').style.fontWeight = 'normal';
				localStorage.fontBold = 0;
			}
			break;
		}
		case 'fontItalic':{
			if(fontStyle[1] == 0){
				fontStyle[1] = 1;
				document.getElementById('fontItalic').className = 'toolButtonActive';
				document.getElementById('inputBox').style.fontStyle = 'italic';
				localStorage.fontItalic = 1;
			}
			else{
				fontStyle[1] = 0;
				document.getElementById('fontItalic').className = 'toolButton';
				document.getElementById('inputBox').style.fontStyle = 'normal';
				localStorage.fontItalic = 0;
			}
			break;
		}
		case 'fontUnderline':{
			if(fontStyle[2] == 0){
				fontStyle[2] = 1;
				document.getElementById('fontUnderline').className = 'toolButtonActive';
				document.getElementById('inputBox').style.textDecoration = 'underline';
				localStorage.fontUnderline = 1;
			}
			else{
				fontStyle[2] = 0;
				document.getElementById('fontUnderline').className = 'toolButton';
				document.getElementById('inputBox').style.textDecoration = 'none';
				localStorage.fontUnderline = 0;
			}
			break;
		}
	}
}

function scrollBottom(){
	var div = document.getElementById('chatBox');
	div.scrollTop = div.scrollHeight;
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 200);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 500);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 1000);
}

document.getElementById('inputBox').onkeydown = function(){
	if((event.ctrlKey && localStorage.ctrl || !event.ctrlKey && !localStorage.ctrl) && event.keyCode==13){
		sendMsg();
		return false;
	}
}

document.getElementById('inputBox').onkeyup = function(){
	savedRange = window.getSelection().getRangeAt(0);
}

document.getElementById('inputBox').onmouseup = function(){
	savedRange = window.getSelection().getRangeAt(0);
}

document.getElementById('toolBar').onclick = restoreSelection;

function restoreSelection(){
	document.getElementById('inputBox').focus();
	if(savedRange != null) {
		var s = window.getSelection();
		if(s.rangeCount > 0){
			s.removeAllRanges();
		}
		s.addRange(savedRange);
	}
}

function updateTitle(){
	chrome.windows.getCurrent(function(window){
		if(window.focused){
			newnotice = false;
			document.title = friendName;
		}
		else if(newnotice){
			document.title = '有新消息 - ' + friendName;
		}
	});
}

function getBotResponse(request){
	switch(uin){
		case 'youdaodic': {
			httpRequest('GET', 'http://fanyi.youdao.com/openapi.do?keyfrom=lewe518&key=70654389&type=data&doctype=json&version=1.1&q='+request, null, false, function(response){
				response = JSON.parse(response);
				var translation = response.translation.join(', ');
				var result = {
					retcode: 0,
					result:
					[
						{
							poll_type: "message",
							value:
							{
								from_uin: uin,
								content:
								[
									translation
								]
							}
						}
					]
				};
				chrome.extension.sendMessage(result);
			});
			break;
		}
		case 'weather': {
			httpRequest('GET', 'http://sou.qq.com/online/get_weather.php?city='+request, null, false, function(response){
				response = JSON.parse(response);
				var result = {
					retcode: 0,
					result:
					[
						{
							poll_type: "message",
							value:
							{
								from_uin: uin,
								content:
								[
									response.future.name+'：'+response.future.wea_0+'，'+response.real.temperature+'℃'
								]
							}
						}
					]
				};
				chrome.extension.sendMessage(result);
			});
			break;
		}
		case 'xiami': {
			httpRequest('GET', 'http://www.xiami.com/app/iphone/search/key/'+request, null, false, function(response){
				response = JSON.parse(response);
				var list = new Array();
				for(var i=0; i<response.songs.length; i++){
					list.push(response.songs[i].name+' - '+response.songs[i].artist_name+' - '+response.songs[i].location);
					list.push('\n\n');
				}
				console.log(list);
				var result = {
					retcode: 0,
					result:
					[
						{
							poll_type: "message",
							value:
							{
								from_uin: uin,
								content: (response.songs.length?list:['未找到。'])
							}
						}
					]
				};
				chrome.extension.sendMessage(result);
			});
			break;
		}
	}
}

chrome.windows.onFocusChanged.addListener(function(wid) {
	updateTitle();
});

window.onclick = function(){
	updateTitle();
}

document.getElementById('closeMsgBtn').onclick = function(){
	chrome.extension.sendMessage('ctab'+uin);
	self.close();
}
