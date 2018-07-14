var items = {
	// load to localStorage opened
	arr: {},
	sorting: [],
	mode: false, // false - form not open, 0 - add, id - edit
	opened: ['#'],
	timer: null,
	last_update: {items: false, sorting: false},
	el: {
		parent: $('#items')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.form = $('.form', x.el.parent);

		x.template = {};
		x.template.list_item = $('.overview', x.el.list).html();
		$('.overview', x.el.list).html('{{item}}');
		x.template.list_items = x.el.list.html();
		x.el.list.empty();
		x.template.form = x.el.form.html();
		x.el.form.empty();

		x.handlers_list();
		x.handlers_sortable();
		x.handlers_form();

		x.loadList(function(){
			callback();
		});
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
		x.loadDrawList();
	},
	handlers_list: function()
	{
		var x = this;

		x.el.list.on('click', '.header .title', function(){
			var parents = $(this).parents('.items');
			var index = parents.index() + 1;
			parents.nextAll().remove();
			x.opened.splice(index, x.opened.length - index);
			$('.item', parents).removeClass('open');
			common.resize();
		}).on('mouseover', '.header .title', function(){
			var th = $(this).parents('.items');
			th.nextAll().addClass('fade');
		}).on('mouseout', '.header .title', function(){
			var th = $(this).parents('.items');
			th.nextAll().removeClass('fade');
		}).on('click', '.header .menu p', function(){
			var th = $(this);
			var data = th.attr('data');
			var parent = th.parents('.items');

			if (data === 'select_all') {
				$('.item', parent).not('.hide').addClass('selected');
			}
			if (data === 'unselect_all') {
				$('.selected', parent).removeClass('selected');
			}
			if (data === 'enable_selected') {
				var ids = $('.item.selected', parent).map(function(){
					return +$(this).attr('data');
				}).get();
				x.statusItem(ids, 1);
			}
			if (data === 'disable_selected') {
				var ids = $('.item.selected', parent).map(function(){
					return +$(this).attr('data');
				}).get();
				x.statusItem(ids, 0);
			}
			if (data === 'clone_selected') {
				var ids = $('.item.selected', parent).map(function(){
					return +$(this).attr('data');
				}).get();
				x.cloneItems(ids, parent.attr('parent'));
			}
			if (data === 'remove_selected') {
				var selected = $('.item.selected', parent);
				x.removeItems(selected);
			}
		}).on('click', '.header .create', function(){
			var th = $(this);
			var parent = th.parents('.items');
			x.parent = parent.attr('parent');

			var next_parent = parent.next();
			next_parent.find('.item.open').removeClass('open').end().nextAll().remove();
			$('.item', x.el.list).removeClass('selected edited');

			x.addItem();
		}).on('click', '.item .select', function(){
			$(this).parent().toggleClass('selected');
		}).on('click', '.item .edit', function(){
			var th = $(this).parent();
			var id = +th.attr('data');
			var parent = th.parents('.items');
			x.parent = parent.attr('parent');

			var next_parent = parent.next();
			next_parent.find('.item.open').removeClass('open').end().nextAll().remove();
			$('.item', x.el.list).removeClass('selected edited');
			th.addClass('edited');

			x.editItem(id);
		}).on('click', '.item .info', function(e){
			var th = $(this);
			var parent = th.parent();
			var parents = th.parents('.items');

			if (e.ctrlKey) {
				parent.toggleClass('selected');
				return false;
			}

			if (parent.hasClass('open')) return false;

			var id = parent.attr('data');
			var index = parents.index() + 1;

			parent.addClass('open').siblings().removeClass('open');
			parents.nextAll('.items').remove();

			x.opened.splice(index, x.opened.length - index, id);
			x.drawList();
		});
	},
	handlers_sortable: function()
	{
		var x = this;

		var timer_open = null;
		var hover_to_parent = false;
		var sender_parents = false;
		var sender_id = false;
		var items_id = false;

		x.s = new ui.sortable(x.el.list, {
			items: '.item',
			exclude: '.empty',
			items_drop: '.item',
			items_drop_exclude: '.empty',
			many: '.selected',
			onStart: function(items){
				items_id = items.map(function(){
					return +$(this).attr('data');
				}).get();
				sender_parents = items.parents('.items');
				sender_id = sender_parents.attr('parent');

				if (items.hasClass('open')) {
					var index = sender_parents.index() + 1;

					items.removeClass('open');
					sender_parents.nextAll('.items').remove();
					x.opened.splice(index, x.opened.length - index);
				}
			},
			onUpdate: function(items){
				var parents = items.parents('.items');
				var parent = parents.attr('parent');

				if (hover_to_parent !== false) {// item drop on other item
					clearTimeout(timer_open); timer_open = null;

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr[sender_id].childs);
						if (find >= 0) x.arr[sender_id].childs.splice(find, 1);

						x.arr[el].parent = hover_to_parent.id;
					});

					x.arr[hover_to_parent.id].childs = items_id.concat(x.arr[hover_to_parent.id].childs);

					if (hover_to_parent.item.hasClass('open')) {
						hover_to_parent.item.parents('.items').next().find('.overview').prepend(items);
					} else {
						items.remove();
					}

					x.listUpdateEmpty();
					x.listUpdateCounts();
					x.listUpdateScrollbar();
					x.setSorting();

					return false;
				}

				if (sender_id === parent) {// item in this list
					x.arr[sender_id].childs = [];
					$('.item', parents).each(function(){
						var id = +$(this).attr('data');

						if (id) {
							x.arr[id].parent = sender_id;
							x.arr[sender_id].childs.push(id);
						}
					});

					x.listUpdateEmpty();
					x.listUpdateCounts();
					x.listUpdateScrollbar();
					x.setSorting();
				}

				if (sender_id !== parent) {// item move on other list
					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr[sender_id].childs);
						if (find >= 0) x.arr[sender_id].childs.splice(find, 1);
					});

					x.arr[parent].childs = [];
					$('.item', parents).each(function(){
						var id = +$(this).attr('data');

						if (id) {
							x.arr[id].parent = parent;
							x.arr[parent].childs.push(id);
						}
					});

					x.listUpdateEmpty();
					x.listUpdateCounts();
					x.listUpdateScrollbar();
					x.setSorting();
				}
			},
			onHover: function(parent){
				hover_to_parent = {id: parent.attr('data'), item: parent};

				clearTimeout(timer_open); timer_open = null;
				timer_open = setTimeout(function(){
					$('.info', parent).trigger('click');

					var interval = setInterval(function(){
						x.s.options.setPosition();
					}, 10);

					setTimeout(function(){
						clearInterval(interval); interval = null;
						x.s.options.setPosition();
					}, 210);
				}, 1000);
			},
			onLeave: function(){
				hover_to_parent = false;
				clearTimeout(timer_open); timer_open = null;
			}
		});
	},
	handlers_form: function()
	{
		var x = this;

		// header
		x.el.form.on('click', '.header .menu .language .lang', function(){
			var th = $(this);

			th.addClass('active').siblings().removeClass('active');

			x.lang.select(th.text(), x);
		}).on('click', '.header .menu .ext p', function(){
			$(this).toggleClass('active');
			$('.main', x.el.form).toggle();
			$('.extra', x.el.form).toggle();
		}).on('click', '.header .menu .groups p', function(){
			var th = $(this);
			x.group = +th.attr('data');

			x.lang.set(x);

			th.addClass('active').siblings().removeClass('active');
			$('.container.custom', x.el.form).remove();

			if (!x.group) return false;

			var settings = $.parseJSON(fields.arr.groups[x.group].settings);

			$('.container.system .field.tinymce', x.el.form).parent().toggleClass('hide', !settings.show_desc);
			$('.container.system .field.file', x.el.form).parent().toggleClass('hide', !settings.show_image);

			x.append_fields(settings.fields.split(';'));
		}).on('click', '.header .publish', function(){
			if (x.mode) x.statusItem([x.mode], +!x.arr[x.mode].show);
		}).on('click', '.header .save', function(){
			x.saveItem();
		}).on('click', '.header .save_close', function(){
			x.saveItem(true);
		}).on('click', '.header .close', function(){
			x.closeItem();
		});

		// extra
		x.el.form.on('click', '.extra .sharing p.facebook', function(){
			var link = $('#link', x.el.form).val();

			if (!link) {
				alertify.error(lang['items_form_sharing_error_link']);
				return false;
			}

			link = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(link);
			var t = window.open(link, "name", " height=400,width=600");
			return window.focus && t.focus(), !1;
		}).on('click', '.extra .publishing_facebook p', function(){
			var th = $(this);
			var data = th.attr('data');

			if (data === 'facebook_group') x.publishing_facebook_group();
			if (data === 'facebook_pages') {
				var page = th.attr('page');
				var token = th.attr('token');
				x.publishing_facebook_pages(page, token);
			}
		});

		// main
		x.el.form.on('blur', '.main #private_title', function(){
			var val = $(this).val().trim();
			var public_title = $('.main #public_title', x.el.form);
			var public_title_val = public_title.val().trim();
			if (!public_title_val) public_title.val(val);
		});
	},
	loadList: function(callback)
	{
		var x = this;

		var load_items = false;
		var load_sorting = false;

		var loadItems = function(){
			$.get('?items/get_list_items', function(json){
				x.arr = {};

				$.each(json, function(i, el){
					x.arr[el[0]] = {
						id: el[0],
						private_title: el[1],
						show: el[2] === 0 ? 0 : 1
					};
				});
				x.arr['#'] = {private_title: lang['items_root']};

				load_items = true;
				parse();
			}, 'json');
		};
		var loadSorting = function(){
			$.get('?items/get_list_sorting', function(json){
				x.sorting = [];
				$.each(json.sorting.split(';'), function(i, el){
					if (el) x.sorting.push(el.split(':'));
				});

				load_sorting = true;
				parse();
			}, 'json');
		};

		var parse = function(){
			if (load_items && load_sorting) {
				$.each(x.arr, function(i){
					x.arr[i].childs = [];
					x.arr[i].parent = '';
				});

				$.each(x.sorting, function(i, el){
					if (x.arr[el[0]] && x.arr[el[1]]) {
						x.arr[el[0]].parent = el[1];
						x.arr[el[1]].childs.push(+el[0]);
					}
				});
				$.each(x.arr, function(i, el){
					if (!el.parent && i !== '#') {
						x.arr['#'].childs.push(+i);
						x.arr[i].parent = '#';
					}
				});

				callback(x.arr);
			}
		};

		$.get('?items/get_last_update', function(json){
			if (json.lastUpdateItems === x.last_update.items) {
				load_items = true;
				parse();
			} else {
				x.last_update.items = json.lastUpdateItems;
				loadItems();
			}

			if (json.lastUpdateItemsSorting === x.last_update.sorting) {
				load_sorting = true;
				parse();
			} else {
				x.last_update.sorting = json.lastUpdateItemsSorting;
				loadSorting();
			}
		}, 'json');
	},
	loadDrawList: function()
	{
		var x = this;

		loader.show();

		x.loadList(function(){
			x.drawList();
			loader.hide();
		});
	},
	drawList: function()
	{
		var x = this;

		x.el.list.empty();

		$.each(x.opened, function(i, id){
			var child = $.map(x.arr[id].childs, function(el){
				if (el && x.arr[el]) {
					var disable = +x.arr[el].show ? '' : 'disable';
					var edited = x.mode == el ? 'edited' : '';
					var opened = x.opened[i+1] == el ? 'open' : '';

					return m.template(x.template.list_item, {
						id: el,
						class: [disable, edited, opened].join(' '),
						title: x.arr[el].private_title,
						count: x.getCount(el)
					});
				}
			});
			child = child.join('') || '<div class="item br3 empty">' + lang['items_empty'] + '</div>';

			var template = m.template(x.template.list_items, {
				parent: id,
				width: x.width,
				title: x.arr[id].private_title, 
				item: child
			});

			x.el.list.append(template);
		});

		$('.scroll', x.el.list).tinyscrollbar();

		common.resize();
	},
	getItemLink: function(alias, callback)
	{
		var x = this;

		var url = '?items/get_item_url', data = {id: x.mode};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				var urls = json.parents; urls.push(alias);
				urls = '/' + urls.join('/') + '/';

				var valid = false;
				var routing = $.parseJSON(settings.arr.routing || '{}');
				$.each(routing, function(i){
					var re = i.replace(/\//g, '\\/').replace(/\*/g, '[^\\/]+');
					var expr = new RegExp('^' + re + '\/?$', 'ig');

					var match = urls.match(expr);
					if (match && match[0]) {
						valid = true;
						return false;
					}
				});

				callback(valid ? location.origin + urls : false);
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		});
	},
	lang:
	{
		active: null,
		fields: null,
		getLangs: function()
		{
			return $.parseJSON(settings.arr['langFront'] || '{}');
		},
		setDefault: function()
		{
			var x = this;

			x.active = settings.arr['langFrontDefault'];
			x.fields = {};
			$.each(x.getLangs(), function(i){
				x.fields[i] = {
					public_title: '',
					meta_title: '',
					meta_desc: '',
					meta_keys: '',
					desc: '',
					image: '',
					fields: false
				};
			});
		},
		setValue: function(value, alias)
		{
			var x = this;

			$.each(value.langs(), function(i, el){
				if (x.fields[i]) x.fields[i][alias] = el;
			});
		},
		select: function(active, s, first)
		{
			var x = this;

			var arr = {};

			if (first) {
				arr = x.fields[active];
			} else {
				var old = x.set(s);

				arr = x.fields[x.active = active];
				arr.public_title = arr.public_title || old.public_title;
				arr.meta_title = arr.meta_title || old.meta_title;
				arr.meta_desc = arr.meta_desc || old.meta_desc;
				arr.meta_keys = arr.meta_keys || old.meta_keys;
				arr.desc = arr.desc || old.desc;
				arr.image = arr.image || old.image;
				arr.fields = arr.fields || {};

				if (s.group) {
					var settings = $.parseJSON(fields.arr.groups[s.group].settings);

					$.each(settings.fields.split(';'), function(i, id){
						arr.fields[id] = arr.fields[id] || old.fields[id] || '';
					});
				} else {
					$.each(old.fields, function(i, v){
						arr.fields[i] = arr.fields[i] || v || '';
					});
				}
			}

			$('#public_title', s.el.form).val(arr.public_title);
			$('#meta_title', s.el.form).val(arr.meta_title);
			$('#meta_desc', s.el.form).val(arr.meta_desc);
			$('#meta_keys', s.el.form).val(arr.meta_keys);
			fields.types.tinymce.item_add($('.container.system .field.tinymce .group', s.el.form).empty(), arr.desc);
			fields.types.file.item_add($('.container.system .field.file .group', s.el.form).empty(), arr.image, null, 'items');

			$('.container.custom', s.el.form).remove();
			var ids = [];
			if (s.group) {
				var settings = $.parseJSON(fields.arr.groups[s.group].settings);
				ids = settings.fields.split(';');
			} else {
				ids = $.map(arr.fields, function(el, i){return i;});
			}
			s.append_fields(ids);
		},
		set: function(s)
		{
			var x = this;

			var public_title = $('#public_title', s.el.form).val().trim();
			var meta_title = $('#meta_title', s.el.form).val().trim();
			var meta_desc = $('#meta_desc', s.el.form).val().trim();
			var meta_keys = $('#meta_keys', s.el.form).val().trim();
			var desc = fields.types.tinymce.item_save($('.container.system .field.tinymce .group', s.el.form));
			var image = fields.types.file.item_save($('.container.system .field.file .group', s.el.form));

			var json = {};
			$('.container.custom .field', s.el.form).each(function(){
				var th = $(this);
				var id = +th.attr('data');
				json[id] = (function(){
					return fields.types[fields.arr.fields[id].type].item_save(th.find('.group'));
				})();
			});

			x.fields[x.active] = {
				public_title: public_title,
				meta_title: meta_title,
				meta_desc: meta_desc,
				meta_keys: meta_keys,
				desc: desc,
				image: image,
				fields: json
			};

			return x.fields[x.active];
		}
	},
	addItem: function()
	{
		var x = this;

		x.mode = 0;
		x.group = 0;

		x.lang.setDefault();

		var template = m.template(x.template.form, {
			title: lang['items_form_title_add'],
			language: $.map(x.lang.getLangs(), function(title, alias){
				return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
			}).join(''),
			groups: $.map(fields.arr.groups['#'].childs, function(el){
				if (el && fields.arr.groups[el]) return '<p class="br3 animate1" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
			}).join('')
		});
		x.el.form.html(template);

		fields.types.tinymce.item_add($('.container.system .field.tinymce .group', x.el.form), '');
		fields.types.file.item_add($('.container.system .field.file .group', x.el.form), '', null, 'items');

		x.el.form.addClass('show');
		x.el.list.addClass('edited');

		setTimeout(function(){
			$('#private_title', x.el.form).focus();
		}, 210);

		common.resize();

		plugins.loadList(function(plugins){
			extentions.start('items_onCompleteForm');

			if (settings.arr.facebookToken) {
				$('.extra', x.el.form).append('<div class="container">\
					<div class="field checkbox">\
						<div class="head"><p>' + lang['items_form_input_publishing_facebook'] + '</p></div>\
						<div class="group publishing_facebook">\
							<textarea class="box br3 animate1" placeholder="Text for publishing..."></textarea>\
							<p class="animate1 br3" data="facebook_group">Facebook Group</p>\
							' + $.map($.parseJSON(settings.arr.facebookPages || '{}'), function(el, i){
								return '<p class="animate1 br3" data="facebook_pages" page="' + el.id + '" token="' + el.token + '">Facebook Page "' + el.title + '"</p>';
							}).join('') + '\
							<div class="clr"></div>\
						</div>\
					</div>\
				</div>');
			}
		});
	},
	editItem: function(id)
	{
		var x = this;

		loader.show();

		$.post('?items/get_item', {id: id}, function(json){
			if (json.status === 'OK') {
				var item = json.item;

				x.mode = id;
				x.group = fields.arr.groups[item.group] ? item.group : 0;

				x.lang.setDefault();

				var template = m.template(x.template.form, {
					title: sprintf(lang['items_form_title_edit'], [item.private_title]),
					language: $.map(x.lang.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					groups: $.map(fields.arr.groups['#'].childs, function(el){
						if (el && fields.arr.groups[el]) {
							var active = x.group == el ? ' active' : '';
							return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
						}
					}).join('')
				});
				x.el.form.html(template);

				$('.header .publish', x.el.form).removeClass('hide').toggleClass('active', !!item.show).find('.views').text(item.views || '');

				$('#private_title', x.el.form).val(item.private_title);
				$('#alias', x.el.form).val(item.alias);
				x.getItemLink(item.alias, function(link){
					if (link) $('#link', x.el.form).val(link).next().attr('href', link).removeClass('hide');
				});

				if (x.group) {
					var s = $.parseJSON(fields.arr.groups[x.group].settings);

					$('.container.system .field.tinymce', x.el.form).parent().toggleClass('hide', !s.show_desc);
					$('.container.system .field.file', x.el.form).parent().toggleClass('hide', !s.show_image);
				}

				x.lang.setValue(item.public_title, 'public_title');
				x.lang.setValue(item.meta_title, 'meta_title');
				x.lang.setValue(item.meta_desc, 'meta_desc');
				x.lang.setValue(item.meta_keys, 'meta_keys');
				x.lang.setValue(item.desc, 'desc');
				x.lang.setValue(item.image, 'image');
				x.lang.setValue(item.fields, 'fields');

				x.lang.select(x.lang.active, x, true);

				x.el.form.addClass('show');
				x.el.list.addClass('edited');

				common.resize();

				plugins.loadList(function(plugins){
					extentions.start('items_onCompleteForm');

					if (!settings.arr.facebookToken) {
						$('.extra', x.el.form).append('<div class="container">\
							<div class="field checkbox">\
								<div class="head"><p>' + lang['items_form_input_publishing_facebook'] + '</p></div>\
								<div class="group publishing_facebook">\
									<textarea class="box br3 animate1" placeholder="Text for publishing..."></textarea>\
									<p class="animate1 br3" data="facebook_group">Facebook Group</p>\
									' + $.map($.parseJSON(settings.arr.facebookPages || '{}'), function(el, i){
										return '<p class="animate1 br3" data="facebook_pages" page="' + el.id + '" token="' + el.token + '">Facebook Page "' + el.title + '"</p>';
									}).join('') + '\
									<div class="clr"></div>\
								</div>\
							</div>\
						</div>');
					}
				});

				loader.hide();
			} else {
				m.report('?items/get_item', {id: id}, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	saveItem: function(close)
	{
		var x = this;

		loader.show();

		var private_title = $('#private_title', x.el.form).val().trim();
		var alias = $('#alias', x.el.form).val().trim();

		var url = '?items/alias_item', data = {id: x.mode, alias: alias || private_title};
		$.post(url, data, function(json){
			if (json.status !== 'OK') {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
				return false;
			}

			x.lang.set(x);

			var public_title = [];
			var meta_title = [];
			var meta_desc = [];
			var meta_keys = [];
			var desc = [];
			var image = [];
			var fields = [];

			$.each(x.lang.fields, function(i, el){
				public_title.push('{' + i + '}:' + (el.public_title || ''));
				meta_title.push('{' + i + '}:' + (el.meta_title || ''));
				meta_desc.push('{' + i + '}:' + (el.meta_desc || ''));
				meta_keys.push('{' + i + '}:' + (el.meta_keys || ''));
				desc.push('{' + i + '}:' + (el.desc || ''));
				image.push('{' + i + '}:' + (el.image || ''));
				fields.push('{' + i + '}:' + JSON.stringify(el.fields || {}));
			});

			var data = {
				//show: x.mode ? x.arr[x.mode].show : link ? 0 : 1,
				private_title: private_title,
				public_title: public_title.join('\r\n'),
				alias: json.alias,
				meta_title: meta_title.join('\r\n'),
				meta_desc: meta_desc.join('\r\n'),
				meta_keys: meta_keys.join('\r\n'),
				desc: desc.join('\r\n'),
				image: image.join('\r\n'),
				fields: fields.join('\r\n'),
				group: x.group || 0
			};
			if (x.mode) {
				data.id = x.mode;
			} else {
				data.parent = x.parent;
			}

			var url = '?items/' + (x.mode ? 'edit' : 'add') + '_item';
			$.post(url, data, function(json){
				if (json.status === 'OK') {
					if (x.mode) {
						x.arr[x.mode].private_title = private_title;

						var item = $('.item#i' + x.mode, x.el.list);
						item.find('.title').text(private_title);
						if (item.hasClass('open')) $('.items[parent="' + x.mode + '"]', x.el.list).find('.header .title').text(private_title);

						if (close) {
							x.closeItem();
						} else {
							$('#alias', x.el.form).val(data.alias);
							$('.header .title', x.el.form).text(sprintf(lang['items_form_title_edit'], [private_title]));

							x.getItemLink(data.alias, function(link){
								if (link) $('#link', x.el.form).val(link).next().attr('href', link).removeClass('hide');
							});
						}

						loader.hide();
					} else {
						x.mode = json.id;

						x.arr[x.mode] = {
							id: x.mode,
							show: 0,
							private_title: private_title, 
							parent: x.parent,
							childs: []
						};
						x.arr[x.parent].childs.unshift(x.mode);

						x.getItemLink(data.alias, function(link){
							if (!link) x.statusItem([json.id], 1);

							if (close) {
								x.closeItem();
							} else {
								$('.header .title', x.el.form).text(sprintf(lang['items_form_title_edit'], [private_title]));
								$('#alias', x.el.form).val(data.alias);
								$('.header .publish', x.el.form).removeClass('hide');
								if (link) $('#link', x.el.form).val(link).next().attr('href', link).removeClass('hide');
							}

							x.el.list.empty();
							x.loadDrawList();
						});
					}
				} else {
					m.report(url, data, JSON.stringify(json));
					loader.hide();
				}
			}, 'json');
		}, 'json');
	},
	closeItem: function()
	{
		var x = this;

		x.mode = false;

		x.el.list.removeClass('edited');
		x.el.form.empty().removeClass('show');
		$('.item.edited', x.el.list).removeClass('edited');

		common.resize();
	},
	removeItems: function(elems)
	{
		var x = this;

		if (!elems.length) return false;

		var ids = elems.addClass('removed').map(function(){
			return +$(this).attr('data');
		}).get();

		alertify.confirm(lang['items_form_remove_items'], function(e){
			if (e) {
				loader.show();

				var url = '?items/remove_items', data = {ids: ids};
				$.post(url, data, function(json){
					if (json.status === 'OK') {
						x.el.list.empty();
						x.loadDrawList();
					}
				}, 'json');
			} else {
				elems.removeClass('removed');
			}
		});
	},
	statusItem: function(ids, status)
	{
		var x = this;

		if (!ids.length) return false;

		loader.show();

		var url = '?items/edit_item_status', data = {ids: ids, show: status};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				$.each(ids, function(i, id){
					x.arr[id].show = status;
					$('#i' + id, x.el.list).toggleClass('disable', !status);
					$('.header .publish', x.el.form).toggleClass('active', !!status);
				});
			} else {
				m.report(url, data, JSON.stringify(json));
			}

			loader.hide();
		}, 'json');
	},
	cloneItems: function(ids, parent) // [int], string
	{
		var x = this;

		if (!ids.length) return false;

		loader.show();

		var url = '?items/clone_items', data = {ids: ids, parent: parent};
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				x.el.list.empty();
				x.loadDrawList();
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	append_fields: function(ids)
	{
		var x = this;

		$.each(ids, function(i, id){
			var field = fields.arr.fields[id];

			if (!field) return true;

			var container = $('<div class="container custom">\
				<div class="field ' + field.type + '" data="' + id + '">\
					<div class="head"><p>' + field.private_title + '</p></div>\
					<div class="group"></div>\
				</div>\
			</div>').appendTo($('.main', x.el.form));

			fields.types[field.type].item_add($('.group', container), x.lang.fields[x.lang.active].fields[id], field.value, 'items', x.lang.active);
		});
	},
	getCount: function(id)
	{
		var x = this;

		var childs = 0;

		var child = function(id){
			if (!x.arr[id]) return false;
			$.each(x.arr[id].childs, function(i, el){
				if (x.arr[el]) {
					childs++;
					child(el);
				}
			});
		};
		child(id);

		return (childs ? childs : '');
	},
	openPathToItem: function(id)
	{
		var x = this;

		x.loadList(function(){
			var parents = [];
			var get_parent = function(id){
				var parent = x.arr[id].parent;
				parents.unshift(parent);
				if (parent !== '#') get_parent(parent);
			};
			get_parent(id);

			x.opened = parents;

			x.el.list.empty();
			x.drawList();

			var item = $('#i' + id, x.el.list).addClass('finded');
			var top = item.position().top;
			item.parents('.scroll').data('plugin_tinyscrollbar').update(top).update('relative');
			setTimeout(function(){
				item.removeClass('finded');
			}, 5000);
		});
	},
	listUpdateEmpty: function()
	{
		var x = this;

		$('.item.empty', x.el.list).remove();
		$('.overview', x.el.list).each(function(){
			var th = $(this);
			var child = th.children();

			if (!child.length) th.html('<div class="item br3 empty">' + lang['items_empty'] + '</div>');
		});
	},
	listUpdateCounts: function()
	{
		var x = this;

		$('.item', x.el.list).each(function(){
			var th = $(this);
			var id = th.attr('data');

			if (id) $('.count', th).text(x.getCount(id));
		});
	},
	listUpdateScrollbar: function()
	{
		var x = this;

		$('.scroll', x.el.list).each(function(){
			$(this).data('plugin_tinyscrollbar').update('relative');
		});
	},
	setSorting: function()
	{
		var x = this;

		var sort = [];

		var child = function(parent){
			if (!x.arr[parent]) return false;

			$.each(x.arr[parent].childs, function(i, el){
				if (el && x.arr[el]) {
					sort.push({id: el, parent: parent});
					child(el);
				}
			});
		};
		child('#');

		sorting.set('items', sort);
	},
	publishing_facebook_group: function()
	{
		var x = this;

		var link = $('#link', x.el.form).val();
		var text = $('.extra .publishing_facebook textarea', x.el.form).val().trim();
		var image = $('.container.system .field.file', x.el.form).eq(0).find('.image').attr('data'); image = files.arr.item[image].filename;

		if (!link) {
			alertify.error(lang['items_form_publishing_facebook_error_link']);
			return false;
		}

		loader.show();

		var data = {
			link: link,
			message: text,
			image: image
		};

		var url = '?items/publishing_facebook_group';
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				loader.hide();
				alertify.success(lang['items_form_publishing_facebook_success']);
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	publishing_facebook_pages: function(page, token)
	{
		var x = this;

		var link = $('#link', x.el.form).val();
		var text = $('.extra .publishing_facebook textarea', x.el.form).val().trim();
		var image = $('.container.system .field.file', x.el.form).eq(0).find('.image').attr('data'); image = files.arr.item[image].filename;

		if (!link) {
			alertify.error(lang['items_form_publishing_facebook_error_link']);
			return false;
		}

		loader.show();

		var data = {
			page: page,
			token: token,
			link: link,
			message: text,
			image: image
		};

		var url = '?items/publishing_facebook_pages';
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				loader.hide();
				alertify.success(lang['items_form_publishing_facebook_success']);
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		x.resize();
	},
	resize: function()
	{
		var x = this;

		if (x.mode === false) {
			var w_list = ww - 80 - 40;
			var count = w_list <= 1024 ? 2 : 3;
			x.width = w_list / count;
			var elems = $('.items', x.el.list).css({width: x.width});
			var length = elems.length;
			var left = -1 * (Math.max(count, length) - count) * x.width;
			x.el.list.css({transform: 'translateX(' + left + 'px)'});
		} else {
			var w_form = x.el.form.outerWidth();
			var w_list = ww - 80 - 40 - w_form;
			var count = w_list <= 450 ? 1 : 2;
			x.width = w_list / count;
			var elems = $('.items', x.el.list).css({width: x.width});
			var length = elems.length;
			var left = -1 * (Math.max(count, length) - count) * x.width;
			x.el.list.css({transform: 'translateX(' + left + 'px)'});
		}
	}
};

common.queue.push(items);