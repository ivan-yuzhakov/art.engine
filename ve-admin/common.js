String.prototype.translit = (function(){
	var L = {
		'ж':'zh','ё':'yo','й':'i','ю':'yu','ь':'\'','ч':'ch','щ':'sh','ц':'c','у':'u','к':'k','е':'e','н':'n','г':'g','ш':'sh','з':'z','х':'h','ъ':'\'\'','ф':'f','ы':'y','в':'v','а':'a','п':'p','р':'r','о':'o','л':'l','д':'d','э':'yе','я':'jа','с':'s','м':'m','и':'i','т':'t','б':'b','Ё':'yo','Й':'I','Ю':'YU','Ч':'CH','Ь':'\'','Щ':'SH\'','Ц':'C','У':'U','К':'K','Е':'E','Н':'N','Г':'G','Ш':'SH','З':'Z','Х':'H','Ъ':'\'\'','Ф':'F','Ы':'Y','В':'V','А':'A','П':'P','Р':'R','О':'O','Л':'L','Д':'D','Ж':'Zh','Э':'Ye','Я':'Ja','С':'S','М':'M','И':'I','Т':'T','Б':'B'
	}, r = '', k;
    for (k in L) r += k;
    r = new RegExp('[' + r + ']', 'g');
    k = function(a){
        return a in L ? L[a] : '';
    };
    return function(){
        return this.replace(r, k);
    };
})();
String.prototype.encode = function(){
	// Analog PHP htmlspecialchars();
	return this.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#039;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};
String.prototype.decode = function(){
	// Analog PHP htmlspecialchars_decode();
	return this.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
};
String.prototype.short = function(length, separate){
	var length = length || 100;
	var separate = separate || ' ';
	var pos = this.indexOf(separate, length) + 1;
	return pos ? this.substr(0, pos-1) + '...' : this;
};
String.prototype.lang = function(){
	var lang = {};

	$.each(this.split(/\r\n|\n/), function(i, el){
		var q = el.match(/^{(.+)}:(.+)?$/); // el = {eng}:{"1":"text"}
		if (q === null) q = [false, settings.arr['langFrontDefault'], el]; // el = text
		if (el && q[2] === undefined) q[2] = ''; // el = {eng}:

		try {
			q[2] = $.parseJSON(q[2]);
		} catch (e) {}

		lang[q[1]] = q[2];
	});

	return lang;
};
// String.prototype.langs = function(){
	// var lang = {};

	// $.each(this.split(/\r\n|\n/), function(i, el){
		// if (/^{.+}:/.test(el)) {
			// var q = el.match(/^\{(.+)\}:([\s\S]*)$/);
		// } else {
			// var q = [null, settings.arr['langFrontDefault'], el];
		// }

		// try {
			// q[2] = $.parseJSON(q[2]);
		// } catch (e) {}

		// lang[q[1]] = q[2];
	// });

	// return lang;
// };

var hash, oldhash, ww, wh, wwi, whi,
	content = $('#content');
var loader = $('#overlay', content);

var drawing = function(data){
	var options = {
		attr_parent: '#',
		attr_width: 0,
		title_before: '',
		title: '',
		childs: ''
	};
	$.extend(options, data);

	return '<div class="items animate" parent="' + options.attr_parent + '" style="width:' + options.attr_width + 'px">\
		<div class="head">\
			' + options.title_before + '\
			<div class="head_title">' + options.title + '</div>\
		</div>\
		<div class="scroll">\
			<div class="viewport"><div class="overview">' + options.childs + '</div></div>\
			<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>\
		</div>\
	</div>';
};
var drawing_form = function(data){
	var options = {
		title: '',
		title_before: '', // for items
		extended: '', // for items
		childs: '',
		head_replace: false,
	};
	$.extend(options, data);

	var html = '<div class="head">\
		' + options.title_before + '\
		<div class="actions fright">\
			' + (options.head_replace ? options.head_replace : '\
			<div class="save">' + lang['global_save'] + '</div>\
			<div class="saveclose">' + lang['global_save_and_close'] + '</div>\
			<div class="close">' + lang['global_close'] + '</div>\
			') + '\
		</div>\
		<div class="head_title">' + options.title + '</div>\
	</div>\
	<div class="scroll">\
		<div class="viewport"><div class="overview">' + options.childs + '</div></div>\
		<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>\
	</div>';

	if (options.extended) html += '<div class="scroll extended">\
		<div class="viewport"><div class="overview">' + options.extended + '</div></div>\
		<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>\
	</div>';

	return html;
};

var extentions = {
	scripts: [],
	styles: [],
	plugins: [],
	init: function(callback){
		var x = this;

		$.each(x.scripts, function(i, el){
			el.remove();
		});
		$.each(x.styles, function(i, el){
			el.remove();
		});
		x.scripts = [];
		x.styles = [];
		x.plugins = [];

		var url = '?plugins/get_plugins_extentions';
		$.get(url, function(json){
			if (json.status === 'OK') {
				$.each(json.plugins, function(i, el){
					x.plugins.push(el.alias);

					var js = m.getScript(el.js, function(){
						window['plugin_' + el.alias + '_extentions'].lang = el.lang;
						window['plugin_' + el.alias + '_extentions'].fields = el.fields;

						if (window['plugin_' + el.alias + '_extentions']['onLoad']) window['plugin_' + el.alias + '_extentions']['onLoad']();
					});
					x.scripts.push(js);

					var css = m.getStyle(el.css, function(){});
					x.styles.push(css);
				});
			} else {
				m.report(url, {}, JSON.stringify(json));
			}

			if (callback) callback();
		}, 'json');
	},
	start: function(method){
		var x = this;

		// items_onCompleteForm

		$.each(x.plugins, function(i, alias){
			if (window['plugin_' + alias + '_extentions'][method]) window['plugin_' + alias + '_extentions'][method]();
		});
	}
};

var ui = {
	switch: {
		html: function(){
			return '<div class="ui-switch"></div>';
		},
		init: function(elem, options){
			if (options.status) elem.addClass('active');

			var html = '<div class="ui-switch-slider br3 animate"><div class="ui-switch-point br3 animate"></div></div>';
			if (options.text) html += '<div class="ui-switch-text">' + options.text + '</div>';
			elem.append(html);

			elem.on('click', function(){
				elem.toggleClass('active');
				if (options.change) options.change(elem.hasClass('active'));
			});

			if (options.change) options.change(options.status);
		},
		set: function(elem){
			elem.addClass('active');
		},
		get: function(elem){
			return elem.hasClass('active');
		}
	},
	combobox: function(elem, options) {
		var options = $.extend({
			placeholder: false,
			empty: 'Empty...',
			fields: [], // [[id, 'title'], ...], id - num or str
			selectedItems: [], // [id, ...], id - num or str
			removeSelectedItem: true,
			onSelect: function(){}
		}, options);

		elem.append('<input class="box br3 animate1" type="text" value=""' + (options.placeholder ? ' placeholder="' + options.placeholder + '"' : '') + '><div class="ui-combobox-list br3"></div><div class="ui-combobox-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 451.8 257.6"><path d="M225.9 257.6c-8.1 0-16.2-3.1-22.4-9.3L9.3 54C-3.1 41.7-3.1 21.6 9.3 9.3 21.6-3.1 41.7-3.1 54 9.3l171.9 171.9L397.8 9.3c12.4-12.4 32.4-12.4 44.7 0 12.4 12.4 12.4 32.4 0 44.7L248.3 248.3c-6.2 6.2-14.3 9.3-22.4 9.3z"/></svg></div>');

		var ui_input = $('input', elem);
		var ui_arrow = $('.ui-combobox-arrow', elem);
		var ui_list = $('.ui-combobox-list', elem);

		var status = {hover: false, open: false, selected: 0};

		var create = function(){
			ui_list.html($.map(options.fields, function(el, i){
				if (!el) return '';

				if (options.removeSelectedItem) {
					var k = $.inArray(el[0], options.selectedItems) + 1;
					if (!k) return '<div class="ui-combobox-field br3" data="' + el[0] + '">' + el[1] + '</div>';
				} else {
					return '<div class="ui-combobox-field br3" data="' + el[0] + '">' + el[1] + '</div>';
				}
			}).join('') + '<div class="ui-combobox-field-empty hide">' + options.empty + '</div>');

			update();
		};
		var set = function(id){
			ui_input.val('').focus();

			options.selectedItems.push(id);

			options.onSelect(id);

			if (options.removeSelectedItem) {
				$('.ui-combobox-field[data="' + id + '"]', ui_list).remove();
			}

			update();
		};
		var update = function(){
			var value = ui_input.val().trim();

			$('.ui-combobox-field', ui_list).removeClass('hide').removeClass('selected');

			if (value) {
				value = value.toLowerCase();

				$('.ui-combobox-field', ui_list).each(function(){
					var th = $(this);
					var text = th.text().toLowerCase();

					if (text.indexOf(value) < 0) th.addClass('hide');
				});
			}

			var showed = $('.ui-combobox-field', ui_list).not('.hide');
			if (showed.length) {
				showed.eq(0).addClass('selected');

				status.selected = 0;

				$('.ui-combobox-field-empty', ui_list).addClass('hide');
			} else {
				$('.ui-combobox-field-empty', ui_list).removeClass('hide');
			}
		};

		elem.on('focus', 'input', function(){
			status.open = true;
		}).on('blur', 'input', function(){
			if (status.hover) {
				setTimeout(function(){
					status.open = false;
				}, 100);
			} else {
				status.open = false;
			}
		}).on('keyup', 'input', function(e){
			if (e.keyCode === 38) { // arrow up
				var length = $('.ui-combobox-field', elem).not('.hide').length;
				var index = status.selected - 1;
				if (index < 0) index = length - 1;
				status.selected = index;

				$('.ui-combobox-field', elem).removeClass('selected').not('.hide').eq(index).addClass('selected');

				return false;
			}
			if (e.keyCode === 40) { // arrow down
				var length = $('.ui-combobox-field', elem).not('.hide').length;
				var index = status.selected + 1;
				if (index >= length) index = 0;
				status.selected = index;

				$('.ui-combobox-field', elem).removeClass('selected').not('.hide').eq(index).addClass('selected');

				return false;
			}
			if (e.keyCode === 13) { // enter
				var selected = $('.ui-combobox-field.selected', elem);
				var data = selected.attr('data');
				if (selected.length) set(+data || data);
			} else {
				update();
			}
		}).on('mouseenter', '.ui-combobox-arrow', function(){
			status.hover = true;
		}).on('mouseleave', '.ui-combobox-arrow', function(){
			status.hover = false;
		}).on('click', '.ui-combobox-arrow', function(){
			if (!status.open) ui_input.focus();
		}).on('click', '.ui-combobox-field', function(){
			var data = $(this).attr('data');
			set(+data || data);
		});

		create();

		return {
			elem: elem,
			options: options,
			reset: create
		};
	},
	select: function(parent, options) {
		var options = $.extend({
			text: '',
			fields: [], // [['title', ...], ...]
			active: 0,
			onSelect: function(){}
		}, options);

		parent.addClass('br3 box').empty();
//TODO
		// options.onSelect(i); //fields[i]
	},
	sortable: function(parent, options){
		var options = $.extend({
			items: '.item',
			exclude: '.empty',
			items_drop: '.item',
			items_drop_exclude: '.empty',
			distance: 3,
			many: false,
			items_size_box: false,
			only_drop: false,
			onStart: function(){}, // start drag
			onUpdate: function(){}, // end drag
			onHover: function(){}, // hover on item
			onLeave: function(){}, // leave hover item
			onCreatePlaceholder: function(){},
			setPosition: function(){}
		}, options);

		var pW = 0, pH = 0, pT = 0, pL = 0;
		var mX = 0, mY = 0;

		var resize = function(){
			pW = parent.outerWidth();
			pH = parent.outerHeight();
			pT = parent.offset().top;
			pL = parent.offset().left;
		};

		var start = function(th){
			var items = false;
			var index = 0;

			if (options.many) {
				items = th.prevAll(options.many).add(th).add(th.nextAll(options.many));
				items.each(function(i){
					var el = $(this);

					if (el.is(th)) index = i;
				});
			} else {
				items = th;
			}

			options.onStart(items);

			resize();

			$('body').addClass('ui_sortable-no-select');

			var iW = th.width(), iIW = th.outerWidth(),
				iH = th.height(), iIH = th.outerHeight(),
				iT = th.offset().top,
				iL = th.offset().left;
			var iOX = mX - iL,
				iOY = mY - iT;

			var placeholder = th.clone().empty().addClass('ui_sortable-placeholder').insertAfter(th);
			options.onCreatePlaceholder(placeholder);

			var item_hover = false;

			options.setPosition = function(){
				resize();

				var x = mX - iOX - pL;
				var y = mY - iOY - pT;

				x = Math.max(0, x); x = Math.min(pW - iIW, x);
				y = Math.max(0, y); y = Math.min(pH - iIH, y);

				items.each(function(i){
					var el = $(this);

					var indentY = (i - index) * 5;

					el.css({
						transform: 'translate3d(' + x + 'px, ' + (y + indentY) + 'px, 0)'
					});
				});
			};

			items.addClass('ui_sortable-item').css({
				width: options.items_size_box ? iIW : iW,
				height: options.items_size_box ? iIH : iH
			}).appendTo(parent);

			options.setPosition();

			$(window).on('mousemove', function(e){
				mX = e.clientX;
				mY = e.clientY;

				options.setPosition();
			}).one('mouseup', function(e){
				$('body').removeClass('ui_sortable-no-select');

				$(window).off('mousemove');
				$(window).off('resize.uisortable');

				parent.off('mouseenter');
				if (item_hover !== false) {
					item_hover.off('mousemove').off('mouseleave');
					$(options.items_drop, parent).removeClass('ui_sortable-item-drop');
					item_hover = false;
				}

				items.removeClass('ui_sortable-item').removeAttr('style').insertAfter(placeholder);
				placeholder.remove();

				options.onUpdate(items);
			});

			if (options.only_drop) {
				parent.on('mouseenter', options.items_drop, function(e){
					var i = $(this);

					if (i.is(options.items_drop_exclude)) return false;

					i.addClass('ui_sortable-item-drop');
					item_hover = i;
					options.onHover(i);

					i.one('mouseleave', function(e){
						i.removeClass('ui_sortable-item-drop');
						item_hover = false;
						options.onLeave(i);
					});
				});
			} else {
				parent.on('mouseenter', options.items_drop, function(e){
					var i = item_hover = $(this);

					if (i.hasClass('ui_sortable-placeholder')) return false;

					var t = i.offset().top;
					var h = i.outerHeight();

					i.on('mousemove', function(e){
						var part = (mY - t) / h;

						i.removeClass('ui_sortable-item-drop');

						if (i.is(options.items_drop_exclude)) {
							if (part < 0.2) {
								i.before(placeholder);
							} else if (part > 0.8) {
								i.after(placeholder);
							}
						} else {
							if (part < 0.2) {
								i.before(placeholder);
								options.onLeave();
							} else if (part > 0.8) {
								i.after(placeholder);
								options.onLeave();
							} else {
								i.addClass('ui_sortable-item-drop');
								options.onHover(i);
							}
						}
					}).one('mouseleave', function(e){
						i.removeClass('ui_sortable-item-drop');
						i.off('mousemove');

						item_hover = false;
					});
				});
			}
		};

		parent.addClass('ui_sortable').on('mousedown', options.items, function(e){
			var th = $(this);

			if (th.is(options.exclude)) return false;

			mX = e.clientX;
			mY = e.clientY;

			$(window).on('mousemove', function(e){
				var x = Math.abs(e.clientX - mX);
				var y = Math.abs(e.clientY - mY);

				if (x > options.distance || y > options.distance) {
					$(window).off('mousemove');
					$(window).off('mouseup');

					mX = e.clientX;
					mY = e.clientY;

					start(th);
				}
			}).one('mouseup', function(e){
				$(window).off('mousemove');
			});
		});

		$(window).on('resize.uisortable', resize);

		return {
			options: options
		};
	}/*,
	sortable_files: function(parent, options){
		var options = $.extend({
			items: '.f',
			distance: 3,
			many: '.selected',
			onStart: function(){}, // start drag
			onUpdate: function(){}, // end drag
			onHover: function(){}, // hover on item
			onLeave: function(){}, // leave hover item
			setPosition: function(){}
		}, options);

		var pW = 0, pH = 0, pT = 0, pL = 0;
		var mX = 0, mY = 0;

		var resize = function(){
			pW = parent.outerWidth();
			pH = parent.outerHeight();
			pT = parent.offset().top;
			pL = parent.offset().left;
		};

		var start = function(th){
			var index = 0;

			var items = th.prevAll(options.many).add(th).add(th.nextAll(options.many));
			items.each(function(i){
				var el = $(this);

				if (el.is(th)) index = i;
			});

			options.onStart(items);

			resize();

			$('body').addClass('ui_sortable-no-select');

			var iW = th.width(), iIW = th.outerWidth(),
				iH = th.height(), iIH = th.outerHeight(),
				iT = th.offset().top,
				iL = th.offset().left;
			var iOX = mX - iL,
				iOY = mY - iT;

			var placeholder = th.clone().empty().addClass('ui_sortable-placeholder').insertAfter(th);
			var item_hover = false;

			options.setPosition = function(){
				resize();

				var x = mX - iOX - pL;
				var y = mY - iOY - pT;

				x = Math.max(0, x); x = Math.min(pW - iIW, x);
				y = Math.max(0, y); y = Math.min(pH - iIH, y);

				items.each(function(i){
					var el = $(this);

					var indentY = (i - index) * 5;

					el.css({
						transform: 'translate3d(' + x + 'px, ' + (y + indentY) + 'px, 0)'
					});
				});
			};

			items.addClass('ui_sortable-item').css({
				width: iW,
				height: iH
			}).appendTo(parent);

			options.setPosition();

			$(window).on('mousemove', function(e){
				mX = e.clientX;
				mY = e.clientY;

				options.setPosition();
			}).one('mouseup', function(e){
				$('body').removeClass('ui_sortable-no-select');

				$(window).off('mousemove');
				$(window).off('resize.uisortable');

				parent.off('mouseenter');
				if (item_hover !== false) {
					item_hover.off('mousemove').off('mouseleave').removeClass('ui_sortable-item-drop');
					item_hover = false;
				}

				items.removeClass('ui_sortable-item').removeAttr('style').insertAfter(placeholder);
				placeholder.remove();

				options.onUpdate(items);
			});
return false;
			parent.on('mouseenter', options.items, function(e){
				var i = item_hover = $(this);

				if (i.hasClass('ui_sortable-placeholder')) return false;

				var t = i.offset().top;
				var h = i.outerHeight();

				i.on('mousemove', function(e){
					var part = (mY - t) / h;

					i.removeClass('ui_sortable-item-drop');

					if (i.is(options.exclude)) {
						if (part < 0.2) {
							i.before(placeholder);
						} else if (part > 0.8) {
							i.after(placeholder);
						}
					} else {
						if (part < 0.2) {
							i.before(placeholder);
							options.onLeave();
						} else if (part > 0.8) {
							i.after(placeholder);
							options.onLeave();
						} else {
							i.addClass('ui_sortable-item-drop');
							options.onHover(i);
						}
					}
				}).one('mouseleave', function(e){
					i.removeClass('ui_sortable-item-drop');
					i.off('mousemove');

					item_hover = false;
				});
			});
		};

		parent.addClass('ui_sortable').on('mousedown', options.items, function(e){
			var th = $(this);

			mX = e.clientX;
			mY = e.clientY;

			$(window).on('mousemove', function(e){
				var x = Math.abs(e.clientX - mX);
				var y = Math.abs(e.clientY - mY);

				if (x > options.distance || y > options.distance) {
					$(window).off('mousemove');
					$(window).off('mouseup');

					mX = e.clientX;
					mY = e.clientY;

					start(th);
				}
			}).one('mouseup', function(e){
				$(window).off('mousemove');
			});
		});

		$(window).on('resize.uisortable', resize);

		return {
			options: options
		};
	}*/
};

var sorting = {
	arr: {},
	init: function(callback)
	{
		var x = this;

		$.getJSON('?sorting/get', function(json){
			$.each(json, function(i, el){
				x.arr[i] = $.map(el.split(';'), function(val){
					var v = val.split(':');
					return {id: +v[0], parent: v[1]};
				});
			});

			x.complete = true;

			callback();
		});
	},
	set: function(section, sorting)
	{
		var x = this;

		var sort = [];
		$.each(sorting, function(i, el){
			if (el) sort.push(el);
		});
		x.arr[section] = sort;
		sort = $.map(sort, function(el){
			return el.id + ':' + el.parent;
		});

		var data = {section: section, sorting: sort.join(';')};
		var url = '?sorting/set';
		$.post(url, data, function(json){
			if (json['status'] == 'OK') {
				loader.hide();
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	}
};

var WS = (function(){
	var ws;
	var arr = [];
	var work = false;
	var loader = $('#ws');
	var status = false;

	var connect = function(){
		status = false;
		loader.show();

		if (location.protocol === 'https:') {
			ws = new WebSocket('wss://' + location.host + '/wss2/');
		} else {
			ws = new WebSocket('ws://' + location.host + ':1010');
		}

		ws.onopen = function(e){
			status = true;
			loader.hide();
		};
		ws.onclose = function(e){
			if (e.wasClean) {
				
			} else {
				connect();
			}
		};
		ws.onmessage = function(e){
			var obj = e.data.split('/');
			window[obj[0]].WS(obj[1], obj.slice(2));
		};
		ws.onerror = function(e){};
	};
	var send = function(val){
		ws.send(val);
	};
	var start = function(){
		if (work) return false;
		work = true;
		var f = arr[0];

		if (f) {
			f(function(){
				arr.splice(0, 1);
				work = false;
				start();
			});
		} else {
			work = false;
		}
	};
	var append = function(func){
		arr.push(func);
		start();
	};
	var getStatus = function(){
		return status;
	};

	connect();

	return {
		getStatus: getStatus,
		send: send,
		append: append
	};
})();

var Tasks = (function(){
	var task = [];
	var work = false;
	var clearing = false;

	var start = function(){
		if (clearing) return false;
		if (work) return false;
		work = true;
		var f = task[0];

		if (f) {
			task.splice(0, 1);

			f[0](function(){
				work = false;
				start();
			});
		} else {
			work = false;
		}
	};
	var add = function(cb, fb){
		task.push([cb, fb]);
		start();
	};
	var unshift = function(cb, fb){
		task.unshift([cb, fb]);
		start();
	}
	var clear = function(){
		clearing = true;
		$.each(task, function(i, t){
			t[1]();
		});
		task = [];
		work = false;
		clearing = false;
	}

	return {
		task: task,
		add: add,
		unshift: unshift,
		clear: clear
	};
})();

var common = {
	el: {
		body: $('body'),
		header: $('header'),
		menu: $('#menu'),
		content: $('#content')
	},
	queue: [sorting],
	init: function()
	{
		if (!WS.getStatus()) {
			setTimeout(function(){
				common.init();
			}, 300);
			return false;
		}

		$.ajaxSetup({
			error: function(jqXHR, status, error){
				if (status === 'abort') return false;

				if (jqXHR.responseText === 'AUTH_FAIL') {
					alertify.alert(lang['global_error_session']);
				} else {
					alertify.error(lang['global_error_report']);
				}

				loader.hide();
			}
		});

		var active = -1;
		var load = function(){
			active++;

			if (common.queue[active]) {
				common.queue[active].init(function(){
					load();
				});
			} else {
				plugins.showPlugins(function(){
					extentions.init(function(){
						common.check_update();
						common.menu.init();
						common.search.init();

						$(window).on('hashchange', common.hash).trigger('hashchange').on('resize', common.resize);

						// clear memory tinymce
						setInterval(function(){
							if (!tinyMCE) return false;
							$.each(tinyMCE.editors, function(i, el){
								if (el && !$('textarea#' + el.id, common.el.body).length) el.remove();
							});
						}, 30000);
					});
				});
			}
		};
		load();
	},
	menu:
	{
		init: function(){
			common.el.header.on('click', '.logo', function(){
				common.menu.open();
			});
			common.el.menu.on('click', '.menu a', function(){
				common.menu.close();
			}).on('click', '.overlay', function(){
				common.menu.close();
			});
		},
		open: function(){
			common.el.menu.addClass('show');
			common.el.header.addClass('openMenu');
			common.el.content.addClass('openMenu');

			setTimeout(function(){
				$('.search input', common.el.menu).focus();
				common.search.updateScroll();
			}, 210);
		},
		close: function(){
			common.el.menu.removeClass('show');
			common.el.header.removeClass('openMenu');
			common.el.content.removeClass('openMenu');
		}
	},
	search:
	{
		el: {},
		init: function()
		{
			var x = this;

			x.el.input = $('.search input', common.el.menu);
			x.el.result = $('.result', common.el.menu);

			x.template = {
				database: '',
				items: '',
				files: ''
			};
			x.template.database = $('.database .overview', x.el.result).html();
			$('.database .overview', x.el.result).empty();
			x.template.items = $('.items .overview', x.el.result).html();
			$('.items .overview', x.el.result).empty();
			x.template.files = $('.files .overview', x.el.result).html();
			$('.files .overview', x.el.result).empty();

			x.scrollbars = $('.scroll', x.el.result).map(function(){
				return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
			});

			x.handlers();
		},
		handlers: function()
		{
			var x = this;

			x.el.input.on('keyup', function(){
				x.val = $(this).val().trim();

				x.el.result.toggleClass('show', x.val.length > 1);

				if (x.val.length > 1) x.submit();
			});
			x.el.result.on('click', '.database .item', function(){
				var th = $(this);
				var id = +th.attr('data');

				if (id) {
					common.menu.close();
					location.hash = '/database';
					database.openPathToItem(id);
				}
			}).on('click', '.items .item', function(){
				var th = $(this);
				var id = +th.attr('data');

				if (id) {
					common.menu.close();
					location.hash = '/items';
					items.openPathToItem(id);
				}
			}).on('click', '.files .item', function(){
				var th = $(this);
				var id = +th.attr('data');

				if (id) {
					common.menu.close();
					location.hash = '/files';
					files.openPathToFile(id);
				}
			});
		},
		submit: function(val)
		{
			var x = this;

			$.post('?search/search', {val: x.val}, function(json){
				if (x.val !== json.val) return false;

				if (json.database.length) {
					var html = [];

					$.each(json.database, function(i, id){
						var template = m.template(x.template.database, {
							id: id,
							title: database.arr[id].private_title || lang['search_untitled'],
							image: '/qrs/getfile/' + database.arr[id].image + '/200/200'
						});

						html.push(template);
					});

					$('.database .overview', x.el.result).html(html.join(''));
					x.updateScroll();
				} else {
					$('.database .overview', x.el.result).html('<div class="item empty br3">' + lang['search_empty'] + '</div>');
				}

				if (json.items.length) {
					items.loadList(function(arr){
						var html = [];

						$.each(json.items, function(i, el){
							var parents = [];

							var get_parents = function(id){
								var parent = arr[id].parent;
								parents.unshift(parent);
								if (parent !== 0) get_parents(parent);
							};
							get_parents(el[0]);

							var template = m.template(x.template.items, {
								id: el[0],
								title: arr[el[0]].private_title || lang['search_untitled'],
								image: el[1] || '',
								path: $.map(parents, function(id){
									return arr[id].private_title;
								}).join(' / ')
							});

							html.push(template);
						});

						$('.items .overview', x.el.result).html(html.join(''));
						x.updateScroll();
					});
				} else {
					$('.items .overview', x.el.result).html('<div class="item empty br3">' + lang['search_empty'] + '</div>');
				}

				if (json.files.length) {
					files.loadList(function(arr){
						var html = [];

						$.each(json.files, function(i, el){
							var parents = [];

							var get_parents = function(id){
								parents.unshift(id);
								if (id !== '#') {
									var parent = arr.groups[id].parent;
									get_parents(parent);
								}
							};
							get_parents(arr.files[el[0]].parent);

							var template = m.template(x.template.files, {
								id: el[0],
								title: arr.files[el[0]].title || lang['search_untitled'],
								image: el[1],
								path: $.map(parents, function(id){
									return arr.groups[id].title;
								}).join(' / ')
							});

							html.push(template);
						});

						$('.files .overview', x.el.result).html(html.join(''));
						x.updateScroll();
					});
				} else {
					$('.files .overview', x.el.result).html('<div class="item empty br3">' + lang['search_empty'] + '</div>');
				}

				x.updateScroll();
			}, 'json');
		},
		updateScroll: function()
		{
			var x = this;

			$.each(x.scrollbars, function(i, el){
				el.update('relative');
			});
		}
	},
	check_update: function()
	{
		if (!users.get_access('settings', 'view')) return false;

		setTimeout(function(){
			$.get('?updates/check_update', function(json){
				if (json.status === 'MANUAL_UPDATE' || json.status === 'NEW_VERSION') {
					$('a.settings', common.el.header).addClass('warning');
					$('.section[data="update"]', settings.el.list).addClass('warning');
				}
			}, 'json');
		}, 10000);
	},
	progress:
	{
		el: {
			parent: $('#progress')
		},
		create: function(title, desc, length){
			common.progress.el.parent.html('\
				<div class="title">' + title + '</div>\
				<div class="desc">' + desc + '</div>\
				<div class="bar">\
					<p></p>\
					<div class="track animate"></div>\
				</div>\
			');

			common.progress.length = length;
			common.progress.progress = [];

			common.progress.el.bar = $('.bar', common.progress.el.parent);
			common.progress.el.p = $('p', common.progress.el.bar);
			common.progress.el.track = $('.track', common.progress.el.bar);

			common.progress.show();
		},
		set: function(key, val){
			common.progress.progress[key] = val;
			common.progress.edit();
		},
		edit: function(){
			var sum = 0;
			$.each(common.progress.progress, function(i, el){
				if (el) sum += Math.min(Math.max(el, 0), 1);
			});

			var part = Math.round(sum / common.progress.length * 100);

			common.progress.el.p.text(part + '%');
			common.progress.el.track.css({width: part + '%'});

			if (part == 100) {
				setTimeout(function(){
					common.progress.hide();
				}, 250);
			}
		},
		show: function(){
			common.progress.el.parent.addClass('show');
		},
		hide: function(){
			common.progress.el.parent.removeClass('show');
		}
	},
	hash: function()
	{
		oldhash = hash;
		hash = location.hash.replace(/^#\//, '').split('/');

		var x = window[hash[0]];
		if (typeof x === 'object') {
			$('.logo p', common.el.header).text(settings.arr.siteTitle + ' / ' + lang['section_' + hash[0]]);

			x.start();
			common.resize();
			common.menu.close();
		} else {
			location.hash = $('a', menu).attr('href');
		}
		$('a', menu).removeClass('active').filter('[href="#/' + hash.join('/') + '"]').addClass('active');
		$('a', common.el.header).removeClass('active').filter('[href="#/' + hash.join('/') + '"]').addClass('active');
	},
	resize: function()
	{
		ww = $(window).width();
		wh = $(window).height();
		wwi = window.innerWidth;
		whi = window.innerHeight;

		if (hash && hash[0] && window[hash[0]]) window[hash[0]].resize();
		if (files.openFiles) files.resize();
		common.search.updateScroll();
	}
};

var m = {
	report: function(ajax_url, ajax_data, ajax_response, alertOff){
		if (!alertOff) alertify.error(lang['global_error_report']);
		$.post(siteurl + 'qrs/report_error/', {message: 'Page: ' + location.href + '\nAjax URL: ' + ajax_url + '\nAjax Data: ' + JSON.stringify(ajax_data || {}) + '\nAjax Response: ' + (typeof ajax_response == 'string' ? ajax_response : $(ajax_response)[0].documentElement.innerHTML.trim()) + '\nLogged user: ' + users.arr[users.logged].fname + ' (Login: ' + users.arr[users.logged].login + ', Permissions: ' + users.arr[users.logged].access + ')'});
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
			}
		},
		get: function(key, time){
			if (this.support) {
				var value = localStorage[key];
				if (time) {
					var old_time = localStorage[key + '_time'] || 0;
					var new_time = new Date().getTime();
					return (new_time - old_time) / 1000 / 60 < time ? value : false;
				} else {
					return value;
				}
			} else {
				return false;
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
	preload: function(src, callback, error){
		var x = this;

		if (!src) return false;

		if (x.preload_array[src]) {
			var image = $('img', m.cache.el).filter('[src="' + src + '"]');
			if (callback && typeof callback == 'function') callback(image.get(0));
		} else {
			$('<img src="' + src + '" />').on('load', function(){
				x.preload_array[src] = true;
				if (callback && typeof callback == 'function') callback(this);
			}).on('error', function(e){
				if (error && typeof error == 'function') error(e);
			}).appendTo(m.cache.el);
		}
	},
	log: (function(){
		window.log = function(vars){
			console.log(vars);
		};
	})(),
	bench: function(callback){
		if (callback && typeof callback == 'function') {
			var date = new Date();
			callback();
			console.log('m.bench: ' + new Date() - date);
		} else {
			console.log('m.bench: callback function is undefined.');
		}
	},
	getScript: function(src, callback){
		var script = document.createElement('script');
		script.src = src;
		document.body.appendChild(script);

		script.onload = function(){
			callback();
		}

		return $(script);
	},
	getStyle: function(src, callback){
		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = src;
		document.body.appendChild(css);

		css.onload = function(){
			callback();
		}

		return $(css);
	},
	template: function(template, obj){
		var template = template;

		$.each(obj, function(i, v){
			var reg = new RegExp('{{' + i + '}}', 'g');
			template = template.replace(reg, v);
		});

		return template;
	}
};