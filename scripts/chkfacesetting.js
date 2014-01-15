/*********************************************************
*  Copyright (c) 2013-2014 Donkil. All rights reserved.  *
*                                                        *
*           Publish under GPL License.                   *
*********************************************************/

(function(){
	if(localStorage.smallface){
		var el = document.createElement('link');
		el.href = 'smallface.css';
		el.rel = 'stylesheet';
		document.getElementsByTagName('head')[0].appendChild(el);
	}
})();