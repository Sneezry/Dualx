var history;
var qq;
var imap;
var interval_func;

document.getElementById('loginButtonInner').onclick = doLogin;

document.getElementById('account').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

document.getElementById('password').onkeydown = function(){
	if(event.keyCode==13){
		doLogin();
		return false;
	}
}

window.onload = function(){
	imap = document.getElementById('imap');
	chrome.extension.sendMessage('hello', function(HTML5QQ) {
		qq = HTML5QQ.qq;
		document.getElementById('account').value = qq + "@qq.com";
		chrome.storage.local.get('history', function(result){
			if(!result){
				return;
			}
			if(!result.history){
				return;
			}
			if(!result.history[HTML5QQ.qq]){
				return;
			}
			if(!result.history[HTML5QQ.qq].friend){
				return;
			}
			history = result.history[HTML5QQ.qq].friend;
		});
	});
}

dateformat = function(date) {
	var week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
	var day = date.getDate();
	var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];
	var year = date.getFullYear();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var timezone = -date.getTimezoneOffset()/60;
	if (timezone >= 0)
		if (timezone >= 10)
			timezone = "+" + timezone + "00";
		else
			timezone = "+0" + timezone + "00";
	else
		if (timezone <= -10)
			timezone = "-" + timezone + "00";
		else
			timezone = "-0" + timezone + "00";
	return week + ", " + day + " " + month + " " + year + " " + hours + ":" + minutes + ":" + seconds + " " + timezone;
}



function doLogin(){
	
	var progress = document.getElementById("afterLogin");
	var account = document.getElementById('account').value;
	var password = document.getElementById('password').value;
	if(account && password){		
		if (!imap.login(account, password)) {
			alert("登录失败！");			
		} else {
			document.getElementById('beforeLogin').style.display = 'none';
			document.getElementById('afterLogin').style.display = 'block';
			
			imap.create("CHAT");
			
			workqueue = [];
			
			if (history) {
				for (var friend in history) {
					var ahistory = history[friend];
					for(var i = 0; i < ahistory.length; i++) {
						var msg = ahistory[i].msg;
						try {
							if(typeof(msg.content) == 'string'){
								msg.content = JSON.parse(msg.content);
							}
							var message = "";
							for(var j = 0; j < msg.content.length; j++) {
								if(typeof(msg.content[j]) == 'string') {
									message += msg.content[j];
								}
							}
						} catch(e) {
							continue;
						}
						message = decodeURIComponent(message);
						
						var date = new Date(ahistory[i]['time']);
						var from, to;
						if (msg.from_uin) {
							from = friend + "@qq.com";
							to = qq + "@qq.com";							
						} else {
							from = qq + "@qq.com";
							to = friend + "@qq.com";
						}
						
						workqueue.push({
							from: from,
							to: to,
							date: date,
							subject: "与"+friend+"的聊天记录",
							content: message,
						});
					}
				}
			}
			
			interval_func = setInterval(function(workqueue, length) {
				if (workqueue.length == 0) {
					progress.textContent = "备份完成";
					imap.logout();
					clearInterval(interval_func);		
					return;			
				}
				data = workqueue.pop();
				
				progress.textContent = "正在备份(" + (length - workqueue.length) + "/" + length + ")";
				imap.append('CHAT', data.from, data.to, dateformat(data.date), data.subject, data.content);
			}, 100, workqueue, workqueue.length);
		}
	}
}
