/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

var gAccount;
var gPassword;
var gState;
var msgIds = new Array;
var reloading = false;
var debugLog = "\n\n\n\nLogs:\n\n";
var debugLogId = 0;

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Origin", value: "http://d.web2.qq.com"});
	details.requestHeaders.push({name: "Referer", value: "http://d.web2.qq.com/proxy.html?v=20110412001&callback=1&id=1"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["http://s.web2.qq.com/api/*"]},["requestHeaders", "blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Origin", value: "http://d.web2.qq.com"});
	details.requestHeaders.push({name: "Referer", value: "http://d.web2.qq.com/proxy.html?v=20130916001&callback=1&id=2"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["https://d.web2.qq.com/channel/*", "http://d.web2.qq.com/channel/*"]},["requestHeaders", "blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Origin", value: "http://d.web2.qq.com"});
	details.requestHeaders.push({name: "Referer", value: "http://d.web2.qq.com/proxy.html?v=20110412001&callback=1&id=3"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["http://web.qq.com/cgi-bin/*"]},["requestHeaders", "blocking"]);

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Referer", value: "http://web.qq.com/"});
	details.requestHeaders.push({name: "Origin", value: "http://web.qq.com"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["http://weboffline.ftn.qq.com/*", "http://up.web2.qq.com/*"]},["requestHeaders", "blocking"]);

chrome.extension.onMessage.addListener(function(request, sender, callback) {
	if(request == 'hello'){
		callback(HTML5QQ);
	}
	else if(typeof(request) == 'string' && request.substr(0,5) == 'login'){
		var loginInfo = request.split(';');
		gAccount = decodeURIComponent(loginInfo[1]);
		gPassword = decodeURIComponent(loginInfo[2]);
		gState = decodeURIComponent(loginInfo[3]);
		HTML5QQ.getsig(gAccount);
	}
	else if(typeof(request) == 'string' && request.substr(0,6) == 'verify'){
		var verifyInfo = request.split(';');
		HTML5QQ.verifyCode = verifyInfo[1];
		HTML5QQ.login(gPassword, gState);
	}
	else if(typeof(request) == 'string' && request.substr(0,5) == 'state'){
		HTML5QQ.changeStatus(request.substr(5));
	}
	else if(typeof(request) == 'string' && request.substr(0,5) == 'lnick'){
		HTML5QQ.setLnick(request.substr(5));
	}
});

