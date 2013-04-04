// short version of get ID
function getID(id) {
	return document.getElementById(id);
}

window.onerror = function(err, u, l){
	chrome.extension.sendMessage('error::settings:: <'+l+'> '+err);
}

var boxs = document.getElementsByTagName('input');
for(var i=0; i<boxs.length; i++){
	boxs[i].onclick = save;
	if(localStorage[boxs[i].id]){
		boxs[i].checked = 'checked';
	}
}

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
		getID('savedData').innerHTML = '<span style="color:gray">暂无数据</span>';
		return;
	}
	else{
		var rec = false;
		var el = document.createElement('ul');
		el.id = 'msgHis';
		getID('savedData').appendChild(el);
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
			getID('msgHis').appendChild(el);
			getID('del_'+qq).onclick = function(){
				if(confirm('您真的要删除'+this.id.substr(4)+'下的全部聊天记录吗')){
					delHistory(this.id.substr(4));
				}
			}
		}
	}
	if(!rec){
		getID('savedData').innerHTML = '<span style="color:gray">暂无数据</span>';
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