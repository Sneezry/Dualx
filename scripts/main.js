var catTransfer = new Array;
var botList = new Array('youdaodic', 'weather', 'xiami');

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::main:: <'+l+'> '+err);
}

window.onunload = function(){
	chrome.extension.sendMessage('closemain');
}

window.onresize = function(){
	document.getElementById('list').style.height = (window.innerHeight-224)+'px';
}

window.onload = function(){
	document.getElementById('list').style.height = (window.innerHeight-224)+'px';
	var stateList = document.getElementsByName('stateList');
	for(var i = 0; i < stateList.length; i++){
		stateList[i].onclick = function(){
			if(this.getAttribute('state') == 'offline'){
				chrome.extension.sendMessage('logout');
			}
			else{
				chrome.extension.sendMessage('state'+this.getAttribute('state'));
			}
			document.getElementById('stateIco').className = 'state_'+this.getAttribute('state');
			document.getElementById('stateIco').title = '当前状态 '+this.getAttribute('cnstate');
			showStateList = false;
			document.getElementById('stateList').style.display = 'none';
		}
	}
}

((function(){
	if(localStorage.mainstyle && !localStorage.popupmain){
		var el = document.createElement('style');
		el.type = 'text/css';
		el.innerHTML = localStorage.mainstyle;
		document.getElementsByTagName('head')[0].appendChild(el);
	}
})())

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
	for(var i = 0; i<details.requestHeaders.length; i++){
		if (details.requestHeaders[i].name == "Referer" || details.requestHeaders[i].name == "Origin") {  
			details.requestHeaders.splice(i, 1);
		}
	}
	details.requestHeaders.push({name: "Referer", value: "http://web.qq.com/"});
	return {requestHeaders: details.requestHeaders};
},{urls: ["http://*.qun.qq.com/*"]},["requestHeaders", "blocking"]);

chrome.extension.onMessage.addListener(function(request, sender) {
	if(typeof(request) == 'object'){
		console.log(request);
		switch(request.retcode){
			case 0:{
				for(var i = 0; i < request.result.length; i++){
					switch(request.result[i].poll_type){
						case 'buddies_status_change':{
							changeStatus(request.result[i].value);
							break;
						}
					}
				}
			}
		}
	}
	else if(typeof(request) == 'string' && request.substr(0, 15) == 'shakeFriendHead'){
		chrome.extension.sendMessage('newmsg', flashGroup);
		document.getElementById('friendHead_'+request.substr(15)).style.WebkitAnimation = 'shake 0.5s infinite cubic-bezier(1,0,0,1)';
	}
	else if(typeof(request) == 'string' && request.substr(0, 12) == 'shakeQunHead'){
		document.getElementById('qunHead_'+request.substr(12)).style.WebkitAnimation = 'shake 0.5s infinite cubic-bezier(1,0,0,1)';
	}
	else if(typeof(request) == 'string' && request.substr(0, 4) == 'otab'){
		clearFlash(request.substr(4));
	}
	else if(typeof(request) == 'string' && request.substr(0, 5) == 'oqtab'){
		clearQun(request.substr(5));
	}
	else if(request == 'logout' || request == 'cancel'){
		self.close();
	}
});

var selectedList = 'friends';

var HTML5QQ;

var showStateList = false;

document.getElementById('userState').onmouseover = function(){
	showStateList = true;
}

document.getElementById('userState').onmouseout = function(){
	showStateList = false;
}

document.getElementById('userState').onclick = function(){
	document.getElementById('stateList').style.display = 'block';
}

document.getElementById('friendsListTab').onclick = function(){
	clickTag(this);
}
document.getElementById('qunListTab').onclick = function(){
	clickTag(this);
}
document.getElementById('recentListTab').onclick = function(){
	clickTag(this);
}
document.getElementById('searchBar').onkeyup = function(){
	searchFriends(this.value);
}
document.getElementById('searchBar').onkeydown = function(){
	if(event.keyCode==13 && this.value=='debug'){
		chrome.extension.sendMessage('showlog');
	}
}
document.getElementById('searchBar').onfocus = function(){
	searchFriends(this.value);
}
document.getElementById('searchBar').onblur = function(){
	setTimeout(function(){
		document.getElementById('searchListBorder').style.display = 'none';
	}, 300);
}

document.getElementById('userLnick').onclick = function(){
	document.getElementById('userLnick').style.display = 'none';
	document.getElementById('setLnick').style.display = 'block';
	document.getElementById('setLnick').select();
}

