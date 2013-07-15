localStorage.widthoffset = 150 - document.body.offsetWidth;
localStorage.heightoffset = 150 - document.body.offsetHeight;

chrome.windows.getCurrent(function(window){
	chrome.windows.remove(window.id);
});