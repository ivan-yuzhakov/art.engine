var settings = {
	mode: false,
	plugins_loaded: {},
	el: {
		parent: $('#settings')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.form = $('.form', x.el.parent);

		x.template = {
			form: x.el.form.html()
		};
		x.el.form.empty();

		x.handlers_list();
		x.handlers_form();

		x.loadList(function(){
			callback();
		});
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
	},
	handlers_list: function()
	{
		var x = this;

		x.el.list.on('click', '.section', function(){
			var data = $(this).attr('data');
			x.editSection(data);
		});
	},
	handlers_form: function()
	{
		var x = this;

		x.el.form.on('click', '.header .save', function(){
			x.saveSection();
		}).on('click', '.header .save_close', function(){
			x.saveSection('close');
		}).on('click', '.header .close', function(){
			x.closeSection();
		});
	},
	loadList: function(callback)
	{
		var x = this;

		$.get('?settings/get_list', function(json){
			x.arr = json;

			callback(x.arr);
		}, 'json');
	},
	editSection: function(section)
	{
		var x = this;

		x.el.overlay.addClass('show');

		x.loadList(function(){
			x.mode = section;

			var template = m.template(x.template.form, {
				title: lang['settings_' + x.mode + '_title'],
				form: '<div class="' + x.mode + '">' + x.sections[x.mode].html() + '</div>'
			});

			x.el.form.html(template);
			x.el.form.addClass('show');

			x.sections[x.mode].actions($('.' + x.mode, x.el.form));
		});
	},
	saveSection: function(action)
	{
		var x = this;

		loader.show();

		var url = '?settings/edit_settings', data = x.sections[x.mode].save($('.' + x.mode, x.el.form));

		$.post(url, data, function(json){
			if (json.status === 'OK') {
				$.extend(x.arr, data);

				if (action === 'close') x.closeSection();
			} else {
				m.report(url, data, JSON.stringify(json));
			}

			loader.hide();
		}, 'json');
	},
	closeSection: function()
	{
		var x = this;

		x.mode = false;

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');

		setTimeout(function(){
			x.el.form.empty();
		}, 210);
	},
	sections:
	{
		global:
		{
			html: function(){
				var html = '';

				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_global_site_title'] + '</p></div>\
						<div class="group">\
							<input id="siteTitle" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_global_site_desc'] + '</p></div>\
						<div class="group">\
							<input id="siteDescription" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_global_site_keywords'] + '</p></div>\
						<div class="group">\
							<input id="siteKeywords" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<div class="field file">\
						<div class="head"><p>' + lang['settings_global_site_image'] + '</p></div>\
						<div class="group"></div>\
					</div>\
				</div>';
				html += '<div class="container">\
					<div class="field">\
						<div class="head"><p>' + lang['settings_global_https_rewrite'] + '</p></div>\
						<div class="group switch">' + ui.switch.html() + '</div>\
					</div>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_global_cache_time'] + '</p></div>\
						<div class="group">\
							<input id="cacheTime" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';

				return html;
			},
			actions: function(form){
				$('#siteTitle', form).val(settings.arr.siteTitle);
				$('#siteDescription', form).val(settings.arr.siteDescription);
				$('#siteKeywords', form).val(settings.arr.siteKeywords);
				$('#cacheTime', form).val(settings.arr.cacheTime);

				fields.types.file.item_add($('.field.file .group', form), +settings.arr.siteImage, null, 'settings');

				var sw = $('.switch .ui-switch', form);

				ui.switch.init(sw, {
					status: !!+settings.arr.httpsRewrite,
					text: lang['settings_global_https_rewrite_desc']
				});
			},
			save: function(form){
				return {
					siteTitle: $('#siteTitle', form).val().trim() || 'Vortex Engine',
					siteDescription: $('#siteDescription', form).val().trim(),
					siteKeywords: $('#siteKeywords', form).val().trim(),
					siteImage: fields.types.file.item_save($('.field.file .group', form)),
					httpsRewrite: +ui.switch.get($('.switch .ui-switch', form)),
					cacheTime: $('#cacheTime', form).val().trim()
				};
			}
		},
		files:
		{
			html: function(){
				var html = '';

				html += '<div class="button br3" data="image_clear_cache">' + lang['settings_files_image_clear_cache'] + '</div>';
				html += '<div class="button br3" data="image_reset_size">' + lang['settings_files_image_reset_size'] + '</div>';
				html += '<div class="clr"></div>';
				html += '<div class="switch">' + ui.switch.html() + '</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_files_image_upload_resize_w'] + '</p></div>\
						<div class="group">\
							<input id="imageUploadResizeW" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_files_image_upload_resize_h'] + '</p></div>\
						<div class="group">\
							<input id="imageUploadResizeH" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_files_image_upload_resize_q'] + '</p></div>\
						<div class="group">\
							<input id="imageUploadResizeQ" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';

				return html;
			},
			actions: function(form){
				$('#imageUploadResizeW', form).val(settings.arr.imageUploadResizeW);
				$('#imageUploadResizeH', form).val(settings.arr.imageUploadResizeH);
				$('#imageUploadResizeQ', form).val(settings.arr.imageUploadResizeQ);

				form.on('click', '.button', function(){
					var data = $(this).attr('data');

					loader.show();

					var url = '?settings/' + data;
					$.get(url, function(json){
						if (json.status !== 'OK') m.report(url, {}, JSON.stringify(json));

						loader.hide();
					}, 'json');
				});

				var sw = $('.switch .ui-switch', form);

				ui.switch.init(sw, {
					status: !!+settings.arr.imageUploadResize,
					change: function(status){
						$('.field', form).toggle(status);
					},
					text: lang['settings_files_image_upload_resize']
				});
			},
			save: function(form){
				return {
					imageUploadResize: +ui.switch.get($('.switch .ui-switch', form)),
					imageUploadResizeW: +$('#imageUploadResizeW', form).val().trim() || 0,
					imageUploadResizeH: +$('#imageUploadResizeH', form).val().trim() || 0,
					imageUploadResizeQ: +$('#imageUploadResizeQ', form).val().trim() || 100
				};
			}
		},
		languages:
		{
			html: function(){
				var html = '';

				html += '<div class="switch">' + ui.switch.html() + '</div>';
				html += '<div class="add">' + lang['settings_languages_add'] + '</div>';

				return html;
			},
			actions: function(form){
				var sw = $('.switch .ui-switch', form);

				ui.switch.init(sw, {
					status: !!+settings.arr.languagesUseDefaultLang,
					change: function(status){
						
					},
					text: lang['settings_languages_use_default_lang']
				});

				//
				var lang_front_add = $('.add', form);

				var langFront = settings.arr.langFront || '{"eng": "English"}';
				var langFrontDefault = settings.arr.langFrontDefault || 'eng';

				var append_field = function(alias, title, isDefault){
					lang_front_add.before('<div class="field' + (isDefault ? ' checked' : '') + (alias == 'eng' ? ' disable' : '') + '">\
						<div class="drag">' + icons.drag + '</div>\
						<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"/></svg></div>\
						<div class="select" title="' + lang['settings_languages_default'] + '">' + icons.select_empty + icons.select_checked + '</div>\
						<div class="group">\
							<input type="text" class="br3 box animate1 alias" value="' + alias + '" placeholder="' + lang['settings_languages_input_alias'] + '"' + (alias == 'eng' ? ' disabled' : '') + '>\
							<input type="text" class="br3 box animate1 title" value="' + title + '" placeholder="' + lang['settings_languages_input_title'] + '"' + (alias == 'eng' ? ' disabled' : '') + '>\
						</div>\
					</div>');

					form.sortable({axis: 'y', items: '.field:not(.disable)', handle: '.drag'});
				};

				$.each($.parseJSON(langFront), function(i){
					append_field(i, this, langFrontDefault == i);
				});

				form.on('click', '.remove', function(){
					var parent = $(this).parent();
					var isChecked = parent.hasClass('checked');
					$(this).parent().remove();
					if (isChecked) {
						//todo
					}
				}).on('click', '.select', function(){
					$(this).parent().addClass('checked').siblings().removeClass('checked');
				}).on('click', '.add', function(){
					append_field('', '', false);
				});
			},
			save: function(form){
				var json = {}, data = {};

				$('.field', form).each(function(){
					var th = $(this);
					var isDefault = th.hasClass('checked');
					var alias = $('.alias', th).val().trim().toLowerCase().replace(/[^a-z]/g, '');
					var title = $('.title', th).val().trim().replace(/[^a-zA-Zа-яА-ЯЁё]/g, '');

					if (alias && title) json[alias] = title;
					if (isDefault) data['langFrontDefault'] = alias;
				});
				data['langFront'] = JSON.stringify(json);
				data['langFrontDefault'] = data['langFrontDefault'] || 'eng';
				data['languagesUseDefaultLang'] = +ui.switch.get($('.switch .ui-switch', form));

				return data;
			}
		},
		routing:
		{
			html: function(){
				var html = '';

				html += '<div class="add">' + lang['settings_routing_add'] + '</div>';

				return html;
			},
			actions: function(form){
				var routing_add = $('.add', form);

				var routes = settings.arr.routing || '{"/":["index",true,true]}';

				var append_field = function(url, template, caching, sitemap, disable){
					var sitemap = sitemap === undefined ? true : sitemap;
					routing_add.before('<div class="field' + (disable ? ' disable' : '') + (caching ? ' caching' : '') + (sitemap ? ' sitemap' : '') + '">\
						' + (disable ? '' : '<div class="drag">' + icons.drag + '</div>') + '\
						<div class="select caching" data="caching" title="' + lang['settings_routing_cache'] + '">' + icons.select_empty + icons.select_checked + '</div>\
						<div class="remove">' + icons.remove + '</div>\
						<div class="select sitemap" data="sitemap" title="' + lang['settings_routing_sitemap'] + '">' + icons.select_empty + icons.select_checked + '</div>\
						<div class="group">\
							<input type="text" class="br3 box animate1 url" value="' + url + '" placeholder="' + lang['settings_routing_url'] + ' /news/*/"' + (disable ? ' disabled' : '') + '>\
							<input type="text" class="br3 box animate1 template" value="' + template + '" placeholder="' + lang['settings_routing_template'] + '"' + (disable ? ' disabled' : '') + '>\
						</div>\
					</div>');

					form.sortable({axis: 'y', items: '.field:not(.disable)', handle: '.drag'});
				};

				$.each($.parseJSON(routes), function(i, el){
					append_field(i, el[0], el[1], el[2], i === '/');
				});

				form.on('click', '.remove', function(){
					var parent = $(this).parent();
					$(this).parent().remove();
				}).on('click', '.add', function(){
					append_field('', '', true, true);
				}).on('click', '.select', function(){
					var th = $(this);
					var data = th.attr('data');
					$(this).parent().toggleClass(data);
				});
			},
			save: function(form){
				var json = {}, data = {};

				$('.field', form).each(function(){
					var th = $(this);
					var caching = th.hasClass('caching');
					var sitemap = th.hasClass('sitemap');
					var url = $('.url', th).val().trim().toLowerCase();
					var template = $('.template', th).val().trim();

					if (url && template) json[url] = [template, caching, sitemap];
				});
				data['routing'] = JSON.stringify(json);

				return data;
			}
		},
		constants:
		{
			html: function(){
				var html = '';

				html += '<div class="items"></div>';
				html += '<div class="add">' + lang['settings_constants_add'] + '</div>';

				return html;
			},
			actions: function(form){
				var x = this;

				var $items = $('.items', form);
				var $add = $('.add', form);

				var langFront = $.parseJSON(settings.arr.langFront);
				var constants = $.parseJSON(settings.arr.constants); // {"alias":{"eng":"value", ...}, ...}

				var append = function(alias, values){
					var item = $('<div class="item">\
						<div class="alias box"><input class="box br3 animate1" type="text" placeholder="' + lang['settings_constants_ph_alias'] + '"></div>\
						<div class="values box"></div>\
						<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
					</div>');

					$('.alias input', item).val(alias);
					$.each(langFront, function(i){
						var value = $('<label data="' + i + '">\
							<input class="box br3 animate1" type="text" placeholder="' + lang['settings_constants_ph_value'] + '">\
							<p>' + i + '</p>\
						</label>');

						if (values !== false) $('input', value).val(values[i] || '');

						$('.values', item).append(value);
					});

					$items.prepend(item);
				};

				$.each(constants, function(alias, values){
					append(alias, values);
				});

				$add.on('click', function(){
					append('', false);
				});
				$items.on('click', '.remove', function(){
					$(this).parent().remove();
				});

				setTimeout(function(){
					if (!$('.item', $items).length) append('', false);
				}, 210);
			},
			save: function(form){
				var x = this;

				var json = {};

				$('.item', form).each(function(){
					var th = $(this);
					var alias = $('.alias input', th).val().trim();

					if (alias) {
						var data = {};

						$('label', th).each(function(){
							var th = $(this);
							var lang = th.attr('data');
							var value = $('input', th).val().trim();

							data[lang] = value;
						});

						json[alias] = data;
					}
				});

				return {constants: JSON.stringify(json)};
			}
		},
		ga:
		{
			html: function(){
				var html = '';

				html += '<div class="switch">' + ui.switch.html() + '</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_ga_tracking_id'] + '</p></div>\
						<div class="group">\
							<input id="googleAnalyticsTracking" class="br3 box animate1" type="text" value="" placeholder="UA-00000000-0">\
						</div>\
					</label>\
				</div>';
				/*html += '<div class="field" variable="googleAnalyticsLogin" style="display:none;">\
					<label>' + lang['settings_ga_login'] + '</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['googleAnalyticsLogin'].encode() + '">\
					</div>\
				</div>';
				html += '<div class="field" variable="googleAnalyticsPassword" style="display:none;">\
					<label>' + lang['settings_ga_password'] + '</label>\
					<div class="group">\
						<input type="password" class="box" value="' + settings.arr['googleAnalyticsPassword'].encode() + '">\
					</div>\
				</div>';
				html += '<div class="field" variable="googleAnalyticsId" style="display:none;">\
					<label>' + lang['settings_ga_id'] + '</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['googleAnalyticsId'].encode() + '">\
					</div>\
				</div>';*/

				return html;
			},
			actions: function(form){
				$('#googleAnalyticsTracking', form).val(settings.arr.googleAnalyticsTracking);

				var sw = $('.switch .ui-switch', form);

				ui.switch.init(sw, {
					status: !!+settings.arr.googleAnalyticsUse,
					change: function(status){
						$('.field', form).toggle(status);
					},
					text: lang['settings_ga_use']
				});
			},
			save: function(form){
				return {
					googleAnalyticsUse: +ui.switch.get($('.switch .ui-switch', form)),
					googleAnalyticsTracking: $('#googleAnalyticsTracking', form).val().trim()
				};
			}
		},
		facebook:
		{
			html: function(){
				var html = '';

				html += '<div class="desc">' + lang['settings_facebook_app_desc'] + '</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_facebook_app_id'] + '</p></div>\
						<div class="group">\
							<input id="facebookAppID" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_facebook_app_secret'] + '</p></div>\
						<div class="group">\
							<input id="facebookAppSecret" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_facebook_group_id'] + '</p></div>\
						<div class="group">\
							<input id="facebookGroupId" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="button br3">' + lang['settings_facebook_auth'] + '</div>';

				return html;
			},
			actions: function(form){
				$('#facebookAppID', form).val(settings.arr.facebookAppID);
				$('#facebookAppSecret', form).val(settings.arr.facebookAppSecret);
				$('#facebookGroupId', form).val(settings.arr.facebookGroupId);

				form.on('click', '.button', function(){
					loader.show();

					var url = '?settings/facebook_auth';
					var data = {
						app_id: $('#facebookAppID', form).val().trim(),
						app_secret: $('#facebookAppSecret', form).val().trim()
					};
					$.post(url, data, function(json){
						if (json.status === 'OK') {
							settings.saveSection();
							window.open(json.link, 'example', 'width=600,height=400');
						} else {
							m.report(url, data, JSON.stringify(json));
						}

						loader.hide();
					}, 'json');
				});
			},
			save: function(form){
				return {
					facebookAppID: $('#facebookAppID', form).val().trim(),
					facebookAppSecret: $('#facebookAppSecret', form).val().trim(),
					facebookGroupId: $('#facebookGroupId', form).val().trim()
				};
			}
		},
		twitter:
		{
			html: function(){
				var html = '';

				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_twitter_site'] + '</p></div>\
						<div class="group">\
							<input id="twitterSite" class="br3 box animate1" type="text" value="" placeholder="@username">\
						</div>\
					</label>\
				</div>';
				/*html += '<div class="field" variable="twitterConsumerKey" style="display:none;">\
					<label>Consumer Key</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['twitterConsumerKey'].encode() + '">\
					</div>\
				</div>';
				html += '<div class="field" variable="twitterConsumerSecret" style="display:none;">\
					<label>Consumer Secret</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['twitterConsumerSecret'].encode() + '">\
					</div>\
				</div>';
				html += '<div class="field" variable="twitterOauthToken" style="display:none;">\
					<label>Access Token</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['twitterOauthToken'].encode() + '">\
					</div>\
				</div>';
				html += '<div class="field" variable="twitterOauthSecret" style="display:none;">\
					<label>Access Token Secret</label>\
					<div class="group">\
						<input type="text" class="box" value="' + settings.arr['twitterOauthSecret'].encode() + '">\
					</div>\
				</div>';*/

				return html;
			},
			actions: function(form){
				$('#twitterSite', form).val(settings.arr.twitterSite);
			},
			save: function(form){
				return {
					twitterSite: $('#twitterSite', form).val().trim()
				};
			}
		},
		instagram:
		{
			html: function(){
				var html = '';

				html += '<div class="desc">' + lang['settings_instagram_access_token_desc'] + '</div>';
				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_instagram_access_token'] + '</p></div>\
						<div class="group">\
							<input id="instagramAccessToken" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';

				return html;
			},
			actions: function(form){
				$('#instagramAccessToken', form).val(settings.arr.instagramAccessToken);
			},
			save: function(form){
				return {
					instagramAccessToken: $('#instagramAccessToken', form).val().trim()
				};
			}
		},
		maintenance:
		{
			html: function(){
				var html = '';

				html += '<div class="switch">' + ui.switch.html() + '</div>';
				html += '<div class="button br3" data="clear_cache">' + lang['settings_maintenance_clr_template'] + '</div>';
				html += '<div class="button br3" data="create_backup">' + lang['settings_maintenance_create_backup'] + '</div>';

				return html;
			},
			actions: function(form){
				var sw = $('.switch .ui-switch', form);

				ui.switch.init(sw, {
					status: !!+settings.arr.maintenanceMode,
					change: function(status){
						$('.field', form).toggle(status);
					},
					text: lang['settings_maintenance_mode']
				});

				form.on('click', '.button', function(){
					var data = $(this).attr('data');

					if (data === 'clear_cache') {
						loader.show();

						var url = '?settings/clear_cache_template';
						$.get(url, function(json){
							if (json.status !== 'OK') m.report(url, {}, JSON.stringify(json));

							loader.hide();
						}, 'json');
					}

					if (data === 'create_backup') {
						loader.show();

						var url = '?settings/create_backup';
						$.get(url, function(json){
							if (json.status === 'FAIL_MDUMP') {
								alertify.error(json.error);
							} else if (json.status !== 'OK') {
								m.report(url, {}, JSON.stringify(json));
							}

							loader.hide();
						}, 'json');
					}
				});
			},
			save: function(form){
				return {
					maintenanceMode: +ui.switch.get($('.switch .ui-switch', form))
				};
			}
		},
		update:
		{
			html: function(){
				var html = '';

				html += '<div class="container">\
					<label class="field text">\
						<div class="head"><p>' + lang['settings_update_server'] + '</p></div>\
						<div class="group">\
							<input id="updateServerCore" class="br3 box animate1" type="text" value="">\
						</div>\
					</label>\
				</div>';
				html += '<div class="check br3 animate1">' + lang['settings_update_check'] + '</div>';

				return html;
			},
			actions: function(form){
				$('#updateServerCore', form).val(settings.arr.updateServerCore);

				form.on('click', '.check', function(){
					var th = $(this);

					if (th.hasClass('loader')) return false;
					th.addClass('loader');

					th.nextAll().remove();

					$.get('?updates/check_update', function(json){
						if (json.status === 'MYSQLDUMP_ERROR') {
							th.after('<div class="result not br3">' + lang['settings_update_MYSQLDUMP_ERROR'] + '</div>');
						} else if (json.status === 'PHARDATA_ERROR') {
							th.after('<div class="result not br3">' + lang['settings_update_PHARDATA_ERROR'] + '</div>');
						} else if (json.status === 'VERSION_NOT_FOUND') {
							th.after('<div class="result not br3">' + lang['settings_update_VERSION_NOT_FOUND'] + '</div>');
						} else if (json.status === 'UPDATES_NOT_FOUND') {
							th.after('<div class="result not br3">' + lang['settings_update_UPDATES_NOT_FOUND'] + '</div>');
						} else if (json.status === 'MANUAL_UPDATE') {
							th.after('<div class="result new br3">\
								<h1>' + lang['settings_update_MANUAL_UPDATE'] + '</h1>\
								<div class="button br3 animate1" style="display:none;">' + lang['settings_update_button'] + '</div>\
								<p>' + lang['settings_update_current_version'] + ': ' + json.version_current + '</p>\
								<p>' + lang['settings_update_new_version'] + ': ' + json.version_new + '</p>\
							</div>');
						} else if (json.status === 'NEW_VERSION') {
							var desc = json.desc.length ? '<div class="desc"><p>- ' + json.desc.join('</p><p>- ') + '</p></div>' : '';
							th.after('<div class="result new br3">\
								<h1>' + lang['settings_update_NEW_VERSION'] + '</h1>\
								<div class="button br3 animate1">' + lang['settings_update_button'] + '</div>\
								<div class="version">\
									<p>' + lang['settings_update_current_version'] + ': ' + json.version_current + '</p>\
									<p>' + lang['settings_update_new_version'] + ': ' + json.version_new + '</p>\
								</div>\
								' + desc + '\
							</div>');
						} else {
							th.after('<div class="result not br3">' + lang['settings_update_UNKNOWN_HOST'] + '</div>');
						}

						th.removeClass('loader');
					}, 'json');
				}).on('click', '.button', function(){
					var progress = {
						el: {},
						steps: 5,
						init: function(callback){
							var x = this;

							x.el.parent = $('<div id="update_progress" class="animate2">').appendTo('body');

							x.el.parent.append('<div class="wrapper">\
								<div class="bar br3"><p class="animate2"></p></div>\
								<div class="text"></div>\
							</div>');

							setTimeout(function(){
								x.el.parent.addClass('show');

								setTimeout(function(){
									callback();
								}, 210);
							}, 10);
						},
						progress: function(step, callback){
							var x = this;

							var p = 100 / x.steps * step;

							$('.bar p', x.el.parent).css({width: p + '%'});

							setTimeout(function(){
								callback();
							}, 210);
						},
						text: function(text){
							var x = this;

							$('.text', x.el.parent).text(text);
						}
					};

					var load_update = function(){
						progress.text(lang.settings_update_progress_load_update);
						var url = '?updates/load_update';
						$.get(url, function(json){
							if (json.status === 'OK') {
								progress.progress(1, function(){
									backup();
								});
							} else {
								m.report(url, {}, JSON.stringify(json));
							}
						}, 'json');
					};
					var backup = function(){
						progress.text(lang.settings_update_progress_backup);
						var url = '?updates/backup';
						$.get(url, function(json){
							if (json.status === 'OK') {
								progress.progress(2, function(){
									update_files();
								});
							} else {
								m.report(url, {}, JSON.stringify(json));
							}
						}, 'json');
					};
					var update_files = function(){
						progress.text(lang.settings_update_progress_update_files);
						var url = '?updates/update_files';
						$.get(url, function(json){
							if (json.status === 'OK') {
								progress.progress(3, function(){
									update_db();
								});
							} else {
								m.report(url, {}, JSON.stringify(json));
							}
						}, 'json');
					};
					var update_db = function(){
						progress.text(lang.settings_update_progress_update_db);
						var url = '?updates/update_db';
						$.get(url, function(json){
							if (json.status === 'OK') {
								progress.progress(4, function(){
									update_core();
								});
							} else {
								m.report(url, {}, JSON.stringify(json));
							}
						}, 'json');
					};
					var update_core = function(){
						progress.text(lang.settings_update_progress_update_core);
						var url = '?updates/update_core';
						$.get(url, function(json){
							if (json.status === 'OK') {
								progress.progress(5, function(){
									setTimeout(function(){
										location.reload(true);
									}, 2000);
								});
							} else {
								m.report(url, {}, JSON.stringify(json));
							}
						}, 'json');
					};

					progress.init(function(){
						load_update();
					});
				});

				$('.check', form).trigger('click');
			},
			save: function(form){
				return {
					updateServerCore: $('#updateServerCore', form).val().trim()
				};
			}
		}
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
	},
	resize: function()
	{
		var x = this;
	}
};

common.queue.push(settings);