document.getElementById('setLnick').onblur = function(){
	chrome.extension.sendMessage('lnick'+this.value);
	document.getElementById('userMotto').title = this.value;
	document.getElementById('userLnick').innerHTML = this.value.length>40?this.value.substr(0, 37)+'...':this.value;
	document.getElementById('setLnick').style.display = 'none';
	document.getElementById('userLnick').style.display = 'block';
}

document.getElementById('settings').onclick = function(){
	window.open('settings.html', '_blank');
}

document.getElementById('logout').onclick = function(){
	chrome.extension.sendMessage('logout');
}

function sendRequest(request, callback){
	chrome.extension.sendMessage(request, callback);
}

function chgGroupState(groupId){
	if(groupstate[groupId] == 'closed'){
		groupstate[groupId] = 'open';
		document.getElementById('group_'+groupId).className = 'groupNameOpen';
		groupOpen(document.getElementById('friendDetail_'+groupId));
		//document.getElementById('friendDetail_'+groupId).style.display = 'block';
	}
	else{
		groupstate[groupId] = 'closed';
		document.getElementById('group_'+groupId).className = 'groupName';
		document.getElementById('friendDetail_'+groupId).style.display = 'none';
	}
}

function slideIn(el){
	el.className = 'slideIn';
	el.style.display = 'block';
	setTimeout(function(){el.className = ''}, 200);
}

function slideOut(el){
	el.className = 'slideOut';
	setTimeout(function(){el.style.display = 'none';el.className = ''}, 200);
}

function groupOpen(el){
	el.className = 'groupOpen';
	el.style.display = 'block';
	setTimeout(function(){el.className = ''}, 200);
}

function clickTag(el){
	var list = el.getAttribute('list');
	if(list == selectedList){
		return;
	}
	document.getElementById('friendsListTab').setAttribute('active', 'false');
	document.getElementById('friendsListTabBg').className = 'tabs';
	document.getElementById('qunListTab').setAttribute('active', 'false');
	document.getElementById('qunListTabBg').className = 'tabs';
	document.getElementById('recentListTab').setAttribute('active', 'false');
	document.getElementById('recentListTabBg').className = 'tabs';
	document.getElementById(list+'ListTab').setAttribute('active', 'true');
	document.getElementById(list+'ListTabBg').className = 'tabactive';
	slideOut(document.getElementById(selectedList+'List'));
	setTimeout(function(){
		selectedList = list;
		slideIn(document.getElementById(selectedList+'List'));
	}, 200);
}

function selectFriend(el){
	var friends = document.getElementsByClassName('friendDetail');
	for(var i = 0; i < friends.length; i++){
		friends[i].setAttribute('selected', 'false');
	}
	el.setAttribute('selected', 'true');
}

function selectQun(el){
	var qun = document.getElementsByClassName('qunDetail');
	for(var i = 0; i < qun.length; i++){
		qun[i].setAttribute('selected', 'false');
	}
	el.setAttribute('selected', 'true');
}

function selectRecent(el){
	var qun = document.getElementsByClassName('recentDetail');
	for(var i = 0; i < qun.length; i++){
		qun[i].setAttribute('selected', 'false');
	}
	el.setAttribute('selected', 'true');
}

function getSearch(uin){
	var friend = HTML5QQ.friendsInfo.friends[uin];
	friend.searchKw.push(friend.markname);
	friend.searchKw.push(friend.nick);
	var marknamepy = chg2py(friend.markname);
	var nickpy = chg2py(friend.nick);
	if(marknamepy){
		for(var i = 0; i < marknamepy.length; i++){
			friend.searchKw.push(marknamepy[i]);
		}
	}
	if(nickpy){
		for(var i = 0; i < nickpy.length; i++){
			friend.searchKw.push(nickpy[i]);
		}
	}
}

