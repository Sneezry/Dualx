/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

(function(){
	if(localStorage.popupmain){
		var el = document.createElement('link');
		el.href = 'popupmain.css';
		el.rel = 'stylesheet';
		document.getElementsByTagName('head')[0].appendChild(el);
	}
})();