(function(){
	if(localStorage.popupmain){
		var el = document.createElement('link');
		el.href = 'popupmain.css';
		el.rel = 'stylesheet';
		document.getElementsByTagName('head')[0].appendChild(el);
	}
})();