/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

var leftFrameWidth;
var sending = false;
var oTimer;
var preloaded = 0;
var iBytesUploaded;
var iBytesTotal;
var oXHR;
var msg_id = getMsg();
var savedRange;
var loadingImg = 0;
var fileid = 0;
var toolFaceOver = false;
var shakable = true;
var preSender = new Array;
var preSenderPeeker = new Array;
var faceTransferTable = [14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 50, 51, 96, 53, 54, 73, 74, 75, 76, 77, 78, 55, 56, 57, 58, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 32, 113, 114, 115, 63, 64, 59, 33, 34, 116, 36, 37, 38, 91, 92, 93, 29, 117, 72, 45, 42, 39, 62, 46, 47, 71, 95, 118, 119, 120, 121, 122, 123, 124, 27, 21, 23, 25, 26, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 52, 24, 22, 20, 60, 61, 89, 90, 31, 94, 65, 35, 66, 67, 68, 69, 70, 15, 16, 17, 18, 19, 28, 30, 40, 41, 43, 44, 48, 49];
var newnotice = false;
var qunnum;

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::qun:: <'+l+'> '+err);
}

window.onunload = function(){
	chrome.extension.sendMessage('cqtab'+uin);
}

window.onresize = function(){
	leftFrameWidth=window.innerWidth-240;
	document.getElementById('chatBox').style.height = (window.innerHeight-251)+'px';
	if(sending){
		document.getElementById('leftFrame').style.width = leftFrameWidth+'px';
		document.getElementById('rightFrame').style.width = '204px';
		document.getElementById('rightFrame').style.display = 'block';
	}
	scrollBottom();
}

window.onload = function(){
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
	
	for(var i=0; i < 105; i++){
		var el = document.createElement('div');
		el.className = 'faceCube';
		el.setAttribute('mark', i);
		el.onclick = function(){
			insertImg('face', {face: faceTransferTable[this.getAttribute('mark')]});
			document.getElementById('facePanel').style.display = 'none';
			document.getElementById('toolFaces').className = 'toolButton';
		}
		document.getElementById('facePanel').appendChild(el);
		if(i%15 == 14){
			var el = document.createElement('div');
			el.style.clear = 'both';
			document.getElementById('facePanel').appendChild(el);
		}
	}
}

