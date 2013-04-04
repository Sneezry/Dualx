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
var toolFaceOver = false;
var picPaths = new Array;
var windowShake;
var windowShakeCount;
var shakable = true;
var preSender;
var preSenderPeeker;
var faceTransferTable = [14, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 50, 51, 96, 53, 54, 73, 74, 75, 76, 77, 78, 55, 56, 57, 58, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 32, 113, 114, 115, 63, 64, 59, 33, 34, 116, 36, 37, 38, 91, 92, 93, 29, 117, 72, 45, 42, 39, 62, 46, 47, 71, 95, 118, 119, 120, 121, 122, 123, 124, 27, 21, 23, 25, 26, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 52, 24, 22, 20, 60, 61, 89, 90, 31, 94, 65, 35, 66, 67, 68, 69, 70, 15, 16, 17, 18, 19, 28, 30, 40, 41, 43, 44, 48, 49];


// short version of get ID
function getID(id) {
	return document.getElementById(id);
}

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::chat:: <'+l+'> '+err);
}

window.onunload = function(){
	chrome.extension.sendMessage('ctab'+uin);
}

window.onresize = function(){
	leftFrameWidth=window.innerWidth-240;
	getID('chatBox').style.height = (window.innerHeight-251)+'px';
	if(sending){
		getID('leftFrame').style.width = leftFrameWidth+'px';
		getID('rightFrame').style.width = '220px';
		getID('rightFrame').style.display = 'block';
	}
	scrollBottom();
}

window.onload = function(){
	chrome.windows.getCurrent(function(window){
		chrome.extension.sendMessage('ftab'+uin+'|'+window.id, function(msg){
			for(var i = 0; i < msg.length; i++){
				if(msg[i].type == 'friend'){
					recieveMsg(msg[i].msg);
				}
				else if(msg[i].type == 'file'){
					recieveFile(msg[i].msg);
				}
			}
		});
	});
	leftFrameWidth=window.innerWidth-240;
	getID('chatBox').style.height = (window.innerHeight-251)+'px';
	getID('leftFrame').style.width = '100%';
	scrollBottom();
	
	localStorage.fontColor=localStorage.fontColor?localStorage.fontColor:'000000';
	getID('inputBox').style.color = '#'+localStorage.fontColor;
	for(var i = 8; i <= 22; i++){
		var el = document.createElement('option');
		el.value = i;
		if(!localStorage.fontSize && 16 == i){
			el.selected = 'selected';
			getID('inputBox').style.fontSize = '16pt';
		}
		else if(localStorage.fontSize && localStorage.fontSize == i){
			el.selected = 'selected';
			getID('inputBox').style.fontSize = (localStorage.fontSize)+'pt';
		}
		el.innerHTML = i;
		getID('fontSize').appendChild(el);
	}
	
	if(localStorage.fontBold == 1){
		fontStyle[0] = 1;
		getID('fontBold').className = 'toolButtonActive';
		getID('inputBox').style.fontWeight = 'bold';
	}
	if(localStorage.fontItalic == 1){
		fontStyle[1] = 1;
		getID('fontItalic').className = 'toolButtonActive';
		getID('inputBox').style.fontStyle = 'italic';
	}
	if(localStorage.fontUnderline == 1){
		fontStyle[2] = 1;
		getID('fontUnderline').className = 'toolButtonActive';
		getID('inputBox').style.textDecoration = 'underline';
	}
	
	for(var i=0; i < 105; i++){
		var el = document.createElement('div');
		el.className = 'faceCube';
		el.setAttribute('mark', i);
		el.onclick = function(){
			insertImg('face', {face: faceTransferTable[this.getAttribute('mark')]});
			getID('facePanel').style.display = 'none';
			getID('toolFaces').className = 'toolButton';
		}
		getID('facePanel').appendChild(el);
		if(i%15 == 14){
			var el = document.createElement('div');
			el.style.clear = 'both';
			getID('facePanel').appendChild(el);
		}
	}
}