var HTML5QQ = {
	debug: true,
	
	clientid: Math.floor(Math.random()*89999999)+10000000,
	
	verifyCode: null,
	
	qq: null,
	
	uin: null,
	
	status: null,
	
	levelInfo: null,
	
	psessionid: null,
	
	vfwebqq: null,
	
	skey: null,
	
	md5: md5,
	
	face: null,
	
	info: null,
	
	friendsInfo: null,
	
	groupsInfo: null,
	
	onlineList: null,
	
	personal: null,
	
	myPersonal: null,
	
	recentList: null,

	sig: null,
	
	httpRequest: function(method, action, query, urlencoded, callback, timeout){
		var url = "GET" == method ? (query ? action+"?"+query : action) : action;
		var timecounter;
		
		if(this.debug){
			this.outputDebug("httpRequest: method("+method+") action("+action+") query("+query+") urlencoded("+(urlencoded?1:0)+")");
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open(method, url, true);
		if("POST" == method && urlencoded){
			xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		}
		xhr.onreadystatechange = function() {
		  if (xhr.readyState == 4) {
		  	if(timecounter){
		  		clearTimeout(timecounter);
		  	}
		  	if(this.debug){
		  		this.outputDebug(xhr.responseText);
		  	}
		  	if(callback){
		    	callback(xhr.responseText);
		    }
		  }
		}
		xhr.addEventListener('error', function(){callback(-1)}, false);
		xhr.addEventListener('abort', function(){callback(-2)}, false);
		if("POST" == method && query){
			xhr.send(query);
		}
		else{
			xhr.send();
		}
		if(timeout){
			timecounter = setTimeout(function(){
				if(xhr.readyState != 4){
					xhr.abort();
				}
			}, timeout);
		}
	},
	
	createJs: function(src, callback){
		if(this.debug){
		  this.outputDebug("createJs: src("+src+")");
		}
		this.httpRequest("GET", src, null, false, callback);
	},
	
	outputDebug: function(info){
		debugLog += debugLogId+"] "+info+"\n\n";
		debugLogId++;
		console.log('Debug -> '+info);
	},
	
	getCookie: function(url, name, callback){
		if(this.debug){
		  this.outputDebug("getCookie: url("+url+") name("+name+")");
		}
		chrome.cookies.get({name: name, url: url}, callback);
	},
	
	setCookie: function(url, name, value, callback){
		this.getCookie(url, name, function(cookie){
			cookie.value = value;
			chrome.cookies.set(cookie, callback);
			if(this.debug){
		  	this.outputDebug("setCookie: url("+url+") name("+name+") value("+value+")");
			}
		});
	},
	
	getVerifyCode: function(qq){
		if(!qq)return;
		if(this.debug){
		  this.outputDebug("getVerifyCode: qq("+qq+")");
		}
		this.qq = qq;
		this.createJs("https://ssl.ptlogin2.qq.com/check?uin="+qq+"&appid=501004106&r="+Math.random(),function(code){
			var query = code.split("('")[1].split("')")[0].split("','");
			HTML5QQ.checkVerifyCode(query[0], query[1], query[2]);
		});
	},
	
	errorMsg: function(message){
		localStorage.logout = 'true';
		alert(message);
		chrome.extension.sendMessage('cancel');
	},
	
	checkVerifyCode: function(stateCode, verifyCode, uin){
		var i, temp = [];
		for(i=2; i<uin.length; i+=4){
			temp.push(uin.substr(i, 2));
		}
		temp = temp.join("");
		uin = this.hexChar2Bin(temp);
		if(this.debug){
		  this.outputDebug("checkVerifyCode: stateCode("+stateCode+") verifyCode("+verifyCode+") uin(*HEX DATA*)");
		}
		if("0" == stateCode){
			this.uin = uin;
			this.verifyCode = verifyCode;
			HTML5QQ.login(gPassword, gState);
		}
		else if("1" == stateCode){
			this.uin = uin;
			this.getVerifyCodeImg(verifyCode);
		}
	},
	
	getVerifyCodeImg: function(verifyCode){
		chrome.windows.create({
			url: 'verify.html?'+this.qq+'&'+verifyCode,
			width: 140+parseInt(localStorage.widthoffset),
			height: 110+parseInt(localStorage.heightoffset),
			focused: true,
			type: 'popup'
		});
	},
	
	encodePassord: function(password){
		try{
			password = decodeURIComponent(password);
		}
		catch(e){}
		if(password.substr(0, 1) != String.fromCharCode(16)){
			password = password.substr(0,16);
			this.password = this.md5(password);
			this.encodedPassword = this.md5(this.md5(this.hexChar2Bin(this.password)+this.uin)+this.verifyCode.toUpperCase());
			if(localStorage.password){
				localStorage.password = String.fromCharCode(16) + this.md5(this.hexChar2Bin(this.password)+this.uin);
			}
		}
		else{
			this.encodedPassword = this.md5(password.substr(1)+this.verifyCode.toUpperCase());
		}
		if(this.debug){
		  //this.outputDebug("encodePassord: password("+this.password+") encodedPassword("+this.encodedPassword+"[md5(md5("+this.hexChar2Bin(this.password)+"+"+this.uin2Hex(this.qq)+")+"+this.verifyCode.toUpperCase()+")])");
		  this.outputDebug("encodePassord: encodedPassword("+this.encodedPassword+")");
		}
	},
	
	hexChar2Bin: function(str) {
		var arr = "", temp = "";
		for (var i = 0; i < str.length; i = i + 2) {
			temp = str.substr(i, 2);
			temp = parseInt(temp, 16);
			arr += String.fromCharCode(temp);
		}
		return arr;
	},
	
	uin2Hex: function(uin) {
		var maxLength = 16;
		uin = parseInt(uin);
		var hex = uin.toString(16);
		var len = hex.length;
		for (var i = len; i < maxLength; i++) {
			hex = "0" + hex;
		}
		var arr = "", temp = "";
		for (var j = 0; j < maxLength; j += 2) {
			temp = hex.substr(j, 2);
			temp = parseInt(temp, 16);
			arr += String.fromCharCode(temp);
		}
		return arr;
	},

	getsig: function(gAccount){
		var url = 'https://ui.ptlogin2.qq.com/cgi-bin/login?daid=164&target=self&style=16&mibao_css=m_webqq&appid=501004106&enable_qlogin=0&no_verifyimg=1&s_url=http%3A%2F%2Fw.qq.com%2Fproxy.html&f_url=loginerroralert&strong_login=1&login_state=10&t=20131024001&r='+Math.random();
		this.httpRequest('GET', url, null, false, function(result){
			HTML5QQ.sig = encodeURIComponent(result.split('g_login_sig=encodeURIComponent("')[1].split('");')[0]);
			if(HTML5QQ.debug){
		  		HTML5QQ.outputDebug("sig: "+HTML5QQ.sig);
			}
			HTML5QQ.getVerifyCode(gAccount);
		});
	},
	
	login: function(password, status){
		if(!this.qq)return;
		if(this.debug){
		  this.outputDebug("login: password(******)");
		}
		this.encodePassord(password);
		this.createJs("https://ssl.ptlogin2.qq.com/login?u="+this.qq+"&p="+this.encodedPassword+"&verifycode="+this.verifyCode.toUpperCase()+"&webqq_type=10&remember_uin=1&login2qq=1&aid=501004106&u1=http%3A%2F%2Fw.qq.com%2Fproxy.html%3Flogin2qq%3D1%26webqq_type%3D10&h=1&ptredirect=0&ptlang=2052&daid=164&from_ui=1&pttype=1&dumy=&fp=loginerroralert&action=0-42-19466&mibao_css=m_webqq&t=1&g=1&js_type=0&js_ver=10063&login_sig="+this.sig, function(code){
            if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("login: code("+code+")");
			}
			if(code.indexOf("登录成功") != -1){
				var jmp = code.split(',')[2];
				jmp = jmp.replace(/(^\s*)|(\s*$)/g, "");
				jmp = jmp.substr(1,jmp.length-2);
				HTML5QQ.httpRequest('GET', jmp, null, false, function(result){
					HTML5QQ.getCookie("http://qq.com", "skey", function(cookie){
						HTML5QQ.skey = cookie.value;
						if(HTML5QQ.debug){
			 				HTML5QQ.outputDebug("login: skey("+HTML5QQ.skey+")");
						}
					});
					HTML5QQ.getCookie("http://qq.com", "ptwebqq", function(cookie){
						HTML5QQ.getVfwebqq(cookie.value, status);
						if(HTML5QQ.debug){
			 				HTML5QQ.outputDebug("login: ptwebqq("+HTML5QQ.ptwebqq+")");
						}
					});
					HTML5QQ.getCookie("http://qq.com", "uin", function(cookie){
						HTML5QQ.qq = parseInt(cookie.value.substr(1));
						if(HTML5QQ.debug){
			 				HTML5QQ.outputDebug("login: uin("+cookie.value+")");
						}
					});
				});
			}
			else{
				HTML5QQ.errorMsg(code.split(',')[4].substr(1, code.split(',')[4].length-2));
			}
		});
	},

	getVfwebqq: function(ptwebqq, status){
		var url = 'http://s.web2.qq.com/api/getvfwebqq?ptwebqq='+ptwebqq+'&clientid='+this.clientid+'&psessionid=&t='+this.now();
		this.httpRequest('GET', url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.vfwebqq = result.vfwebqq;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getVfwebqq: vfwebqq("+HTML5QQ.vfwebqq+")");
			}
			HTML5QQ.getPsessionid(ptwebqq, status);
		});
	},
	
	getPsessionid: function(ptwebqq, status){
		this.ptwebqq = ptwebqq;
		
		var r = '{"ptwebqq":"'+this.ptwebqq+'","clientid":'+this.clientid+',"psessionid":"","status":"'+status+'"}';
		if(HTML5QQ.debug){
		 	HTML5QQ.outputDebug("getPsessionid: r("+r+")");
		}
		this.httpRequest('POST', 'https://d.web2.qq.com/channel/login2', 'r='+r, true, function(result){
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getPsessionid: result("+result+")");
			}
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.vfwebqq = result.vfwebqq;
			HTML5QQ.psessionid = result.psessionid;
			HTML5QQ.status = result.status;
			if(HTML5QQ.debug){
				HTML5QQ.outputDebug("vfwebqq("+HTML5QQ.vfwebqq+") psessionid("+HTML5QQ.psessionid+")");
			}
			HTML5QQ.getMyInfo();
		});
	},
	
	now: function(){
		var t = new Date();
		return t.getTime();
	},
	
	getMyInfo: function(){
		var face = 'http://face'+Math.ceil(Math.random()*10)+'.qun.qq.com/cgi/svr/face/getface?cache=1&type=1&fid=0&uin='+this.qq+'&vfwebqq='+this.ptwebqq+'&t='+this.now();
		if(HTML5QQ.debug){
		 	HTML5QQ.outputDebug("getMyInfo: face("+face+")");
		}
		this.face = face;
		var info = 'http://s.web2.qq.com/api/get_friend_info2?tuin='+this.qq+'&verifysession=&code=&vfwebqq='+this.vfwebqq+'&t='+this.now();
		this.httpRequest('GET', info, null, false, function(result){
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getMyInfo: result("+result+")");
			}
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.info = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getMyInfo: info("+JSON.stringify(HTML5QQ.info)+")");
			}
			HTML5QQ.getMyLevel();
		});
	},
	
	getMyLevel: function(){
		var url = 'http://s.web2.qq.com/api/get_qq_level2?tuin='+this.qq+'&vfwebqq='+this.vfwebqq+'&t='+this.now();
		this.httpRequest("GET", url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.levelInfo = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getMyLevel: levelInfo("+JSON.stringify(HTML5QQ.levelInfo)+")");
			}
			HTML5QQ.getMyPersonal();
		});
	},
	
	getMyPersonal: function(){
		var url = 'http://s.web2.qq.com/api/get_single_long_nick2?tuin='+this.qq+'&vfwebqq='+this.vfwebqq+'&t='+this.now();
		this.httpRequest("GET", url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result[0].lnick;
			HTML5QQ.myPersonal = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getMyPersonal: myPersonal("+JSON.stringify(HTML5QQ.myPersonal)+")");
			}
			HTML5QQ.getFriendsInfo();
		});
	},
	
	hash: function(uin, ptwebqq) {
		x = uin;
        H = ptwebqq;
        x += "";
		for (var N = [], T = 0; T < H.length; T++) N[T % 4] ^= H.charCodeAt(T);
		var U = ["EC", "OK"],
		V = [];
		V[0] = x >> 24 & 255 ^ U[0].charCodeAt(0);
		V[1] = x >> 16 & 255 ^ U[0].charCodeAt(1);
		V[2] = x >> 8 & 255 ^ U[1].charCodeAt(0);
		V[3] = x & 255 ^ U[1].charCodeAt(1);
		U = [];
		for (T = 0; T < 8; T++) U[T] = T % 2 == 0 ? N[T >> 1] : V[T >> 1];
		N = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
		V = "";
		for (T = 0; T < U.length; T++) {
		    V += N[U[T] >> 4 & 15];
		    V += N[U[T] & 15]
		}
		return V;
    },

	getFriendsInfo: function(){
		var info = 'http://s.web2.qq.com/api/get_user_friends2';
		var r = '{"vfwebqq":"'+this.vfwebqq+'","hash":"'+this.hash(this.qq+'',this.ptwebqq)+'"}';
		this.httpRequest('POST', info, 'r='+r, true, function(result){
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getFriendsInfo: result("+result+")");
			}
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.friendsInfo = {};
			HTML5QQ.friendsInfo.categories = result.categories;
			if(HTML5QQ.friendsInfo.categories.length == 0 || HTML5QQ.friendsInfo.categories[0].index != 0){
				HTML5QQ.friendsInfo.categories.unshift({index: 0, name: '我的好友', sort: 0});
			}
			
			categories = {}
			for (var i = 0; i < HTML5QQ.friendsInfo.categories.length; i++) {
				index = HTML5QQ.friendsInfo.categories[i].index;
				HTML5QQ.friendsInfo.categories[i].friends = [];
				categories[index] = HTML5QQ.friendsInfo.categories[i];
			}
			
			HTML5QQ.friendsInfo.friends = {}
			for (var i = 0; i < result.friends.length; i++) {
				category = result.friends[i].categories;
				uin = result.friends[i].uin;
				
				HTML5QQ.friendsInfo.friends[uin] = {};
				HTML5QQ.friendsInfo.friends[uin].category = category;
				HTML5QQ.friendsInfo.friends[uin].flag = result.friends[i].flag;
				categories[category].friends.push(uin);
			}
			
			for (var i = 0; i < result.info.length; i++) {
				uin = result.info[i].uin;
				
				if (uin in HTML5QQ.friendsInfo.friends) {
					HTML5QQ.friendsInfo.friends[uin].face = result.info[i].face;
					HTML5QQ.friendsInfo.friends[uin].nick = result.info[i].nick;
					HTML5QQ.friendsInfo.friends[uin].face_flag = result.info[i].flag;
				}
			}
			
			for (var i = 0; i < result.marknames.length; i++) {
				uin = result.marknames[i].uin;
				if (uin in HTML5QQ.friendsInfo.friends) {
					HTML5QQ.friendsInfo.friends[uin].markname = result.marknames[i].markname;
					HTML5QQ.friendsInfo.friends[uin].markname_type = result.marknames[i].type;
				}
			}
			
			for (var i = 0; i < result.vipinfo.length; i++) {
				uin = result.vipinfo[i].u;
				if (uin in HTML5QQ.friendsInfo.friends) {
					HTML5QQ.friendsInfo.friends[uin].is_vip = result.vipinfo[i].is_vip;
					HTML5QQ.friendsInfo.friends[uin].vip_level = result.vipinfo[i].vip_level;
				}
			}
			
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getFriendsInfo: friendsInfo("+JSON.stringify(HTML5QQ.friendsInfo)+")");
			}
			HTML5QQ.getGroupsInfo();
		});
	},
	
	getGroupsInfo: function(){
		var info = 'http://s.web2.qq.com/api/get_group_name_list_mask2';
		var r = '{"vfwebqq":"'+this.vfwebqq+'"}';
		this.httpRequest('POST', info, 'r='+r, true, function(result){
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getGroupsInfo: result("+result+")");
			}
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.groupsInfo = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getGroupsInfo: groupsInfo("+JSON.stringify(HTML5QQ.groupsInfo)+")");
			}
			HTML5QQ.getOnlineList();
		});
	},
	
	getOnlineList: function(){
		var url = 'http://d.web2.qq.com/channel/get_online_buddies2?clientid='+this.clientid+'&psessionid='+HTML5QQ.psessionid;
		this.httpRequest("GET", url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.onlineList = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getOnlineList: onlineList("+JSON.stringify(HTML5QQ.onlineList)+")");
			}
			HTML5QQ.getPersonal();
		});
	},
	
	getPersonal: function(){
		if(this.onlineList.length == 0){
			HTML5QQ.personal = new Array;
			HTML5QQ.getRecentList();
			return;
		}
		var list = new Array;
		for(var i = 0; i < this.onlineList.length; i++){
			list.push(this.onlineList[i].uin);
		}
		var url = 'http://s.web2.qq.com/api/get_long_nick?tuin='+encodeURIComponent('['+list.join(',')+']')+'&vfwebqq='+this.vfwebqq+'&t='+this.now();
		this.httpRequest("GET", url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.personal = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getPersonal: personal("+JSON.stringify(HTML5QQ.personal)+")");
			}
			HTML5QQ.getRecentList();
		});
	},
	
	getRecentList: function(){
		var url = 'http://d.web2.qq.com/channel/get_recent_list2';
		var r = '{"vfwebqq":"'+HTML5QQ.vfwebqq+'","clientid":"'+HTML5QQ.clientid+'","psessionid":"'+HTML5QQ.psessionid+'"}';
		this.httpRequest("POST", url, 'r='+r+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid, true, function(result){
			result = JSON.parse(result);
			result = result.result;
			HTML5QQ.recentList = result;
			if(HTML5QQ.debug){
		 		HTML5QQ.outputDebug("getRecentList: recentList("+JSON.stringify(HTML5QQ.recentList)+")");
			}
			HTML5QQ.poll();
			HTML5QQ.finish();
		});
	},
	
	getAccount: function(uin, callback){
		var url = 'http://s.web2.qq.com/api/get_friend_uin2?tuin='+uin+'&verifysession=&type=1&code=&vfwebqq='+this.vfwebqq+'&t='+this.now();
		this.httpRequest("GET", url, null, false, function(result){
			result = JSON.parse(result);
			result = result.result;
			if(result && result.account){
				callback(result.account);
			}
			else{
				callback(null);
			}
		});
	},
	
	poll: function(){
		var url = 'http://d.web2.qq.com/channel/poll2';
		var r = '{"clientid":"'+HTML5QQ.clientid+'","psessionid":"'+HTML5QQ.psessionid+'","key":0,"ids":[]}';
		this.httpRequest("POST", url, 'r='+r+'&clientid='+HTML5QQ.clientid+'&psessionid='+HTML5QQ.psessionid, true, function(result){
			if(result){
				HTML5QQ.poll();
				try{
					result = JSON.parse(result);
					switch(result.retcode){
						case 0:{
							for(var i = 0; i < result.result.length; i++){
								switch(result.result[i].poll_type){
									case 'buddies_status_change':{
										HTML5QQ.updateOnlineList(result.result[i].value);
										break;
									}
									case 'message':{
										if(msgIds.indexOf(result.result[i].value.msg_id) == -1){
											msgIds.push(result.result[i].value.msg_id);
										}
										else{
											result.result[i].poll_type = 'void_message';
										}
										break;
									}
								}
							}
							break;
						}
						case 121:{
							if(reloading){
								return;
							}
							reloading = true;
							localStorage.logout = 'true';
							chrome.extension.sendMessage('cancel');
							alert("您的账号在另一地点登陆，您被迫下线。\n\n如果这不是您本人的操作，那么您的密码很可\n能已经泄露。建议您修改密码。");
							location.reload();
							break;
						}
						/*
						case 116:{
							HTML5QQ.setCookie("http://qq.com", "ptwebqq", result.p, function(cookie){});
						}
						*/
					}
					chrome.extension.sendMessage(result);
				}
				catch(e){
					console.log(result);
				}
			}
			else{
				return;
			}
		}, 90000);
	},
	
	finish: function(){
		chrome.extension.sendMessage('finish');
	},
	
	updateOnlineList: function(value){
		var fd = 0;
		for(var i = 0; i < this.onlineList.length; i++){
			if(this.onlineList[i].uin == value.uin){
				fd = 1;
				if(value.status == 'offline'){
					this.onlineList.splice(i, 1);
				}
				else{
					this.onlineList[i] = value;
				}
			}
		}
		if(!fd && value.status != 'offline'){
			this.onlineList.push(value);
			if(this.status != 'silent' && !localStorage.unsound){
				document.getElementById('globalSound').play();
			}
		}
	},
	
	changeStatus: function(status){
		this.status = status;
		var url= 'http://d.web2.qq.com/channel/change_status2?newstatus='+status+'&clientid='+this.clientid+'&psessionid='+this.psessionid+'&t='+this.now();
		this.httpRequest('GET', url, null, false);
	},
	
	setLnick: function(lnick){
		this.myPersonal = lnick;
		var url = 'http://s.web2.qq.com/api/set_long_nick2';
		var r = '{"nlk":"'+lnick+'","vfwebqq":"'+HTML5QQ.vfwebqq+'"}'
		this.httpRequest('POST', url, 'r='+r, true);
	},

	logout: function(){
		var url = 'http://d.web2.qq.com/channel/logout2?ids=&clientid='+this.clientid+'&psessionid='+this.psessionid+'&t='+this.now();
		this.httpRequest('GET', url, null, false, function(r){
			location.reload();
		});
	}
}
