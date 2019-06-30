var plugins = {
	mode: false,
	plugins_loaded: {},
	el: {
		parent: $('#plugins')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.form = $('.form', x.el.parent);
		x.el.upload = $('.upload', x.el.parent);

		x.el.plugins = $('.plugins', x.el.list);

		x.template = {
			item: x.el.plugins.html(),
			form: x.el.form.html()
		};
		x.el.plugins.empty();
		x.el.form.empty();

		x.handlers_list();
		x.handlers_form();

		x.upload.init();

		callback();
	},
	start: function()
	{
		var x = this;

		if (hash[1]) {
			var plugin = hash[1];

			loader.show();

			if (x.plugins_loaded[plugin] === undefined) {
				x.plugins_loaded[plugin] = {
					status: false, lang: {},
					js: false, css: false
				};

				var url = '?plugins/get_plugin_page', data = {alias: plugin};
				$.post(url, data, function(json){
					if (json.status === 'OK') {
						content.append(json.html);

						x.plugins_loaded[plugin].lang = json.lang;

						m.getScript(json.js, function(){
							x.plugins_loaded[plugin].js = true;
							x.plugin_page_load(plugin);
						});
						m.getStyle(json.css, function(){
							x.plugins_loaded[plugin].css = true;
							x.plugin_page_load(plugin);
						});
					} else {
						m.report(url, data, JSON.stringify(json));
						loader.hide();
					}
				}, 'json');
			} else {
				if (x.plugins_loaded[plugin].status) {
					window['plugin_' + plugin + '_page'].start();
				}
			}
		} else {
			x.el.parent.show().siblings().hide();
			x.drawList();
		}
	},
	plugin_page_load: function(plugin)
	{
		var x = this;

		if (x.plugins_loaded[plugin].js && x.plugins_loaded[plugin].css) {
			window['plugin_' + plugin + '_page'].init(function(){
				window['plugin_' + plugin + '_page'].lang = x.plugins_loaded[plugin].lang;
				x.plugins_loaded[plugin].status = true;
				$(window).trigger('hashchange');
			});
		}
	},
	handlers_list: function()
	{
		var x = this;

		x.el.plugins.on('click', '.setting', function(){
			var id = $(this).parent().attr('data');
			x.editPlugin(id);
		}).on('click', '.show', function(){
			var th = $(this).toggleClass('active');
			var id = $(this).parent().attr('data');
			x.editPluginShow(id, th.hasClass('active'));
		});
	},
	handlers_form: function()
	{
		var x = this;

		x.el.form.on('click', '.header .save', function(){
			x.savePlugin();
		}).on('click', '.header .save_close', function(){
			x.savePlugin('close');
		}).on('click', '.header .close', function(){
			x.closePlugin();
		});
	},
	loadList: function(callback)
	{
		var x = this;

		$.get('?plugins/get_list', function(json){
			x.arr = {};

			$.each(json, function(i, el){
				x.arr[el.id] = el;
			});

			callback(x.arr);
		}, 'json');
	},
	drawList: function()
	{
		var x = this;

		loader.show();

		x.loadList(function(){
			var html = [];

			$.each(x.arr, function(i, el){
				var template = x.template.item;

				template = template.replace('{{id}}', el.id);
				template = template.replace('{{image}}', el.image);
				template = template.replace('{{title}}', el.title.encode());
				template = template.replace('{{desc}}', el.desc.encode());
				template = template.replace('{{switch}}', ui.switch.html());

				html.push(template);
			});

			x.el.plugins.html(html.join(''));

			$('.plugin', x.el.plugins).each(function(){
				var th = $(this);
				var id = +th.attr('data');
				var status = x.arr[id].status;
				var show = x.arr[id].show;
				var sw = $('.ui-switch', th);

				if (status) th.addClass('active');
				if (show) $('.show', th).addClass('active');

				ui.switch.init(sw, {
					status: status,
					change: function(status){
						if (status) {
							th.addClass('active');
						} else {
							th.removeClass('active');
						}
						x.editPluginStatus(id, status);
					}
				});
			});

			loader.hide();
		});
	},
	editPluginStatus: function(id, status)
	{
		var x = this;

		if (x.arr[id].status === status) return false;

		var url = '?plugins/edit_status', data = {id: id, status: +status};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				x.arr[id].status = status;
				x.showPlugins();
				extentions.init();
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	editPluginShow: function(id, show)
	{
		var x = this;

		var url = '?plugins/edit_show', data = {id: id, show: +show};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				x.arr[id].show = show;
				x.showPlugins();
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	editPlugin: function(id)
	{
		var x = this;

		x.el.overlay.addClass('show');

		var url = '?plugins/get_plugin_settings', data = {id: id};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				x.mode = id;
				$.extend(x.arr[id], json.plugin);

				x.plugin_setting = {
					lang: {},
					fields: {},
					draw: function(){},
					action: function(){},
					save: function(){}
				};

				x.plugin_js_loaded = false;
				x.plugin_css_loaded = false;

				x.plugin_load(json);
			} else {
				m.report(url, data, JSON.stringify(json));
				x.el.overlay.removeClass('show');
			}
		}, 'json');
	},
	plugin_load: function(json)
	{
		var x = this;

		if (x.plugin_js_loaded === false) {
			x.plugin_js_loaded = 'loading';
			x.plugin_js = m.getScript(json.js, function(){
				x.plugin_js_loaded = true;
				x.plugin_load(json);
			});
		}
		if (x.plugin_css_loaded === false) {
			x.plugin_css_loaded = 'loading';
			x.plugin_css = m.getStyle(json.css, function(){
				x.plugin_css_loaded = true;
				x.plugin_load(json);
			});
		}

		if (x.plugin_js_loaded === true && x.plugin_css_loaded === true) {
			x.plugin_setting.lang = json.lang;
			x.plugin_setting.fields = $.parseJSON(json.plugin.fields || '{}');

			var form = x.plugin_setting.draw(json.html) || json.html;
			var template = x.template.form;

			template = template.replace('{{plugin_name}}', x.arr[x.mode].title.encode());
			template = template.replace('{{plugin_form}}', form);

			x.el.form.html(template);
			x.el.form.addClass('show');

			x.plugin_setting.action(x.el.form.find('.wrapper'));
		}
	},
	savePlugin: function(action)
	{
		var x = this;

		loader.show();

		var url = '?plugins/edit_fields', data = {id: x.mode, fields: x.plugin_setting.save(x.el.form.find('.wrapper'))};

		if (data.fields !== false) data.fields = JSON.stringify(data.fields || {});

		$.post(url, data, function(json){
			if (json.status === 'OK') {
				$.extend(x.arr, data);

				if (action === 'close') x.closePlugin();
			} else {
				m.report(url, data, JSON.stringify(json));
			}

			loader.hide();
		}, 'json');
	},
	closePlugin: function()
	{
		var x = this;

		x.mode = false;

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');

		setTimeout(function(){
			x.el.form.empty();
			x.plugin_js.remove();
			x.plugin_css.remove();
		}, 210);
	},
	showPlugins: function(callback)
	{
		var x = this;

		x.loadList(function(){
			var html = [];

			$.each(x.arr, function(i, el){
				if (el.status && el.show) {
					html.push('<a class="animate plugin plugin_' + el.alias + '" href="#/plugins/' + el.alias + '">' + el.image + '<p>' + el.title + '</p></a>');
				}
			});

			$('a.plugin', menu).remove();
			$('a', menu).eq(1).after(html.join(''));

			if (callback) callback();
		});
	},
	upload:
	{
		el: {},
		init: function(){
			var x = this;

			x.el.list = plugins.el.list;
			x.el.overlay = plugins.el.overlay;
			x.el.upload = plugins.el.upload;
			x.el.plugins = $('.plugins', x.el.upload);

			x.template = {};
			x.template.plugin = x.el.plugins.html();
			x.el.plugins.empty();

			x.el.list.on('click', '.header .add_plugin', function(){
				x.open();
			});

			x.el.upload.on('click', '.close', function(){
				x.close();
			});
		},
		open: function(){
			var x = this;

			x.el.overlay.addClass('show');

			var url = '?plugins/plugins_get_list';
			$.get(url, function(json){
				if (json.status === 'MYSQLDUMP_ERROR' || json.status === 'PHARDATA_ERROR' || json.status === 'UNKNOWN_HOST') {
					x.el.plugins.html('<div class="error">' + lang['settings_plugins_upload_error_' + json.status] + '</div>');
					x.el.upload.addClass('show');
				} else if (json.status === 'OK') {
					var html = $.map(json.plugins, function(el, alias){
						return m.template(x.template.plugin, {
							alias: alias,
							image: el.image,
							title: el.title,
							desc: el.desc
						});
					}).join('');

					x.el.plugins.html(html);
					x.el.upload.addClass('show');
				} else {
					m.report(url, {}, JSON.stringify(json));
					x.el.overlay.removeClass('show');
				}
			}, 'json');
		},
		close: function(){
			var x = this;

			x.el.upload.removeClass('show');
			setTimeout(function(){
				x.el.overlay.removeClass('show');
			}, 210);
		}
	},
	resize: function()
	{
		var x = this;

		if (hash[1]) {
			var plugin = window['plugin_' + hash[1] + '_page'];
			if (plugin) plugin.resize();
		} else {
			
		}
	}
};

common.queue.push(plugins);