function changeStatus(value){
	if(uin == value.uin){
		if(value.client_type==21){
			getID('userHeadImg').setAttribute('state', 'mobile');
			getID('showState').setAttribute('state', 'mobile');
		}
		else if(value.client_type==24){
			getID('userHeadImg').setAttribute('state', 'iphone');
			getID('showState').setAttribute('state', 'iphone');
		}
		else{
			getID('userHeadImg').setAttribute('state', value.status);
			getID('showState').setAttribute('state', value.status);
		}
	}
}

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
						case 'buddies_status_change':{
							changeStatus(request.result[i].value);
							break;
						}
						case 'file_message':{
							var t = new Date();
							var now = t.getTime();
							var url = 'http://d.web2.qq.com/channel/get_file2?lcid='+request.result[i].value.session_id+'&guid='+request.result[i].value.name+'&to='+request.result[i].value.from_uin+'&psessionid='+HTML5QQ.psessionid+'&count=1&time='+now+'&clientid='+HTML5QQ.clientid;
							request.result[i].value.url = url;
							recieveFile(request.result[i].value);
							break;
						}
						case 'push_offfile':{
							var url = 'http://'+request.result[i].value.ip+':'+request.result[i].value.port+'/'+request.result[i].value.name+'?ver=2173&rkey='+request.result[i].value.rkey+'&range=0';
							request.result[i].value.url = url;
							recieveFile(request.result[i].value);
							break;
						}
						case 'shake_message':{
							if(HTML5QQ.status == 'silent' || localStorage.unshake){
								break;
							}
							shake(request.result[i].value);
							break;
						}
					}
				}
			}
		}
	}
	else if(request == 'color'){
		getID('inputBox').style.color = '#'+localStorage.fontColor;
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

function recieveFile(msg){
	if(!msg.name){
		return;
	}
	if(uin == msg.from_uin){
		var today = new Date();
		var hh = today.getHours();
		if(hh<10) hh = '0' + hh;
		var mm = today.getMinutes();
		if(mm<10) mm = '0' + mm;
		var ss = today.getSeconds();
		if(ss<10) ss = '0' + ss;
		
		var el = document.createElement('div');
		el.className = 'noticeTimeComma';
		el.innerHTML = hh+':'+mm+':'+ss;
		getID('chatBox').appendChild(el);
		el = document.createElement('div');
		el.className = 'noticeBody';
		el.innerHTML = '对方给您发送文件 '+msg.name+' [<a href="'+msg.url+'">接收</a>]。';
		getID('chatBox').appendChild(el);
		scrollBottom();
	}
}

function shake(msg){
	if(msg == null || uin == msg.from_uin){
		var today = new Date();
		var hh = today.getHours();
		if(hh<10) hh = '0' + hh;
		var mm = today.getMinutes();
		if(mm<10) mm = '0' + mm;
		var ss = today.getSeconds();
		if(ss<10) ss = '0' + ss;
		
		var el = document.createElement('div');
		el.className = 'noticeTime';
		el.innerHTML = hh+':'+mm+':'+ss;
		getID('chatBox').appendChild(el);
		el = document.createElement('div');
		el.className = 'noticeBody';
		el.innerHTML = (msg?(friendName+'给您'):'您')+'发送了一个窗口抖动。';
		getID('chatBox').appendChild(el);
		scrollBottom();
		chrome.windows.getCurrent(function(window){
			windowShakeCount = 0;
			clearInterval(windowShake);
			windowShake = setInterval(function(){
				shakeWindow(windowShakeCount, window.id, window.left, window.top);
				windowShakeCount += 60;
			},30);
		});
	}
}

function shakeWindow(o, wid, wleft, wtop){
	var rad = Math.PI/180*(o%360);
	var xp = 3*Math.cos(-rad);
	var yp = 3*Math.sin(-rad);
	chrome.windows.update(wid, {
		left: Math.floor(wleft+xp),
		top: Math.floor(wtop+yp),
		focused: true
	});
	if(windowShakeCount >= 360*5){
		clearInterval(windowShake);
	}
}

function formatMsg(msg){
	msg = msg.childNodes;
	if(!msg){
		return;
	}
	var result = '';
	for(var i = 0; i < msg.length; i++){
		if(msg[i].nodeType == 3){
			if(msg[i].nodeValue == '==allfaces=='){
				result += sendAllFaces();
				continue;
			}
			result += '\\"'+msg[i].nodeValue.replace(/\\/g, '\\\\\\\\')+'\\",';
		}
		else if(msg[i].nodeName == 'IMG'){
			if(msg[i].getAttribute('imgtype') == 'offpic'){
				result += '[\\"offpic\\",\\"'+msg[i].getAttribute('filepath')+'\\",\\"'+msg[i].getAttribute('filename')+'\\",'+msg[i].getAttribute('filesize')+'],';
			}
			else{
				result += '[\\"face\\",'+msg[i].getAttribute('face')+'],';
			}
		}
		else{
			if(msg[i].nodeName == 'DIV'){
				result += '\\"\\\\n\\",';
			}
			result += formatMsg(msg[i]);
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
			message += msg[i].replace(/\n/g, '<br />');
		}
		else if(typeof(msg[i]) == 'object'){
			switch(msg[i][0]){
				case 'face':{
					message += '<img src="faces/'+msg[i][1]+'.gif" />';
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
	if(!getID('inputBox').innerHTML){
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
		if(!fqcy[HTML5QQ.qq]['friend'][uin]){
			fqcy[HTML5QQ.qq]['friend'][uin] = 0;
		}
		fqcy[HTML5QQ.qq]['friend'][uin]++;
		chrome.storage.local.set({'fqcy': fqcy});
		console.log(fqcy);
	});
	msg_id++;
	var msg = formatMsg( getID('inputBox') );
	getID('inputBox').innerHTML = '';
	var url = 'http://d.web2.qq.com/channel/send_buddy_msg2';
	var r = '{"to":'+uin+',"face":0,"content":"['+msg+'[\\"font\\",{\\"name\\":\\"'+(localStorage.fontFamily?localStorage.fontFamily:'宋体')+'\\",\\"size\\":\\"'+(localStorage.fontSize?localStorage.fontSize:16)+'\\",\\"style\\":['+fontStyle[0]+','+fontStyle[1]+','+fontStyle[2]+'],\\"color\\":\\"'+localStorage.fontColor+'\\"}]]","msg_id":'+msg_id+',"clientid":"'+HTML5QQ.clientid+'","psessionid":"'+HTML5QQ.psessionid+'"}';
	recieveMsg(JSON.parse(r));
	httpRequest('POST', url, 'r='+r+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid, true, function(result){
		
	});
}

getID('sendMsgBtn').onclick = sendMsg;

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Referer", value: "http://web.qq.com/"});
	details.requestHeaders.push({name: "Origin", value: "http://web.qq.com"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["http://weboffline.ftn.qq.com/*"]},["requestHeaders", "blocking"]);

var uin = location.search.substr(1);
var friendName = '';
var friendLongnick = '';
var HTML5QQ;
var fontStyle = [0, 0, 0];

function recieveMsg(msg){
	var today = new Date();
	var hh = today.getHours();
	if(hh<10) hh = '0' + hh;
	var mm = today.getMinutes();
	if(mm<10) mm = '0' + mm;
	var ss = today.getSeconds();
	if(ss<10) ss = '0' + ss;
	var now = today.getTime();
	
	if(msg.from_uin == uin){
		if(preSenderPeeker){
			clearTimeout(preSenderPeeker);
		}
		preSenderPeeker = setTimeout(function(){preSender = null},10000);
		if(preSender != uin){
			preSender = uin;
			var el = document.createElement('div');
			el.className = 'msgName';
			el.innerHTML = friendName+'&nbsp;&nbsp;'+hh+':'+mm+':'+ss;
			getID('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		getID('chatBox').appendChild(decodeMsg(msg.content, msg.from_uin));
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
			if(!history[HTML5QQ.qq]['friend'][uin]){
				history[HTML5QQ.qq]['friend'][uin] = new Array;
			}
			history[HTML5QQ.qq]['friend'][uin].push({time: now, uin: uin, name: HTML5QQ.info.nick, msg: msg});
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
			getID('chatBox').appendChild(el);
		}
		var el = document.createElement('div');
		getID('chatBox').appendChild(decodeMsg(msg.content, HTML5QQ.qq));
		scrollBottom();
	}
}

function sendRequest(request, callback){
	chrome.extension.sendMessage(request, callback);
}

function httpRequest(method, action, query, urlencoded, callback, timeout){
	var url = "GET" == method ? (query ? action+"?"+querry : action) : action;
	
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
	var state = 'offline';
	for(var i = 0; i < HTML5QQ.onlineList.length; i++){
		if(HTML5QQ.onlineList[i].uin == uin){
			if(HTML5QQ.onlineList[i].client_type==21){
				state = 'mobile';
			}
			else if(HTML5QQ.onlineList[i].client_type==24){
				state = 'iphone';
			}
			else{
				state = HTML5QQ.onlineList[i].status;
			}
			break;
		}
	}
	var el = document.createElement('img');
	el.id = 'userHeadImg'
	el.src = 'http://face'+(parseInt(uin.substr(-1))+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=1&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq;
	el.width = 40;
	el.height = 40;
	el.setAttribute('state', state);
	getID('userHead').appendChild(el);
	el = document.createElement('div');
	el.id = 'showState';
	el.setAttribute('state', state);
	getID('userHead').appendChild(el);
	for(var i = 0; i < HTML5QQ.friendsInfo.marknames.length; i++){
		if(HTML5QQ.friendsInfo.marknames[i].uin == uin){
			friendName = HTML5QQ.friendsInfo.marknames[i].markname;
			break;
		}
	}
	if(!friendName){
		for(var i = 0; i < HTML5QQ.friendsInfo.info.length; i++){
			if(HTML5QQ.friendsInfo.info[i].uin == uin){
				friendName = HTML5QQ.friendsInfo.info[i].nick;
				break;
			}
		}
	}
	for(var i = 0; i < HTML5QQ.personal.length; i++){
		if(HTML5QQ.personal[i].uin == uin){
			friendLongnick = HTML5QQ.personal[i].lnick;
			break;
		}
	}
	if(!friendName){
		friendName = '陌生人('+uin+')';
	}
	document.title = friendName;
	getID('userName').innerHTML = friendName;
	getID('userPersonal').innerHTML = friendLongnick;
	getID('uo_uin').value = HTML5QQ.info.uin;
	getID('uo_skey').value = HTML5QQ.skey;
	getID('uo_peeruin').value = uin;
	getID('uo_vfwebqq').value = HTML5QQ.vfwebqq;
	getID('op_uin').value = HTML5QQ.info.uin;
	getID('op_skey').value = HTML5QQ.skey;
	getID('op_peeruin').value = uin;
	getID('op_vfwebqq').value = HTML5QQ.vfwebqq;
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
			getID('inputBox').style.fontFamily = '宋体';
		}
		else if(localStorage.fontFamily && localStorage.fontFamily == fonts[i].fontId){
			el.selected = 'selected';
			elslc = true;
			getID('inputBox').style.fontFamily = localStorage.fontFamily;
		}
		getID('fontFamily').appendChild(el);
	}
	if(!elslc){
		getID('font_id_0').selected = 'selected';
		getID('inputBox').style.fontFamily = fonts[0].fontId;
	}
});

getID('toolFontStyle').onclick = function(){
	if(getID('toolFontStyleTab').style.display != 'block'){
		getID('toolFontStyleTab').style.display = 'block';
		getID('toolFontStyle').className = 'toolButtonActive';
		leftFrameWidth=window.innerWidth-240;
		getID('chatBox').style.height = (window.innerHeight-279)+'px';
		getID('chatBox').style.marginBottom = '28px';
		scrollBottom();
	}
	else{
		getID('toolFontStyleTab').style.display = 'none';
		getID('toolFontStyle').className = 'toolButton';
		leftFrameWidth=window.innerWidth-240;
		getID('chatBox').style.height = (window.innerHeight-251)+'px';
		getID('chatBox').style.marginBottom = '0';
		scrollBottom();
	}
}

getID('toolFaces').onclick = function(){
	getID('facePanel').style.display = 'block';
	getID('toolFaces').className = 'toolButtonActive';
}

getID('toolFaces').onmouseover = function(){
	toolFaceOver = true;
}

getID('toolFaces').onmouseout = function(){
	toolFaceOver = false;
}

getID('facePanel').onmouseover = function(){
	toolFaceOver = true;
}

getID('facePanel').onmouseout = function(){
	toolFaceOver = false;
}

getID('fontFamily').onchange = function(){
	getID('inputBox').style.fontFamily = this.value;
	localStorage.fontFamily = this.value;
}

getID('fontSize').onchange = function(){
	getID('inputBox').style.fontSize = this.value+'pt';
	localStorage.fontSize = this.value;
}

getID('fontBold').onclick = function(){
	changeStyle(this.id);
}

getID('fontItalic').onclick = function(){
	changeStyle(this.id);
}

getID('fontUnderline').onclick = function(){
	changeStyle(this.id);
}

getID('fontColor').onclick = function(){
	chrome.windows.create({
		url: 'colorpanel.html',
		width: 236,
		height: 260,
		focused: true,
		type: 'popup'
	});
}

getID('toolMsgRec').onclick = function(){
	chrome.windows.create({
		url: 'history.html?friend|'+uin,
		width: 560,
		height: 510,
		focused: true,
		type: 'popup'
	});
}

getID('offline').onmousedown = function(){
	var t = new Date();
	getID('uo_fileid').value = uin+'_'+t.getTime();
	this.form.action = 'http://weboffline.ftn.qq.com/ftn_access/upload_offline_file?time='+t.getTime();
}

getID('offPic').onmousedown = function(){
	var t = new Date();
	getID('op_fileid').value = uin+'_'+t.getTime();
	this.form.action = 'http://weboffline.ftn.qq.com/ftn_access/upload_offline_pic?time='+t.getTime();
}

function uploadProgress(e){
	iBytesUploaded = e.loaded;
	iBytesTotal = e.total;
}

function bytesToSize(bytes) {
	var sizes = ['B', 'KB', 'MB'];
	if (bytes == 0) return 'n/a';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

function uploadFinish(e){
	clearInterval(oTimer);
	getID('fileIco').innerHTML = '';
	getID('leftFrame').style.width = '100%';
	getID('rightFrame').style.display = 'none';
}

function uploadError(e){
	clearInterval(oTimer);
	getID('fileIco').innerHTML = '';
	getID('leftFrame').style.width = '100%';
	getID('rightFrame').style.display = 'none';
}

function uploadAbort(e){
	clearInterval(oTimer);
	getID('fileIco').innerHTML = '';
	getID('leftFrame').style.width = '100%';
	getID('rightFrame').style.display = 'none';
}

function doInnerUpdates(){
	getID('fileProcessBar').style.width = Math.round(iBytesUploaded * 160 / iBytesTotal) + 'px';
	getID('fileSended').innerHTML = bytesToSize(iBytesUploaded)+'/'+bytesToSize(iBytesTotal);
	if(iBytesUploaded == preloaded){
		return;
	}
	var cspeed = Math.round((iBytesUploaded - preloaded)*2);
	if (cspeed > 1024 * 1024) {
		cspeed = (Math.round(cspeed * 100/(1024*1024))/100).toString() + 'MB/S';
	}
	else if (cspeed > 1024) {
		cspeed =  (Math.round(cspeed * 100/1024)/100).toString() + 'KB/S';
	}
	else {
		cspeed = cspeed + 'B/S';
	}
	getID('fileSpeed').innerHTML = '速度:'+cspeed;
	preloaded = iBytesUploaded;
}

getID('offline').onchange = function(){
	var fileName = this.files[0].name;
	sendFile(fileName);
	var vFD = new FormData(this.form);
	oXHR = new XMLHttpRequest();
	oXHR.open('POST', this.form.action);
	oXHR.upload.addEventListener('progress', uploadProgress, false);
	oXHR.addEventListener('load', uploadFinish, false);
	oXHR.addEventListener('error', uploadError, false);
	oXHR.addEventListener('abort', uploadAbort, false);
	oXHR.onreadystatechange = function() {
		if (oXHR.readyState == 4 && oXHR.responseText) {
		  var result = oXHR.responseText.split('(')[1].split(')')[0];
		  result = JSON.parse(result);
		  var r = '{"to":"'+uin+'","file_path":"'+result.filepath+'","filename":"'+result.filename+'","to_uin":"'+uin+'","clientid":"'+HTML5QQ.clientid+'","psessionid":"'+HTML5QQ.psessionid+'"}';
		  httpRequest('POST', 'http://d.web2.qq.com/channel/send_offfile2', 'r='+r+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid, true, function(result){
		  	result = JSON.parse(result);
		  });
		}
	}
	oXHR.send(vFD);
	//this.form.submit();
	this.form.reset();
	oTimer = setInterval(doInnerUpdates, 500);
}

getID('offPic').onchange = function(){
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
		  var result = oXHR.responseText.split('(')[1].split(')')[0];
		  result = JSON.parse(result);
		  var t = new Date();
		  var url = 'http://d.web2.qq.com/channel/apply_offline_pic_dl2?f_uin='+HTML5QQ.qq+'&file_path=%2F'+result.filepath.substr(1)+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'&t='+t.getTime();;
		  httpRequest('GET', url, null, false, function(result2){
		  	result2 = JSON.parse(result2);
		  	if(result2.retcode == 0){
		  		var el = getID('offImg_'+thisLoadingImg);
		  		el.src = result2.result.url;
		  		el.setAttribute('filepath',result.filepath);
					el.setAttribute('filename',result.filename);
					el.setAttribute('filesize',result.filesize);
					picPaths.push([result.filepath, result2.result.url]);
			  }
		  });
		}
	}
	oXHR.send(vFD);
	//this.form.submit();
	this.form.reset();
}

getID('fileCancel').onclick = function(){
	oXHR.abort();
}

function sendImg(img, suffix){
	var t = new Date();
	var fileid = uin+'_'+t.getTime();
	var actionUrl = 'http://weboffline.ftn.qq.com/ftn_access/upload_offline_pic?time='+t.getTime();
	var thisLoadingImg = loadingImg;
	loadingImg++;
	insertImg('offpic', {
		src: 'images/img_loading.gif',
		id: 'offImg_'+thisLoadingImg
	});
	var vFD = new FormData();
	vFD.append('callback', 'parent.EQQ.Model.ChatMsg.callbackSendPic');
	vFD.append('locallangid', '2052');
	vFD.append('clientversion', '1409');
	vFD.append('uin', getID('op_uin').value);
	vFD.append('skey', getID('op_skey').value);
	vFD.append('appid', '1002101');
	vFD.append('peeruin', getID('op_peeruin').value);
	vFD.append('vfwebqq', getID('op_vfwebqq').value);
	vFD.append('file', img, 'pasteImg.'+suffix);
	vFD.append('fileid', fileid);
	vFD.append('senderviplevel', '0');
	vFD.append('reciverviplevel', '0');
	oXHR = new XMLHttpRequest();
	oXHR.open('POST', actionUrl);
	oXHR.onreadystatechange = function() {
		if (oXHR.readyState == 4 && oXHR.responseText) {
		  var result = oXHR.responseText.split('(')[1].split(')')[0];
		  result = JSON.parse(result);
		  var t = new Date();
		  var url = 'http://d.web2.qq.com/channel/apply_offline_pic_dl2?f_uin='+HTML5QQ.qq+'&file_path=%2F'+result.filepath.substr(1)+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'&t='+t.getTime();;
		  httpRequest('GET', url, null, false, function(result2){
		  	result2 = JSON.parse(result2);
		  	if(result2.retcode == 0){
		  		var el = getID('offImg_'+thisLoadingImg);
		  		el.src = result2.result.url;
		  		el.setAttribute('filepath',result.filepath);
					el.setAttribute('filename',result.filename);
					el.setAttribute('filesize',result.filesize);
					picPaths.push([result.filepath, result2.result.url]);
			  }
		  });
		}
	}
	oXHR.send(vFD);
}

function changeStyle(n){
	switch(n){
		case 'fontBold':{
			if(fontStyle[0] == 0){
				fontStyle[0] = 1;
				getID('fontBold').className = 'toolButtonActive';
				getID('inputBox').style.fontWeight = 'bold';
				localStorage.fontBold = 1;
			}
			else{
				fontStyle[0] = 0;
				getID('fontBold').className = 'toolButton';
				getID('inputBox').style.fontWeight = 'normal';
				localStorage.fontBold = 0;
			}
			break;
		}
		case 'fontItalic':{
			if(fontStyle[1] == 0){
				fontStyle[1] = 1;
				getID('fontItalic').className = 'toolButtonActive';
				getID('inputBox').style.fontStyle = 'italic';
				localStorage.fontItalic = 1;
			}
			else{
				fontStyle[1] = 0;
				getID('fontItalic').className = 'toolButton';
				getID('inputBox').style.fontStyle = 'normal';
				localStorage.fontItalic = 0;
			}
			break;
		}
		case 'fontUnderline':{
			if(fontStyle[2] == 0){
				fontStyle[2] = 1;
				getID('fontUnderline').className = 'toolButtonActive';
				getID('inputBox').style.textDecoration = 'underline';
				localStorage.fontUnderline = 1;
			}
			else{
				fontStyle[2] = 0;
				getID('fontUnderline').className = 'toolButton';
				getID('inputBox').style.textDecoration = 'none';
				localStorage.fontUnderline = 0;
			}
			break;
		}
	}
}

function sendFile(fileName){
	sending = true;
	getID('leftFrame').style.width = leftFrameWidth+'px';
	getID('rightFrame').style.width = '220px';
	getID('rightFrame').style.display = 'block';
	getID('fileName').innerHTML = (fileName.length>6?(fileName.substr(0,6)+'...'):fileName);
	getID('fileIco').innerHTML = '';
	var el = document.createElement('img');
	el.src = 'fileico/'+fileName.split('.')[fileName.split('.').length-1]+'.png';
	el.onerror = function(){
		this.src = 'fileico/_page.png';
	}
	getID('fileIco').appendChild(el);
}

function unshakable(){
	var today = new Date();
	var hh = today.getHours();
	if(hh<10) hh = '0' + hh;
	var mm = today.getMinutes();
	if(mm<10) mm = '0' + mm;
	var ss = today.getSeconds();
	if(ss<10) ss = '0' + ss;
	
	var el = document.createElement('div');
	el.className = 'noticeTimeComma';
	el.innerHTML = hh+':'+mm+':'+ss;
	getID('chatBox').appendChild(el);
	el = document.createElement('div');
	el.className = 'noticeBody';
	el.innerHTML = '您发送窗口抖动过于频繁，请稍后再发。';
	getID('chatBox').appendChild(el);
	scrollBottom();
}

function scrollBottom(){
	var div = getID('chatBox');
	div.scrollTop = div.scrollHeight;
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 200);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 500);
	setTimeout(function(){div.scrollTop = div.scrollHeight}, 1000);
}

