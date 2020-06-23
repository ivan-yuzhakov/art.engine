var items = {
	// load to localStorage opened
	arr: {},
	sorting: [],
	mode: false, // false - form not open, 0 - add, id - edit
	opened: [0],
	timer: null,
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
			x.drawList(function(){
				callback();
			});
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
				x.removeItems(selected, +parent.attr('parent'));
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

			var valid = x.mode === id;
			if (!valid) {
				if (x.mode) x.closeItem('reedit');
				x.editItem(id);
			}
		}).on('click', '.item .info', function(e){
			var th = $(this);
			var parent = th.parent();
			var parents = th.parents('.items');

			if (e.ctrlKey) {
				parent.toggleClass('selected');
				return false;
			}

			if (parent.hasClass('open')) return false;

			var id = +parent.attr('data');
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
				hover_to_parent = false;
				items_id = items.map(function(){
					return +$(this).attr('data');
				}).get();
				sender_parents = items.parents('.items');
				sender_id = +sender_parents.attr('parent');

				if (items.hasClass('open')) {
					var index = sender_parents.index() + 1;

					items.removeClass('open');
					sender_parents.nextAll('.items').remove();
					x.opened.splice(index, x.opened.length - index);
				}
			},
			onUpdate: function(items){
				var parents = items.parents('.items');
				var parent = +parents.attr('parent');

				if (hover_to_parent !== false) {// item drop on other item
					clearTimeout(timer_open); timer_open = null;

					var edited = [];
					edited.push([sender_id, 'childs']);
					edited.push([hover_to_parent.id, 'childs']);

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr[sender_id].childs);
						if (find >= 0) {
							x.arr[sender_id].childs.splice(find, 1);
						}

						x.arr[el].parent = hover_to_parent.id;
						edited.push([el, 'parent']);
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
					x.setSorting(edited);

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
					x.setSorting([[sender_id, 'childs']]);
				}

				if (sender_id !== parent) {// item move on other list
					var edited = [];
					edited.push([sender_id, 'childs']);
					edited.push([parent, 'childs']);

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr[sender_id].childs);
						if (find >= 0) x.arr[sender_id].childs.splice(find, 1);
						edited.push([el, 'parent']);
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
					x.setSorting(edited);
				}
			},
			onHover: function(parent){
				hover_to_parent = {id: +parent.attr('data'), item: parent};

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

			if (!x.group) {
				$('.container.system .field.tinymce', x.el.form).parent().addClass('hide');
				$('.container.system .field.file', x.el.form).parent().addClass('hide');
				return false;
			}

			var settings = $.parseJSON(fields.arr.groups[x.group].settings);

			$('.container.system .field.tinymce', x.el.form).parent().toggleClass('hide', !settings.show_desc);
			$('.container.system .field.file', x.el.form).parent().toggleClass('hide', !settings.show_image);

			x.append_fields(settings.fields);
		}).on('click', '.header .publish', function(){
			if (x.mode) x.statusItem([x.mode], +!x.arr[x.mode].show);
		}).on('click', '.header .save', function(){
			x.saveItem();
		}).on('click', '.header .save_close', function(){
			x.saveItem(true);
		}).on('click', '.header .close', function(){
			x.closeItem();
		}).on('click', '.header .vo', function(){
			x.editItem(x.mode, 'vo');
		}).on('click', '.header .vd', function(){
			x.editItem(x.mode, 'vd');
		}).on('click', '.header .rd', function(){
			x.editItem(x.mode, 'rd');
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

		// warning
		x.el.form.on('click', '.warning p', function(){
			var id = +$(this).attr('data');
			$('.header .menu .groups p[data="' + id + '"]', x.el.form).trigger('click');
			$('.warning', x.el.form).remove();
		}).on('click', '.warning .cancel', function(){
			x.closeItem();
		});
	},
	loadList: function(callback)
	{
		var x = this;

		$.get('?items/get_list_items', function(json){
			x.arr = {};

			// root
			x.arr[0] = {
				id: 0,
				private_title: lang['items_root'],
				childs: json.root
			};

			// items
			$.each(json.items, function(i, el){
				x.arr[el[0]] = {
					id: el[0],
					private_title: el[1],
					parent: el[2],
					childs: el[3],
					show: el[4] === 0 ? 0 : 1
				};
			});

			// parse
			$.each(x.arr, function(i, el){
				if (el.id === 0) return true;

				if (x.arr[el.parent]) {
					if ($.inArray(el.id, x.arr[el.parent].childs) === -1) x.arr[el.parent].childs.push(el.id);
				} else {
					x.arr[el.id].parent = 0;
					if ($.inArray(el.id, x.arr[0].childs) === -1) x.arr[0].childs.push(el.id);
				}
			});
			$.each(x.arr, function(i, el){
				$.each(el.childs, function(i, id){
					if (x.arr[id]) x.arr[id].parent = el.id;
				});
			});

			callback(x.arr);
		}, 'json');
	},
	drawList: function(callback)
	{
		var x = this;

		var scrolls = {};
		$('.items', x.el.list).each(function(){
			var th = $(this);
			var p = th.attr('parent');
			scrolls[p] = -$('.overview', th).position().top;
		});

		x.el.list.empty();

		$.each(x.opened, function(i, id){
			if (i > 0) {
				var f = $.inArray(id, x.arr[x.opened[i - 1]].childs);
				if (f === -1) {
					x.opened.splice(i, x.opened.length - i);
					return false;
				}
			}

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

		$('.items', x.el.list).each(function(){
			var th = $(this);
			var p = th.attr('parent');
			$('.scroll', th).tinyscrollbar().data('plugin_tinyscrollbar').update(scrolls[p] || 0);
		});

		common.resize();

		if (callback) callback();
	},
	getItemLink: function(alias, callback)
	{
		var x = this;

		var url = '?items/get_item_url', data = {id: x.mode};
		$.post(url, data, function(json){
			if (json.status) {
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

			$.each($.parseJSON(value), function(i, el){
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

					$.each(settings.fields, function(i, id){
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
				ids = settings.fields;
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
			}).join(''),
			pub: 'hide',
			s: '',
			sc: '',
			c: '',
			vd: 'hide',
			dc: 'hide',
			vo: 'hide',
			rd: 'hide',
			gr: '',
			lock: '',
			warning: 'show'
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
	editItem: function(id, e)
	{
		var x = this;

		x.mode = id;

		if (e === 'vo') {
			x.draft.clear();
			x.el.form.removeClass('show');

			setTimeout(function(){
				x.lang.setDefault();

				var item = x.arr[id];
				x.group = fields.arr.groups[item.group] ? item.group : 0;
				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['items_form_view_item'], [item.private_title]) + '</p><span>' + lang['items_form_edit_title_or'] + '</span>',
					language: $.map(x.lang.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					groups: $.map(fields.arr.groups['#'].childs, function(el){
						if (el && fields.arr.groups[el]) {
							var active = x.group == el ? ' active' : '';
							return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
						}
					}).join(''),
					pub: 'hide',
					s: 'hide',
					sc: 'hide',
					c: 'hide',
					vd: '',
					dc: 'hide',
					vo: 'hide',
					rd: 'hide',
					gr: 'hide',
					lock: 'show',
					warning: ''
				});

				x.el.form.html(template);

				$('.header .publish', x.el.form).toggleClass('active', !!item.show).find('.views').text(item.views || '');

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
			}, 210);

			return false;
		}
		if (e === 'vd') {
			x.el.form.removeClass('show');

			setTimeout(function(){
				x.lang.setDefault();

				var item = $.extend({}, x.arr[id], $.parseJSON(x.draft.data.value));
				x.group = fields.arr.groups[item.group] ? item.group : 0;
				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['items_form_' + (x.arr[x.mode].edited ? 'view' : 'edit') + '_item'], [item.private_title]) + '</p><span>' + lang['items_form_edit_title_draft'] + '</span>',
					language: $.map(x.lang.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					groups: $.map(fields.arr.groups['#'].childs, function(el){
						if (el && fields.arr.groups[el]) {
							var active = x.group == el ? ' active' : '';
							return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
						}
					}).join(''),
					pub: x.arr[x.mode].edited ? 'hide' : '',
					s: x.arr[x.mode].edited ? 'hide' : '',
					sc: x.arr[x.mode].edited ? 'hide' : '',
					c: '',
					vd: 'hide',
					dc: '',
					vo: '',
					rd: x.arr[x.mode].edited ? 'hide' : '',
					gr: x.arr[x.mode].edited ? 'hide' : '',
					lock: x.arr[x.mode].edited ? 'show' : '',
					warning: ''
				});

				x.el.form.html(template);

				$('.header .publish', x.el.form).toggleClass('active', !!item.show).find('.views').text(item.views || '');

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

				setTimeout(function(){
					if (x.mode && !x.arr[x.mode].edited) x.draft.init();
				}, 2000);
			}, 210);

			return false;
		}
		if (e === 'rd') {
			x.el.form.removeClass('show');

			setTimeout(function(){
				x.draft.remove();

				x.lang.setDefault();

				var item = x.arr[id];
				x.group = fields.arr.groups[item.group] ? item.group : 0;
				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['items_form_edit_item'], [item.private_title]) + '</p><span>' + lang['items_form_edit_title_or'] + '</span>',
					language: $.map(x.lang.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					groups: $.map(fields.arr.groups['#'].childs, function(el){
						if (el && fields.arr.groups[el]) {
							var active = x.group == el ? ' active' : '';
							return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
						}
					}).join(''),
					pub: '',
					s: 'hide',
					sc: 'hide',
					c: '',
					vd: 'hide',
					dc: 'hide',
					vo: 'hide',
					rd: 'hide',
					gr: '',
					lock: '',
					warning: ''
				});

				x.el.form.html(template);

				$('.header .publish', x.el.form).toggleClass('active', !!item.show).find('.views').text(item.views || '');

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

				setTimeout(function(){
					if (x.mode && !x.arr[x.mode].edited) x.draft.init();
				}, 2000);
			}, 210);

			return false;
		}

		loader.show();

		$.post('?items/get_item_for_edit', {id: id}, function(json){
			if (json.status) {
				var el = json.item;
				$.extend(x.arr[el.id], json.item);
				var item = false;

				if (json.draft) {
					item = $.extend({}, x.arr[id], json.draft.value);
					x.draft.id = json.draft.id;
					x.draft.data = {item: id, value: JSON.stringify(json.draft.value)};
				} else {
					item = x.arr[id];
					x.draft.id = false;
					x.draft.data = false;
				}

				x.group = fields.arr.groups[item.group] ? item.group : 0;

				x.lang.setDefault();

				if (el.edited) {
					var template = m.template(x.template.form, {
						title: '<p>' + vsprintf(lang['items_form_view_item'], [item.private_title]) + '</p><span>' + lang['items_form_edit_title_' + (json.draft ? 'draft' : 'or')] + '</span>',
						language: $.map(x.lang.getLangs(), function(title, alias){
							return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
						}).join(''),
						groups: $.map(fields.arr.groups['#'].childs, function(el){
							if (el && fields.arr.groups[el]) {
								var active = x.group == el ? ' active' : '';
								return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
							}
						}).join(''),
						pub: 'hide',
						s: 'hide',
						sc: 'hide',
						c: '',
						vd: 'hide',
						dc: json.draft ? '' : 'hide',
						vo: json.draft ? '' : 'hide',
						rd: 'hide',
						gr: 'hide',
						lock: 'show',
						warning: ''
					});
				} else {
					WS.send('items/item_edit_start/' + id);

					var template = m.template(x.template.form, {
						title: '<p>' + vsprintf(lang['items_form_edit_item'], [item.private_title]) + '</p><span>' + lang['items_form_edit_title_' + (json.draft ? 'draft' : 'or')] + '</span>',
						language: $.map(x.lang.getLangs(), function(title, alias){
							return '<div class="lang animate1 br3' + (x.lang.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
						}).join(''),
						groups: $.map(fields.arr.groups['#'].childs, function(el){
							if (el && fields.arr.groups[el]) {
								var active = x.group == el ? ' active' : '';
								return '<p class="br3 animate1' + active + '" data="' + el + '">' + fields.arr.groups[el].title + '</p>';
							}
						}).join(''),
						pub: '',
						s: json.draft ? '' : 'hide',
						sc: json.draft ? '' : 'hide',
						c: '',
						vd: 'hide',
						dc: json.draft ? '' : 'hide',
						vo: json.draft ? '' : 'hide',
						rd: json.draft ? '' : 'hide',
						gr: '',
						lock: '',
						warning: ''
					});
				}

				x.el.form.html(template);

				$('.header .publish', x.el.form).toggleClass('active', !!item.show).find('.views').text(item.views || '');

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

				if (!el.edited) {
					setTimeout(function(){
						if (x.mode) x.draft.init();
					}, 2000);
				}
			} else {
				m.report('?items/get_item_for_edit', {id: id}, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	draft:
	{
		id: false,
		data: false,
		timer: null,
		saving: false,
		init: function(){
			var x = this;

			x.clear();
			x.timer = setInterval(function(){
				if (x.saving) return false;

				var data = items.save_items_get();
				var valid = true;

				if (x.id) {
					var d = {
						item: items.mode,
						value: JSON.stringify(data)
					};
					$.each(d, function(i, el){
						if (x.data[i] !== el) valid = false;
					});
					if (!valid) {
						x.saving = true;
						x.edit(d);
					}
				} else {
					$.each(data, function(i, el){
						if (items.arr[items.mode][i] !== el) valid = false;
					});
					if (!valid) {
						x.saving = true;
						x.create(data);
					}
				}
			}, 3000);
		},
		create: function(data){
			var x = this;

			var data = {
				item: items.mode,
				value: JSON.stringify(data)
			};
			var url = '?items/item_draft_create';
			$.post(url, data, function(json){
				if (json.status) {
					x.id = json.id;
					x.data = data;

					$('.header .title span', items.el.form).text(lang['items_form_edit_title_draft']);
					$('.header .save, .header .save_close', items.el.form).removeClass('hide');
					$('.header .drafts_control, .header .vo, .header .rd', items.el.form).removeClass('hide');
				} else {
					m.report(url, data, JSON.stringify(json));
				}

				x.saving = false;
			}, 'json');
		},
		edit: function(data){
			var x = this;

			var d = data;
			d['id'] = x.id;
			var url = '?items/item_draft_edit';
			$.post(url, d, function(json){
				if (json.status) {
					x.data = data;
				} else {
					m.report(url, data, JSON.stringify(json));
				}

				x.saving = false;
			}, 'json');
		},
		remove: function(){
			var x = this;

			x.clear();

			var url = '?items/item_draft_remove';
			$.post(url, {id: x.id}, function(json){
				if (json.status) {
					x.id = false;
					x.data = false;
					x.saving = false;
				} else {
					m.report(url, data, JSON.stringify(json));
				}
			}, 'json');
		},
		clear: function(){
			var x = this;

			clearInterval(x.timer); x.timer = null;
		}
	},
	save_items_get: function(callback)
	{
		var x = this;

		var private_title = $('#private_title', x.el.form).val().trim();
		var alias = $('#alias', x.el.form).val().trim() || private_title;

		x.lang.set(x);

		var public_title = {};
		var meta_title = {};
		var meta_desc = {};
		var meta_keys = {};
		var desc = {};
		var image = {};
		var fields = {};

		$.each(x.lang.fields, function(i, el){
			public_title[i] = el.public_title || '';
			meta_title[i] = el.meta_title || '';
			meta_desc[i] = el.meta_desc || '';
			meta_keys[i] = el.meta_keys || '';
			desc[i] = el.desc || '';
			image[i] = el.image || '';
			fields[i] = el.fields || {};
		});

		var data = {
			private_title: private_title,
			public_title: JSON.stringify(public_title),
			alias: alias,
			meta_title: JSON.stringify(meta_title),
			meta_desc: JSON.stringify(meta_desc),
			meta_keys: JSON.stringify(meta_keys),
			desc: JSON.stringify(desc),
			image: JSON.stringify(image),
			fields: JSON.stringify(fields),
			group: x.group || 0
		};
		if (x.mode) {
			data.id = x.mode;
		} else {
			data.parent = x.parent;
		}

		return data;
	},
	saveItem: function(close)
	{
		var x = this;

		loader.show();

		var data = x.save_items_get();

		var url = '?items/' + (x.mode ? 'edit' : 'add') + '_item';
		$.post(url, data, function(json){
			if (json.status) {
				if (x.mode) {
					$.extend(x.arr[x.mode], data, {alias: json.alias});

					WS.send('items/item_edit/' + JSON.stringify({item: x.arr[x.mode]}));
					x.draft.id = false;
					x.draft.data = false;

					var item = $('.item#i' + x.mode, x.el.list);
					item.find('.title').text(data.private_title);
					if (item.hasClass('open')) $('.items[parent="' + x.mode + '"]', x.el.list).find('.header .title').text(data.private_title);

					if (close) {
						x.closeItem();
					} else {
						$('#alias', x.el.form).val(json.alias);
						$('.header .title p', x.el.form).text(sprintf(lang['items_form_edit_item'], [data.private_title]));
						$('.header .title span', x.el.form).text(lang['items_form_edit_title_or']);
						$('.header .save, .header .save_close', x.el.form).addClass('hide');
						$('.header .drafts_control, .header .vo, .header .rd', x.el.form).addClass('hide');

						x.getItemLink(json.alias, function(link){
							if (link) $('#link', x.el.form).val(link).next().attr('href', link).removeClass('hide');
						});
					}

					loader.hide();
				} else {
					x.mode = json.id;
					$.extend(data, {id: x.mode, alias: json.alias, show: 0, parent: x.parent, childs: []});
					x.arr[x.mode] = data;
					x.arr[x.parent].childs.unshift(x.mode);

					WS.send('items/item_new/' + JSON.stringify({item: data, parent: x.parent, childs: x.arr[x.parent].childs}));

					x.getItemLink(json.alias, function(link){
						if (!link) x.statusItem([x.mode], 1);

						if (close) {
							x.closeItem();
						} else {
							x.el.form.removeClass('show');
							setTimeout(function(){
								x.editItem(+json.id);
							}, 210);
						}

						x.drawList();
						loader.hide();
					});
				}
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	closeItem: function(action)
	{
		var x = this;

		if (x.mode && !x.arr[x.mode].edited) {
			x.draft.clear();
			WS.send('items/item_edit_end/' + x.mode);
			$.post('?items/close_item_edit', {id: x.mode}, function(json){}, 'json');
		}

		if (action === 'reedit') {
			x.el.form.empty();
			$('.item#i' + x.mode, x.el.list).removeClass('edited');

			x.mode = false;
		} else {
			x.el.list.removeClass('edited');
			x.el.form.empty().removeClass('show');
			$('.item#i' + x.mode, x.el.list).removeClass('edited');

			x.mode = false;

			common.resize();
		}
	},
	removeItems: function(elems, parent_id)
	{
		var x = this;

		if (!elems.length) return false;
		elems.addClass('removed');

		alertify.confirm(lang['items_form_remove_items'], function(e){
			if (e) {
				loader.show();

				var ids = elems.map(function(){
					return +$(this).attr('data');
				}).get();

				var url = '?items/remove_items', data = {ids: ids, parent: parent_id};
				$.post(url, data, function(json){
					if (json.status === 'edited') {
						alertify.error(lang['items_remove_item_edited']);
						loader.hide();
						elems.removeClass('removed');
					} else {
						x.arr[parent_id].childs = json.parent_sort;
						$.each(json.removed, function(i, el){
							delete x.arr[el];
						});
						x.drawList(function(){
							loader.hide();
						});
						WS.send('items/item_remove/' + JSON.stringify(json));
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
				WS.send('items/item_status/' + JSON.stringify({ids: ids, status: status}));
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
			if (json.status) {
				x.loadList(function(){
					x.drawList(function(){
						loader.hide();
					});
				});
				WS.send('items/item_clone/');
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	append_fields: function(ids)
	{
		var x = this;

		x.dependent_appending = true;
		$.each(ids, function(i, id){
			var field = fields.arr.fields[id];

			if (!field) return true;

			var container = $('<div class="container custom">\
				<div class="field ' + field.type + '" data="' + id + '">\
					<div class="head"><p>' + field.private_title + '</p></div>\
					<div class="group"></div>\
				</div>\
			</div>').appendTo($('.main', x.el.form));

			fields.types[field.type].item_add($('.group', container), x.lang.fields[x.lang.active].fields[id], field.value, 'items', x.lang.active, function(val, data){
				var t = setInterval(function(){
					if (x.dependent_appending) return false;
					clearInterval(t);

					if (field.type === 'flag') {
						$('.main .container.custom .field', x.el.form).each(function(){
							var th = $(this);
							var id = +th.attr('data');
							var parent = th.parent();

							parent.toggle(!($.inArray(id, data.dependent.fields) > -1 && ((!val && !data.dependent.reverse) || (val && data.dependent.reverse))));
						});
					}
					if (field.type === 'select') {
						if (val) {
							var d = data[val].dependent;
							$('.main .container.custom .field', x.el.form).each(function(){
								var th = $(this);
								var id = +th.attr('data');
								var parent = th.parent();

								if ($.inArray(id, d.show) + 1) parent.show();
								if ($.inArray(id, d.hide) + 1) parent.hide();
							});
						} else {
							var fields = $('.main .container.custom .field', x.el.form);
							$.each(data, function(i, el){
								$.map(el.dependent.hide, function(id){
									fields.filter('[data="' + id + '"]').parent().hide();
								});
							});
						}
					}
				}, 50);
			});
		});
		x.dependent_appending = false;
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

		x.opened = [];
		var get_parent = function(id){
			var parent = x.arr[id].parent;
			x.opened.unshift(parent);
			if (parent !== 0) get_parent(parent);
		};
		get_parent(id);

		x.drawList(function(){
			var item = $('#i' + id, x.el.list).addClass('items_finded');
			var top = item.position().top;
			item.parents('.scroll').data('plugin_tinyscrollbar').update(top).update('relative');
			setTimeout(function(){
				item.removeClass('items_finded');
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
	setSorting: function(edited)
	{
		var x = this;

		var ws = [];
		var data = {items: []};
		$.each(edited, function(i, el){
			var s = el[1] === 'parent' ? x.arr[el[0]].parent : x.arr[el[0]].childs;
			el.push(s);
			ws.push([el[0], el[1], el[2]]);

			if (el[1] === 'childs') el[2] = el[2].join(',');
			data.items.push(el);
		});
		$.post('?items/edit_sorting', data, function(json){
			if (json.status) {
				WS.send('items/sorting/' + JSON.stringify(ws));
			}
		}, 'json');
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
	WS: function(cmd, p)
	{
		var x = this;

		if (cmd === 'item_new') {
			WS.append(function(cb){
				var data = $.parseJSON(p[0]);

				x.arr[data.item.id] = data.item;
				x.arr[data.parent].childs = data.childs;

				x.drawList(function(){
					cb();
				});
			});
		}
		if (cmd === 'item_edit') {
			WS.append(function(cb){
				var data = $.parseJSON(p[0]);

				x.arr[data.item.id] = data.item;

				x.drawList(function(){
					cb();
				});
			});
		}
		if (cmd === 'item_edit_start') {
			WS.append(function(cb){
				if (+p[0] === x.mode) {
					x.draft.clear();
					alertify.alert(lang['items_form_error_opened_el'], function(){
						x.mode = false;

						x.el.list.removeClass('edited');
						x.el.form.empty().removeClass('show');
						$('.item.edited', x.el.list).removeClass('edited');

						common.resize();
					});
				}
				x.arr[+p[0]].edited = 1;
				cb();
			});
		}
		if (cmd === 'item_edit_end') {
			WS.append(function(cb){
				x.arr[+p[0]].edited = 0;
				cb();
			});
		}
		if (cmd === 'item_remove') {
			WS.append(function(cb){
				var data = $.parseJSON(p[0]);

				x.arr[data.parent_id].childs = data.parent_sort;
				$.each(data.removed, function(i, el){
					if (x.mode === el) {
						x.draft.clear();
						alertify.alert(lang['items_form_error_removed_el'], function(){
							x.mode = false;

							x.el.list.removeClass('edited');
							x.el.form.empty().removeClass('show');
							$('.item.edited', x.el.list).removeClass('edited');

							common.resize();
						});
					}
					delete x.arr[el];
				});
				x.drawList(function(){
					cb();
				});
			});
		}
		if (cmd === 'item_status') {
			WS.append(function(cb){
				var data = $.parseJSON(p[0]);

				$.each(data.ids, function(i, id){
					x.arr[id].show = data.status;
					$('#i' + id, x.el.list).toggleClass('disable', !data.status);
				});

				cb();
			});
		}
		if (cmd === 'item_clone') {
			WS.append(function(cb){
				x.loadList(function(){
					x.drawList(function(){
						cb();
					});
				});
			});
		}
		if (cmd === 'sorting') {
			WS.append(function(cb){
				var sort = $.parseJSON(p[0]);
				$.each(sort, function(i, el){
					x.arr[el[0]][el[1]] = el[2];
				});
				x.drawList(function(){
					cb();
				});
			});
		}
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