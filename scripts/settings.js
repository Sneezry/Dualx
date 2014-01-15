/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::settings:: <'+l+'> '+err);
}

chrome.extension.sendMessage('lgstatus', function(loginstatus){
	if(loginstatus == 'off'){
		document.getElementById('popupmain').disabled = '';
	}
});

var boxs = document.getElementsByTagName('input');
for(var i=0; i<boxs.length; i++){
	boxs[i].onclick = save;
	if(localStorage[boxs[i].id]){
		boxs[i].checked = 'checked';
	}
}

document.getElementById('mainstyle').onclick = function(){
	this.select();
}

document.getElementById('mainstyle').onblur = function(){
	localStorage['mainstyle'] = this.value;
}

if(localStorage['mainstyle']){
	document.getElementById('mainstyle').value = localStorage['mainstyle'];
}

document.getElementById('chatstyle').onclick = function(){
	this.select();
}

document.getElementById('chatstyle').onblur = function(){
	localStorage['chatstyle'] = this.value;
}

if(localStorage['chatstyle']){
	document.getElementById('chatstyle').value = localStorage['chatstyle'];
}

document.getElementById('qunstyle').onclick = function(){
	this.select();
}

document.getElementById('qunstyle').onblur = function(){
	localStorage['qunstyle'] = this.value;
}

if(localStorage['qunstyle']){
	document.getElementById('qunstyle').value = localStorage['qunstyle'];
}

document.getElementById('showdebug').onclick = function(){
	chrome.extension.sendMessage('showlog');
}

document.getElementById('updatewindowborder').onclick = updateWindowBorder;

function save(){
	if(this.checked){
		localStorage[this.id] = 'true';
	}
	else{
		localStorage[this.id] = '';
	}
}

chrome.storage.local.get('history', function(history){
	if(!history || !history.history){
		document.getElementById('savedData').innerHTML = '<span style="color:gray">暂无数据</span>';
		return;
	}
	else{
		var rec = false;
		var el = document.createElement('ul');
		el.id = 'msgHis';
		document.getElementById('savedData').appendChild(el);
		for(var qq in history.history){
			if(!history.history[qq]){
				continue;
			}
			rec = true;
			var frnum = 0;
			var qnnum = 0;
			var flnum = 0;
			if(history.history[qq].friend){
				for(var frmsg in history.history[qq].friend){
					if(history.history[qq].friend[frmsg]){
						frnum += history.history[qq].friend[frmsg].length;
					}
				}
			}
			if(history.history[qq].qun){
				for(var qnmsg in history.history[qq].qun){
					if(history.history[qq].qun[qnmsg]){
						qnnum += history.history[qq].qun[qnmsg].length;
					}
				}
			}
			if(history.history[qq].file){
				for(var flmsg in history.history[qq].file){
					if(history.history[qq].file[flmsg]){
						flnum += history.history[qq].file[flmsg].length;
					}
				}
			}
			var totalnum = frnum+qnnum+flnum;
			el = document.createElement('li');
			el.innerHTML = qq+': 共 '+totalnum+' 条信息。[<a href="#" id="del_'+qq+'">删除</a>]';
			document.getElementById('msgHis').appendChild(el);
			document.getElementById('del_'+qq).onclick = function(){
				if(confirm('您真的要删除'+this.id.substr(4)+'下的全部聊天记录吗')){
					delHistory(this.id.substr(4));
				}
			}
		}
	}
	if(!rec){
		document.getElementById('savedData').innerHTML = '<span style="color:gray">暂无数据</span>';
		return;
	}
});

function delHistory(qq){
	chrome.storage.local.get('history', function(history){
		if(!history || !history.history || !history.history[qq]){
			location.reload();
			return;
		}
		else{
			history.history[qq] = null;
		}
		chrome.storage.local.set({'history': history.history});
		location.reload();
		return;
	});
}

function updateWindowBorder(){
	chrome.extension.sendMessage('updatewindowborder');
	alert('窗口尺寸校验完成。');
}