/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

localStorage.widthoffset = 150 - document.body.offsetWidth;
localStorage.heightoffset = 150 - document.body.offsetHeight;

chrome.windows.getCurrent(function(window){
	chrome.windows.remove(window.id);
});