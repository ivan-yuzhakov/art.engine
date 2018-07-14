var ww, wh, wwi, ws = 0, dh, hash, hashDisable = false, debug = false, overlay;

var index = {
	el: {
		parent: $('#index'),
	},
	start: function(){
		var x = this;
	},
	hash: function(){
		var x = this;
	},
	resize: function(){
		var x = this;
	},
	scroll: function(){
		var x = this;
	}
};

var common = {
	el: {
		body: $('body'),
		header: $('header'),
		footer: $('footer')
	},
	valid: (function(){return !!window[section] && !!window[section].start})(),
	start: function(){
		if (common.valid) window[section].start();
		$(window).on('resize', common.resize).trigger('resize').on('hashchange', common.hash).trigger('hashchange').on('scroll', common.scroll).trigger('scroll');
	},
	hash: function(){
		hash = location.hash.replace(/^#\//, '');
		if (!hashDisable && common.valid) window[section].hash();
		hashDisable = false;
	},
	resize: function(){
		ww = $(window).width();
		wh = $(window).height();
		dh = $(document).height();
		wwi = window.innerWidth;
		if (common.valid) window[section].resize();
	},
	scroll: function(){
		ws = $(window).scrollTop();
		if (common.valid) window[section].scroll();
	}
};

var m = {
	isMobile: function(){
		var match = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i);
		return match ? match[0] : false;
	}(),
	random: function(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	storage: {
		support: function(){
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}
		}(),
		set: function(key, value){
			if (this.support) {
				localStorage[key] = value;
				localStorage[key + '_time'] = new Date().getTime();
			} else {
				console.log('Not support localStorage!');
			}
		},
		get: function(key, time){ // time in minutes
			if (this.support && !debug) {
				var value = localStorage[key];
				if (time) {
					var old_time = localStorage[key + '_time'] || 0;
					var new_time = new Date().getTime();
					var expired = (new_time - old_time) / 1000 / 60 > time;
					if (expired) this.remove(key);
					return expired ? false : value;
				} else {
					return value;
				}
			} else {
				return false;
			}
		},
		remove: function(key){
			if (this.support) {
				localStorage.removeItem(key);
				localStorage.removeItem(key + '_time');
			} else {
				console.log('Not support localStorage!');
			}
		}
	},
	cache: {
		el: $('#cache'),
		set: function(elem){
			this.el.append(elem);
		},
		get: function(id){
			return $('#' + id, this.el);
		}
	},
	preload_array: {},
	preload: function(src, callback, sleep){
		var x = this;

		if (!src) return false;

		if (x.preload_array[src]) {
			var image = $('img', m.cache.el).filter('[src="' + src + '"]');
			if (callback && typeof callback == 'function') callback(image.get(0));
		} else {
			x.preload_array[src] = true;
			$('<img src="' + src + '" />').load(function(){
				if (callback && typeof callback == 'function') callback(this);
			}).appendTo(m.cache.el);
		}
	},
	scrollTo: function(scroll, callback){
		if (ws == scroll) {
			if (callback) callback();
		} else {
			$('html, body').animate({scrollTop: scroll}, 250, 'swing', function(){
				if (callback) callback();
			});
		}
	},
	log: (function(){
		window.log = function(vars){
			console.log(vars);
		};
	})(),
	wait: function(condition, callback){
		var result = condition();
		if (result) {
			callback();
		} else {
			setTimeout(function(){
				m.wait(condition, callback);
			}, 50);
		}
	},
	set_meta: function(meta){
		if (meta.title) {
			$('head').find('title').text(meta.title);
			$('head').find('meta[property="og:title"]').attr('content', meta.title);
			$('head').find('meta[name="twitter:title"]').attr('content', meta.title);
		}

		if (meta.desc) {
			$('head').find('meta[name="description"]').attr('content', meta.desc);
			$('head').find('meta[property="og:description"]').attr('content', meta.desc);
			$('head').find('meta[name="twitter:description"]').attr('content', meta.desc);
		}

		if (meta.keys) {
			$('head').find('meta[name="keywords"]').attr('content', meta.keys);
		}

		if (meta.image) {
			$('head').find('meta[property="og:image"]').attr('content', meta.image);
			$('head').find('meta[name="twitter:image"]').attr('content', meta.image);
		}

		$('head').find('meta[property="og:url"]').attr('content', location.href);
		$('head').find('meta[name="twitter:url"]').attr('content', location.href);
	}
};

$(common.start);