function sendShake(){
	if(!shakable){
		unshakable();
		return;
	}
	shakable = false;
	setTimeout(function(){shakable = true}, 10000);
	shake();
	getID('shakeSound').play();
	var t = new Date();
	var url = 'http://d.web2.qq.com/channel/shake2?to_uin='+uin+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid+'&t='+t.getTime();
	httpRequest('GET', url, null, false);
}

getID('toolShake').onclick = sendShake;

var sendFileList = false;

getID('sendFile').onmouseover = function(){
	sendFileList = true;
}

getID('sendFile').onmouseout = function(){
	sendFileList = false;
}

getID('sendFile').onclick = function(){
	getID('sendFileList').style.display = 'block';
}

getID('inputBox').onpaste = function(e){
	var items = e.clipboardData&&e.clipboardData.items;
	for(var i = 0; i < items.length; i++){
		if(items[i].kind == 'file'){
			var img = items[i].getAsFile();
			sendImg(img, items[i].type.split('/')[1]);
			return false;
		}
	}
}

getID('inputBox').onkeydown = function(){
	if((event.ctrlKey && localStorage.ctrl || !event.ctrlKey && !localStorage.ctrl) && event.keyCode==13){
		sendMsg();
		return false;
	}
}

getID('inputBox').onkeyup = function(){
	savedRange = window.getSelection().getRangeAt(0);
}

getID('inputBox').onmouseup = function(){
	savedRange = window.getSelection().getRangeAt(0);
}

getID('toolBar').onclick = restoreSelection;

function restoreSelection(){
	getID('inputBox').focus();
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
		getID('inputBox').appendChild(el);
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
	var msg = '';
	for(var i = 0; i < 134; i++){
		//msg += '\\"'+i+']\\",';
		msg += '[\\"face\\", '+i+'],';
		//msg += '\\"\\\\n\\",';
	}
	return msg;
}

window.onclick = function(){
	if(!sendFileList){
		getID('sendFileList').style.display = 'none';
	}
	if(!toolFaceOver){
		getID('facePanel').style.display = 'none';
		getID('toolFaces').className = 'toolButton';
	}
}

getID('closeMsgBtn').onclick = function(){
	chrome.extension.sendMessage('ctab'+uin);
	self.close();
}
