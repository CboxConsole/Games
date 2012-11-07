//
// ASSET MANAGER
// @ragingwind
//
(function(window) {
	
	window.Assets = function() {
		this.type = 'chrome';
		this.assets = {
			'googlw': {
				map: 'assets/google.tmx',
				sprite: 'assets/sprites.png',
				pos: {
					bat:{x:1, y:29},
					ball:{x:0, y:21}
				}
			},
			'chrome': {
				map: 'assets/chrome.tmx',
				sprite: 'assets/sprites-chrome.png',
				pos: {
					bat:{x:1, y:29},
					ball:{x:0, y:21}
				}
			}	
		};
		return this.assets[this.type];
	}

})(window);