function chg2py(str){
	var result;
	var resultC;
	var fd = 1;
	var py = new Array;
	var pyl = 0;
	var jw = new Array;
	var list = new Array;
	if(!str){
		return null;
	}
	
	for(var i = 0; i < str.length; i++){
		jw[i] = 0;
		var r = new Array;
		var rl = 0;
		for(var j = 0; j < window.PINYIN_DICT.length; j++){
			if(window.PINYIN_DICT[j][1].indexOf(str.substr(i, 1)) != -1){
				r.push(window.PINYIN_DICT[j][0]);
				rl = 1;
			}
		}
		if(rl){
			py.push(r);
			pyl = 1;
		}
	}
	while(fd && pyl){
		result = '';
		var nn = '';
		for(var i = 0; i < py.length; i++){
			if(jw[py.length-1] == py[py.length-1].length){
				fd = 0;
				break;
			}
			else if(jw[i] == py[i].length){
				jw[i] = 0;
				jw[i+1]++;
			}
		}
		if(!fd){
			break;
		}
		for(i = 0; i < py.length; i++){
			result += py[i][jw[i]];
			resultC += py[i][jw[i]].substr(0,1);
			nn += jw[i]+',';
		}
		list.push(result, resultC);
		jw[0]++;
	}
	return list;
}