((function(){
	//if(localStorage.qunstyle && !localStorage.popupmain){
	if(localStorage.qunstyle){
		var el = document.createElement('style');
		el.type = 'text/css';
		el.innerHTML = localStorage.qunstyle;
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
						case 'group_message':{
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

function getAccount(){
	var t = new Date;
	var now = t.getTime();
	var url = 'http://s.web2.qq.com/api/get_friend_uin2?tuin='+uin+'&verifysession=&type=4&code=&vfwebqq='+HTML5QQ.vfwebqq+'&t='+now;
	httpRequest('GET', url, null, false, function(result){
		result = JSON.parse(result);
		if(result.result){
			qunnum = result.result.account;
			getStatus(function(silent){
				if(silent){
					document.getElementById('showState').style.display = 'block';
				}
				else{
					document.getElementById('showState').style.display = 'none';
				}
			});
			document.getElementById('userName').innerHTML += '('+result.result.account+')';
			document.getElementById('sendFile').onclick = function(){
				window.open('http://qun.qq.com/air/#'+result.result.account+'/share');
			}
		}
	});
}

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
			//result += '\\"'+msg[i].nodeValue+'\\",';
			result.push(msg[i].nodeValue.replace(/\\/g, '\\\\\\\\'));
		}
		else if(msg[i].nodeName == 'IMG'){
			if(msg[i].getAttribute('imgtype') == 'offpic'){
				result.push([
					'cface',
					'group',
					msg[i].getAttribute('mark')
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

function decodeMsg(msg, fuin, group_code){
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
						message += '<img lowsrc="images/img_loading.gif" src="http://web.qq.com/cgi-bin/webqq_app/?cmd=2&bd='+msg[i][2]+'&vfwebqq='+HTML5QQ.vfwebqq+'" />';
					}
					else{
						var t = new Date;
						var now = t.getTime();
						message += '<img lowsrc="images/img_loading.gif" src="http://web.qq.com/cgi-bin/get_group_pic?type=0&gid='+group_code+'&uin='+fuin+'&rip='+(msg[i][1].rip?msg[i][1].rip:msg[i][1].server.split(':')[0])+'&rport='+(msg[i][1].rport?msg[i][1].rport:msg[i][1].server.split(':')[1])+'&fid='+(msg[i][1].fid?msg[i][1].fid:msg[i][1].file_id)+'&pic='+(msg[i][1].pic?msg[i][1].pic:msg[i][1].name)+'&vfwebqq='+HTML5QQ.vfwebqq+'&t='+now+'" />';
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
		if(!fqcy[HTML5QQ.qq]['qun']){
			fqcy[HTML5QQ.qq]['qun'] = new Object;
		}
		if(!fqcy[HTML5QQ.qq]['qun'][uin]){
			fqcy[HTML5QQ.qq]['qun'][uin] = 0;
		}
		fqcy[HTML5QQ.qq]['qun'][uin]++;
		chrome.storage.local.set({'fqcy': fqcy});
	});
	msg_id++;
	var msg = formatMsg( document.getElementById('inputBox') );
	document.getElementById('inputBox').innerHTML = '';
	var url = 'http://d.web2.qq.com/channel/send_qun_msg2';
	var r = {
		'group_uin': qunInfo.ginfo.gid,
		'key': gface_key,
		'sig': gface_sig,
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
	r = encodeURIComponent(JSON.stringify(r));
	httpRequest('POST', url, 'r='+r+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid, true, function(result){
		
	});
}

document.getElementById('sendMsgBtn').onclick = sendMsg;

var uin = location.search.substr(1);
var friendLongnick = '';
var HTML5QQ;
var qunInfo;
var fontStyle = [0, 0, 0];
var gface_key;
var gface_sig;

function friendName(uin){
    var card;

	for (var i = 0; qunInfo.cards && (i < qunInfo.cards.length); i++) {
		if (qunInfo.cards[i].muin == uin) { 
		    card = qunInfo.cards[i].card;
            break;
		}
	}
    for (var i = 0; i < qunInfo.minfo.length; i++) {
        if (qunInfo.minfo[i].uin == uin) {
            var nick = qunInfo.minfo[i].nick;
            return card ? card+'('+nick+')' : nick;
        }
    }

}

function getFaceSig(){
	var t = new Date;
	var now = t.getTime();
	var url = 'http://d.web2.qq.com/channel/get_gface_sig2?clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'&t='+now;
	httpRequest('GET', url, null, false, function(result){
		result = JSON.parse(result);
		result = result.result;
		gface_key = result.gface_key;
		gface_sig = result.gface_sig;
	});
}

function recieveMsg(msg){
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
	
	if(msg.from_uin == qunInfo.ginfo.gid){
		newnotice = true;
		updateTitle();
		clearTimeout(preSenderPeeker);
		preSenderPeeker = setTimeout(function(){preSender = null},10000);
		if(preSender != msg.send_uin){
			preSender = msg.send_uin;
			var el = document.createElement('div');
			el.className = 'msgName';
			el.innerHTML = friendName(msg.send_uin)+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
			document.getElementById('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		document.getElementById('chatBox').appendChild(decodeMsg(msg.content, msg.send_uin, msg.group_code));
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
			if(!history[HTML5QQ.qq]['qun']){
				history[HTML5QQ.qq]['qun'] = new Object;
			}
			if(!history[HTML5QQ.qq]['qun'][uin]){
				history[HTML5QQ.qq]['qun'][uin] = new Array;
			}
			history[HTML5QQ.qq]['qun'][uin].push({time: now, uin: msg.send_uin, name: HTML5QQ.info.nick, msg: msg});
			chrome.storage.local.set({'history': history});
		});
		clearTimeout(preSenderPeeker);
		preSenderPeeker = setTimeout(function(){preSender = null},10000);
		if(preSender != HTML5QQ.qq){
			preSender = HTML5QQ.qq;
			var el = document.createElement('div');
			el.className = 'msgNameSelf';
			el.innerHTML = HTML5QQ.info.nick+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
			document.getElementById('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		document.getElementById('chatBox').appendChild(decodeMsg(msg.content, HTML5QQ.qq, msg.group_code));
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
	
	var t = new Date();
	var now = t.getTime();
	var url = 'http://s.web2.qq.com/api/get_group_info_ext2?gcode='+uin+'&vfwebqq='+HTML5QQ.vfwebqq+'&t='+now;
	httpRequest('GET', url, null, false, function(result){
		result = JSON.parse(result);
		qunInfo = result.result;
		document.title = qunInfo.ginfo.name;
		document.getElementById('userName').innerHTML = qunInfo.ginfo.name + document.getElementById('userName').innerHTML;
		document.getElementById('toolMsgRec').onclick = function(){
			chrome.windows.create({
				url: 'history.html?qun|'+uin+'|'+qunInfo.ginfo.gid,
				width: 560+parseInt(localStorage.widthoffset),
				height: 510+parseInt(localStorage.heightoffset),
				focused: true,
				type: 'popup'
			});
		}
		chrome.windows.getCurrent(function(window){
			chrome.extension.sendMessage('fqtab'+uin+'|'+window.id, function(msg){
				for(var i = 0; i < msg.length; i++){
					if(msg[i].type == 'qun'){
						recieveMsg(msg[i].msg);
					}
				}
			});
		});
	});
	
	getFaceSig();
	getAccount();
	
	var el = document.createElement('img');
	el.id = 'userHeadImg'
	el.src = 'http://face'+(parseInt(uin.substr(-1))+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=4&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq;
	el.width = 40;
	el.height = 40;
	el.onclick = chgStatus;
	el.title = '点击以更改屏蔽设置';
	document.getElementById('userHead').appendChild(el);
	document.getElementById('op_vfwebqq').value = HTML5QQ.vfwebqq;
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
		chrome.windows.getCurrent(function(window){
			leftFrameWidth=window.width-240;
			document.getElementById('chatBox').style.height = (window.innerHeight-279)+'px';
			document.getElementById('chatBox').style.marginBottom = '28px';
			scrollBottom();
		});
	}
	else{
		document.getElementById('toolFontStyleTab').style.display = 'none';
		document.getElementById('toolFontStyle').className = 'toolButton';
		chrome.windows.getCurrent(function(window){
			leftFrameWidth=window.width-240;
			document.getElementById('chatBox').style.height = (window.innerHeight-251)+'px';
			document.getElementById('chatBox').style.marginBottom = '0';
			scrollBottom();
		});
	}
}

document.getElementById('toolFaces').onclick = function(){
	document.getElementById('facePanel').style.display = 'block';
	document.getElementById('toolFaces').className = 'toolButtonActive';
}

document.getElementById('toolFaces').onmouseover = function(){
	toolFaceOver = true;
}

document.getElementById('toolFaces').onmouseout = function(){
	toolFaceOver = false;
}

document.getElementById('facePanel').onmouseover = function(){
	toolFaceOver = true;
}

document.getElementById('facePanel').onmouseout = function(){
	toolFaceOver = false;
}

document.getElementById('inputBox').onkeydown = function(){
	if((event.ctrlKey && localStorage.ctrl || !event.ctrlKey && !localStorage.ctrl) && event.keyCode==13){
		sendMsg();
		return false;
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
		width: 236+parseInt(localStorage.heightoffset),
		height: 260+parseInt(localStorage.heightoffset),
		focused: true,
		type: 'popup'
	});
}

document.getElementById('offPic').onmousedown = function(){
	var t = new Date();
	this.form.action = 'http://up.web2.qq.com/cgi-bin/cface_upload?time='+t.getTime();
}

document.getElementById('offPic').onchange = function(){
	fileid++;
	document.getElementById('op_fileid').value = fileid
	var thisLoadingImg = loadingImg;
	loadingImg++;
	insertImg('offpic', {
		src: 'images/img_loading.gif',
		id: 'offImg_'+thisLoadingImg
	});
	var vFD = new FormData(this.form);
	oXHR = new XMLHttpRequest();
	oXHR.open('POST', this.form.action);
	oXHR.onreadystatechange = function() {
		if (oXHR.readyState == 4 && oXHR.responseText) {
		  var result = oXHR.responseText.split('\'msg\':\'')[1].split('\'')[0];
		  result = result.split(' ')[0];
		  var t = new Date();
		  var url = 'http://web.qq.com/cgi-bin/webqq_app/?cmd=2&bd='+result+'&vfwebqq='+HTML5QQ.vfwebqq;
			var el = document.getElementById('offImg_'+thisLoadingImg);
		  el.src = url;
		  el.setAttribute('mark', result);
		}
	}
	oXHR.send(vFD);
	//this.form.submit();
	this.form.reset();
}

function sendImg(img, suffix){
	var t = new Date();
	fileid++;
	var actionUrl = 'http://up.web2.qq.com/cgi-bin/cface_upload?time='+t.getTime();
	var thisLoadingImg = loadingImg;
	loadingImg++;
	insertImg('offpic', {
		src: 'images/img_loading.gif',
		id: 'offImg_'+thisLoadingImg
	});
	var vFD = new FormData();
	vFD.append('from', 'control');
	vFD.append('f', 'EQQ.Model.ChatMsg.callbackSendPicGroup');
	vFD.append('vfwebqq', document.getElementById('op_vfwebqq').value);
	vFD.append('custom_face', img, 'pasteImg.'+suffix);
	vFD.append('fileid', fileid);
	oXHR = new XMLHttpRequest();
	oXHR.open('POST', actionUrl);
	oXHR.onreadystatechange = function() {
		if (oXHR.readyState == 4 && oXHR.responseText) {
		  var result = oXHR.responseText.split('\'msg\':\'')[1].split('\'')[0];
		  result = result.split(' ')[0];
		  var t = new Date();
		  var url = 'http://web.qq.com/cgi-bin/webqq_app/?cmd=2&bd='+result+'&vfwebqq='+HTML5QQ.vfwebqq;
			var el = document.getElementById('offImg_'+thisLoadingImg);
		  el.src = url;
		  el.setAttribute('mark', result);
		}
	}
	oXHR.send(vFD);
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

document.getElementById('inputBox').onpaste = function(e){
	var items = e.clipboardData&&e.clipboardData.items;
	for(var i = 0; i < items.length; i++){
		if(items[i].kind == 'file'){
			var img = items[i].getAsFile();
			sendImg(img, items[i].type.split('/')[1]);
			return false;
		}
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

function insertImg(imgtype, imgvalue){
	var el = document.createElement('img');
	if(imgtype == 'face'){
		el.src = 'faces/'+imgvalue.face+'.gif';
		el.setAttribute('imgtype','face');
		el.setAttribute('face',imgvalue.face);
	}
	else if(imgtype == 'offpic'){
		el.src = imgvalue.src;
		el.id = imgvalue.id;
		el.setAttribute('imgtype','offpic');
	}
	if(savedRange){
		savedRange.insertNode(el);
	}
	else{
		document.getElementById('inputBox').appendChild(el);
	}
	setTimeout(function(){
		savedRange = window.getSelection().getRangeAt(0);
		savedRange = savedRange.cloneRange();
		savedRange.setStartAfter(el);
		savedRange.collapse(true);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(savedRange);
	}, 100);
}

function sendAllFaces(){
	var msg = [];
	for(var i = 0; i < 134; i++){
		//msg += '\\"'+i+']\\",';
		msg.push(['face', i]);
		//msg += '\\"\\\\n\\",';
	}
	return msg;
}

function updateTitle(){
	chrome.windows.getCurrent(function(window){
		if(window.focused){
			newnotice = false;
			document.title = qunInfo.ginfo.name;
		}
		else if(newnotice){
			document.title = '有新消息 - ' + qunInfo.ginfo.name;
		}
	});
}

function getStatus(callback){
	chrome.storage.local.get('qunstatus', function(obj){
		var qunstatus;
		if(!obj.qunstatus){
			qunstatus = new Object;
		}
		else{
			qunstatus = obj.qunstatus;
		}
		if(!qunstatus[HTML5QQ.qq]){
			qunstatus[HTML5QQ.qq] = new Array;
		}
		for(var i=0; i<qunstatus[HTML5QQ.qq].length; i++){
			if(qunstatus[HTML5QQ.qq][i] == qunnum){
				callback(true);
				return;
			}
		}
		callback(false);
		return;
	});
}

function chgStatus(){
	chrome.storage.local.get('qunstatus', function(obj){
		var qunstatus;
		if(!obj.qunstatus){
			qunstatus = new Object;
		}
		else{
			qunstatus = obj.qunstatus;
		}
		if(!qunstatus[HTML5QQ.qq]){
			qunstatus[HTML5QQ.qq] = new Array;
		}
		for(var i=0; i<qunstatus[HTML5QQ.qq].length; i++){
			if(qunstatus[HTML5QQ.qq][i] == qunnum){
				qunstatus[HTML5QQ.qq].splice(i,1);
				chrome.storage.local.set({'qunstatus': qunstatus});
				document.getElementById('showState').style.display = 'none';
				return;
			}
		}
		qunstatus[HTML5QQ.qq].push(qunnum);
		chrome.storage.local.set({'qunstatus': qunstatus});
		document.getElementById('showState').style.display = 'block';
	});
}

chrome.windows.onFocusChanged.addListener(function(wid) {
	updateTitle();
});

window.onclick = function(){
	updateTitle();
	if(!toolFaceOver){
		document.getElementById('facePanel').style.display = 'none';
		document.getElementById('toolFaces').className = 'toolButton';
	}
}

document.getElementById('closeMsgBtn').onclick = function(){
	chrome.extension.sendMessage('cqtab'+uin);
	self.close();
}