function searchFriends(kw){
	var count = 0;
	var fd;
	document.getElementById('searchListBorder').innerHTML = '';
	if(!kw){
		document.getElementById('searchListBorder').style.display = 'none';
		return;
	}
	if(botList.indexOf(kw.toLowerCase()) != -1){
		count++;
		uin = kw;
		var el = document.createElement('div');
		el.className = 'searchResult';
		el.id = 'result_'+uin;
		el.onclick = function(){
			openBot(this.id.substr(7));
		}
		el.style.backgroundImage = 'url(/images/bot/'+uin+'.png)';
		el.innerHTML = uin;
		document.getElementById('searchListBorder').appendChild(el);
	}
	for(var uin in HTML5QQ.friendsInfo.friends){
		var friend = HTML5QQ.friendsInfo.friends[uin];
		if(count > 9){
			break;
		}
		fd = 1;
		for(var j = 0; j < friend.searchKw.length; j++){
			if(friend.searchKw[j] && friend.searchKw[j].toLowerCase().indexOf(kw.toLowerCase()) != -1){
				count++;
				var el = document.createElement('div');
				el.className = 'searchResult';
				el.id = 'result_'+uin;
				el.onclick = function(){
					openChat(this.id.substr(7));
				}
				el.style.backgroundImage = 'url(http://face'+(uin%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=1&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq+')';
				el.innerHTML = friend.markname?(friend.markname+'('+friend.nick+')'):friend.nick;
				document.getElementById('searchListBorder').appendChild(el);
				fd = 1;
				break;
			}
		}
		if(fd){
			continue;
		}
	}
	if(count){
		document.getElementById('searchListBorder').style.display = 'block';
	}
	else{
		document.getElementById('searchListBorder').style.display = 'none';
	}
}

function openChat(uin){
	chrome.extension.sendMessage('otab'+uin);
}

function openBot(uin){
	chrome.extension.sendMessage('obot'+uin);
}

function clearFlash(uin){
	document.getElementById('friendHead_'+uin).style.WebkitAnimation = '';
	document.getElementById('searchListBorder').style.display = 'none';
	chrome.extension.sendMessage('newmsg', flashGroup);
}

function clearQun(uin){
	document.getElementById('qunHead_'+uin).style.WebkitAnimation = '';
}

function openQun(uin){
	chrome.extension.sendMessage('oqtab'+uin);
}

function flashGroup(newMsg){
	for(var i = 0; i < document.getElementsByClassName('groupName').length+document.getElementsByClassName('groupNameOpen').length-1; i++){
		document.getElementById('groupName_'+i).style.WebkitAnimation = '';
	}
	for(var i = 0; i < newMsg.friend.length; i++){
		var uin = newMsg.friend[i];
		if (uin in HTML5QQ.friendsInfo.friends) {
			document.getElementById('groupName_'+catTransfer[HTML5QQ.friendsInfo.friends[uin].category]).style.WebkitAnimation = 'flash 0.5s infinite cubic-bezier(1,0,0,1)';
		}
	}
}

function changeStatus(value){
	var uin = value.uin;
	if (uin in HTML5QQ.friendsInfo.friends) {
		var friend = HTML5QQ.friendsInfo.friends[uin];
		var i = friend.category;
		if(friend.status == 'offline' && value.status != 'offline'){
			onlineFriendsTotal[catTransfer[i]]++;
		}
		else if(friend.status != 'offline' && value.status == 'offline'){
			onlineFriendsTotal[catTransfer[i]]--;
		}
		friend.status = value.status;
		friend.client_type = value.client_type;
		document.getElementById('friendDetail_'+catTransfer[i]).removeChild(document.getElementById('friend_'+uin));
		var el = document.createElement('li');
		el.id = 'friend_'+uin;
		el.className = 'friendDetail';
		el.setAttribute('cat', i);
		el.setAttribute('status', value.status);
		el.onclick = function(){
			selectFriend(this);
		}
		el.ondblclick = function(){
			openChat(this.id.substr(7));
			this.setAttribute('selected', 'false');
		}
		el.innerHTML = '<div class="friendHead">'+
							'<img id="friendHead_'+uin+'" state="'+friend.status+'" src="'+
							'http://face'+(uin%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=1&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq+
							'" />'+
							//'<div class="showHideIco"></div>'+
							'<div class="showState'+(friend.client_type==21?'Mobile':(friend.client_type==24?'Iphone':friend.status.substring(0,1).toUpperCase()+friend.status.substring(1)))+'"></div>'+
						'</div>'+
						'<div class="friendInfo">'+
							'<div class="friendName">'+
							((friend.markname)?(friend.markname+'<span class="friendMark">('+friend.nick+')</span>'):(friend.nick))+
							'</div>'+
							'<div class="friendPersonal">'+friend.lnick+'</div>'+
						'</div>'+
						'<div style="clear: both"></div>';
		var lists = document.getElementsByClassName('friendDetail');
		var fd = 0;
		for(var k = 0; k < lists.length; k++){
			if(lists[k].getAttribute('cat') != catTransfer[i]){
				continue;
			}
			else{
				switch(friend.status){
					case 'callme': {
						document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
						fd = 1;
						break;
					}
					case 'online': {
						if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' && (friend.client_type == 21 ||friend.client_type == 24)){
							break;
						}
						else{
							document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
					}
					case 'busy': {
						if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online'){
							break;
						}
						else{
							document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
					}
					case 'away': {
						if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy'){
							break;
						}
						else{
							document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
					}
					case 'silent': {
						if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy' || lists[k].getAttribute('status') == 'away'){
							break;
						}
						else{
							document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
					}
					case 'offline': {
						if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy' || lists[k].getAttribute('status') == 'away' || lists[k].getAttribute('status') == 'silent'){
							break;
						}
						else{
							document.getElementById('friendDetail_'+catTransfer[i]).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
					}
				}
				if(fd){
					break;
				}
			}
		}
		if(!fd){
			document.getElementById('friendDetail_'+catTransfer[i]).appendChild(el);
		}
		document.getElementById('ftotal_'+catTransfer[i]).innerHTML = '['+onlineFriendsTotal[catTransfer[i]]+'/'+friendsTotal[catTransfer[i]]+']';
	}
}

window.onclick = function(){
	if(!showStateList){
		document.getElementById('stateList').style.display = 'none';
	}
}

var groupstate = new Array;
var onlineFriendsTotal = new Array;
var friendsTotal = new Array;

/*
chrome.extension.onMessage.addListener(function(request, sender, callback) {
	callback();
});
*/

sendRequest('hello', function(result){
	HTML5QQ = result;
	var status = HTML5QQ.status;
	var friendsInfo = HTML5QQ.friendsInfo;
	var groupsInfo = HTML5QQ.groupsInfo;
	var categories = new Array;
	var statusList = {
		'callme':  'Q我',
		'online':  '在线',
		'busy':    '忙碌',
		'away':    '离开',
		'offline': '离线',
		'hidden':  '隐身',
		'silent':  '静音'
	}
	document.getElementById('userState').title = '当前状态 '+statusList[status];
	document.getElementById('stateIco').className = 'state_'+status;
	document.getElementById('userName').innerHTML = HTML5QQ.info.nick.length>6?HTML5QQ.info.nick.substr(0, 6)+'...':HTML5QQ.info.nick;
	document.getElementById('userLevel').title = '我的QQ等级 '+HTML5QQ.levelInfo.level+'级'+String.fromCharCode(13)+'剩余升级时间 '+HTML5QQ.levelInfo.remainDays+'天';
	document.getElementById('userLevel').innerHTML = 'LV'+HTML5QQ.levelInfo.level;
	document.getElementById('userMotto').title = HTML5QQ.myPersonal;
	document.getElementById('setLnick').value = HTML5QQ.myPersonal;
	document.getElementById('userLnick').innerHTML = HTML5QQ.myPersonal.length>40?HTML5QQ.myPersonal.substr(0, 37)+'...':HTML5QQ.myPersonal;
	/*
	for(var i = 0; i < friendsInfo.categories.length; i++){
		if(hideCat){
			categories[Number(friendsInfo.categories[i].sort)] = new Object;
			categories[Number(friendsInfo.categories[i].sort)].name = friendsInfo.categories[i].name;
			categories[Number(friendsInfo.categories[i].sort)].index = friendsInfo.categories[i].index;
			catTransfer[i] = Number(friendsInfo.categories[i].sort);
		}
		else{
			categories[Number(friendsInfo.categories[i].sort-1)] = new Object;
			categories[Number(friendsInfo.categories[i].sort-1)].name = friendsInfo.categories[i].name;
			categories[Number(friendsInfo.categories[i].sort-1)].index = friendsInfo.categories[i].index;
			catTransfer[i] = Number(friendsInfo.categories[i].sort-1);
		}
	}
	*/
	categories = friendsInfo.categories;
	categories.sort(function orderCategories(a, b) {
		return a.sort - b.sort;
	});
	for(i=0; i<categories.length; i++){
		catTransfer[categories[i].index] = i;
	}
	for(var k=0; k < HTML5QQ.onlineList.length; k++){
		var uin = HTML5QQ.onlineList[k].uin;
		if(uin in HTML5QQ.friendsInfo.friends){
			var friend = HTML5QQ.friendsInfo.friends[uin];
			friend.status = HTML5QQ.onlineList[k].status;
			friend.client_type = HTML5QQ.onlineList[k].client_type;			
		}
	}
	for(var k=0; k < HTML5QQ.personal.length; k++){
		var uin = HTML5QQ.personal[k].uin;
		if(uin in HTML5QQ.friendsInfo.friends){
			HTML5QQ.friendsInfo.friends[uin].lnick = HTML5QQ.personal[k].lnick;
		}
	}
	for(var i = 0; i < categories.length; i++){
		friendsTotal[i] = 0;
		onlineFriendsTotal[i] = 0;
		groupstate[i] = 'closed';
		var el = document.createElement('div');
		el.id = 'categories_'+i;
		document.getElementById('friendsList').appendChild(el);
		el = document.createElement('div');
		el.id = 'group_'+i;
		el.className = 'groupName';
		el.setAttribute('groupId', i);
		el.onclick = function(){
			chgGroupState(this.getAttribute('groupId'));
			var friends = document.getElementsByClassName('friendDetail');
			for(var i = 0; i < friends.length; i++){
				friends[i].setAttribute('selected', 'false');
			}
		}
		document.getElementById('categories_'+i).appendChild(el);
		el = document.createElement('span');
		el.className = 'groupWords';
		el.id = 'groupName_'+i;
		el.innerHTML = categories[i].name;
		document.getElementById('group_'+i).appendChild(el);
		/*
		//隐身可见分组
		el = document.createElement('span');
		el.className = 'groupWords';
		el.innerHTML = '<img src="images/showhidesmall.png"/>';
		document.getElementById('group_'+i).appendChild(el);
		*/
		el = document.createElement('ul');
		el.id = 'friendDetail_'+i;
		el.style.display = 'none';
		document.getElementById('categories_'+i).appendChild(el);
		for(var j = 0; j < HTML5QQ.friendsInfo.categories[i].friends.length; j++){
			friendsTotal[i]++;
			var uin = HTML5QQ.friendsInfo.categories[i].friends[j];
			var friend = HTML5QQ.friendsInfo.friends[uin];
			
			if(!friend.status){
				friend.status = 'offline';
			} else if(friend.status == 'online'){
				onlineFriendsTotal[i]++;
			}
			
			if(!friend.markname){
				friend.markname = null;
			}
			
			if(!friend.nick){
				friend.nick = '';
			}			
			
			if(!friend.lnick){
				friend.lnick = '';
			}
			
			friend.searchKw = new Array;
			getSearch(uin);
			
			el = document.createElement('li');
			el.id = 'friend_'+uin;
			el.className = 'friendDetail';
			el.setAttribute('cat', i);
			el.setAttribute('status', friend.status);
			el.onclick = function(){
				selectFriend(this);
			}
			el.ondblclick = function(){
				openChat(this.id.substr(7));
				this.setAttribute('selected', 'false');
			}
			el.innerHTML = '<div class="friendHead">'+
								'<img id="friendHead_'+uin+'" state="'+friend.status+'" src="'+
								'http://face'+(uin%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=1&fid=0&uin='+uin+'&vfwebqq='+HTML5QQ.vfwebqq+
								'" />'+
								//'<div class="showHideIco"></div>'+
								'<div class="showState'+(friend.client_type==21?'Mobile':(friend.client_type==24?'Iphone':friend.status.substring(0,1).toUpperCase()+friend.status.substring(1)))+'"></div>'+
							'</div>'+
							'<div class="friendInfo">'+
								'<div class="friendName">'+
								((friend.markname)?(friend.markname+'<span class="friendMark">('+friend.nick+')</span>'):(friend.nick))+
								'</div>'+
								'<div class="friendPersonal">'+friend.lnick+'</div>'+
							'</div>'+
							'<div style="clear: both"></div>';
			var lists = document.getElementsByClassName('friendDetail');
			var fd = 0;
			for(var k = 0; k < lists.length; k++){
				if(lists[k].getAttribute('cat') != i){
					continue;
				}
				else{
					switch(friend.status){
						case 'callme': {
							document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
							fd = 1;
							break;
						}
						case 'online': {
							if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' && (friend.client_type == 21 || friend.client_type == 24)){
								break;
							}
							else{
								document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
								fd = 1;
								break;
							}
						}
						case 'busy': {
							if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online'){
								break;
							}
							else{
								document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
								fd = 1;
								break;
							}
						}
						case 'away': {
							if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy'){
								break;
							}
							else{
								document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
								fd = 1;
								break;
							}
						}
						case 'silent': {
							if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy' || lists[k].getAttribute('status') == 'away'){
								break;
							}
							else{
								document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
								fd = 1;
								break;
							}
						}
						case 'offline': {
							if(lists[k].getAttribute('status') == 'callme' || lists[k].getAttribute('status') == 'online' || lists[k].getAttribute('status') == 'busy' || lists[k].getAttribute('status') == 'away' || lists[k].getAttribute('status') == 'silent'){
								break;
							}
							else{
								document.getElementById('friendDetail_'+i).insertBefore(el, lists[k]);
								fd = 1;
								break;
							}
						}
					}
					if(fd){
						break;
					}
				}
			}
			if(!fd){
				document.getElementById('friendDetail_'+i).appendChild(el);
			}
		}
		el = document.createElement('span');
		el.className = 'groupWords';
		el.id = 'ftotal_'+i;
		el.innerHTML = '['+onlineFriendsTotal[i]+'/'+friendsTotal[i]+']';
		document.getElementById('group_'+i).appendChild(el);
	}
	var qun = HTML5QQ.groupsInfo.gnamelist;
	groupstate['qun'] = 'open';
	el = document.createElement('div');
	el.id = 'qun';
	document.getElementById('qunList').appendChild(el);
	el = document.createElement('div');
	el.id = 'group_qun';
	el.className = 'groupNameOpen';
	el.setAttribute('groupId', 'qun');
	el.onclick = function(){
		chgGroupState(this.getAttribute('groupId'));
	}
	document.getElementById('qun').appendChild(el);
	el = document.createElement('span');
	el.className = 'groupWords';
	el.innerHTML = '我的QQ群';
	document.getElementById('group_qun').appendChild(el);
	el = document.createElement('ul');
	el.id = 'friendDetail_qun';
	el.style.display = 'block';
	document.getElementById('qun').appendChild(el);
	el = document.createElement('span');
	el.className = 'groupWords';
	el.innerHTML = '['+qun.length+']';
	document.getElementById('group_qun').appendChild(el);
	for(var i = 0; i < qun.length; i++){
		el = document.createElement('li');
		el.id = 'qun_'+qun[i].code;
		el.className = 'qunDetail';
		el.onclick = function(){
			selectQun(this);
		}
		el.ondblclick = function(){
			openQun(this.id.substr(4));
			this.setAttribute('selected', 'false');
		}
		el.innerHTML = '<div class="friendHead">'+
							'<img id="qunHead_'+qun[i].code+'" src="'+
							'http://face'+(qun[i].code%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type=4&fid=0&uin='+qun[i].code+'&vfwebqq='+HTML5QQ.vfwebqq+
							'" />'+
						'</div>'+
						'<div class="friendInfo">'+
							'<div class="friendName">'+qun[i].name+'</div>'+
							'<div class="friendPersonal"></div>'+
						'</div>'+
						'<div style="clear: both"></div>';
		document.getElementById('friendDetail_qun').appendChild(el);
	}
	var recent = HTML5QQ.recentList;
	el = document.createElement('div');
	el.id = 'recent';
	document.getElementById('recentList').appendChild(el);
	el = document.createElement('ul');
	el.id = 'friendDetail_recent';
	el.style.display = 'block';
	document.getElementById('recent').appendChild(el);
	for(var i = 0; i < recent.length; i++){
		if(recent[i].type == '0'){
			for(var j = 0; j < HTML5QQ.onlineList.length; j++){
				if(HTML5QQ.onlineList[j].uin == recent[i].uin){
					recent[i].status = HTML5QQ.onlineList[j].status;
					recent[i].client_type = HTML5QQ.onlineList[j].client_type;
					break;
				}
			}
			if(!recent[i].status){
				recent[i].status = 'offline';
			}
			if(recent[i].uin in HTML5QQ.friendsInfo.friends){
				var friend = HTML5QQ.friendsInfo.friends[recent[i].uin];
				recent[i].markname = friend.markname;
				recent[i].nick = friend.nick;
				recent[i].lnick = friend.lnick;
			}
			if(!recent[i].markname){
				recent[i].markname = null;
			}
			if(!recent[i].nick){
				recent[i].nick = '';
			}
			if(!recent[i].lnick){
				recent[i].lnick = '';
			}
		}
		else{
			for(var j = 0; j < HTML5QQ.groupsInfo.gnamelist.length; j++){
				if(HTML5QQ.groupsInfo.gnamelist[j].gid == recent[i].uin){
					recent[i].nick = HTML5QQ.groupsInfo.gnamelist[j].name;
					recent[i].lnick = '';
					recent[i].code = HTML5QQ.groupsInfo.gnamelist[j].code;
					recent[i].status = 'online';
					break;
				}
			}
		}
		el = document.createElement('li');
		el.type = recent[i].type;
		el.id = 'recent_'+(recent[i].type=='0'?recent[i].uin:recent[i].code);
		el.className = 'recentDetail';
		el.onclick = function(){
			selectRecent(this);
		}
		el.ondblclick = function(){
			if (this.type=='0') {
				openChat(this.id.substr(7));
			} else {
				openQun(this.id.substr(7));
			}
			this.setAttribute('selected', 'false');
		}
		el.innerHTML = '<div class="friendHead">'+
							'<img state="'+recent[i].status+'" src="'+
							'http://face'+((recent[i].type=='0'?recent[i].uin:recent[i].code)%10+1)+'.qun.qq.com/cgi/svr/face/getface?cache=0&type='+(recent[i].type=='0'?1:4)+'&fid=0&uin='+(recent[i].type=='0'?recent[i].uin:recent[i].code)+'&vfwebqq='+HTML5QQ.vfwebqq+
							'" />'+
							//'<div class="showHideIco"></div>'+
							'<div class="showState'+(recent[i].client_type==21?'Mobile':(recent[i].client_type==24?'Iphone':recent[i].status.substring(0,1).toUpperCase()+recent[i].status.substring(1)))+'"></div>'+
						'</div>'+
						'<div class="friendInfo">'+
							'<div class="friendName">'+
							((recent[i].markname)?(recent[i].markname+'<span class="friendMark">('+recent[i].nick+')</span>'):(recent[i].nick))+
							'</div>'+
							'<div class="friendPersonal">'+recent[i].lnick+'</div>'+
						'</div>'+
						'<div style="clear: both"></div>';
		document.getElementById('friendDetail_recent').appendChild(el);
	}
	chrome.extension.sendMessage('newmsg', function(newMsg){
		flashGroup(newMsg);
		for(var i = 0; i < newMsg.friend.length; i++){
			if(document.getElementById('friendHead_'+newMsg.friend[i])){
				document.getElementById('friendHead_'+newMsg.friend[i]).style.WebkitAnimation = 'shake 0.5s infinite cubic-bezier(1,0,0,1)';
			}
		}
		for(var i = 0; i < newMsg.qun.length; i++){
			if(document.getElementById('friendHead_'+newMsg.qun[i])){
				document.getElementById('friendHead_'+newMsg.qun[i]).style.WebkitAnimation = 'shake 0.5s infinite cubic-bezier(1,0,0,1)';
			}
		}
	});
});
