var database = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	el: {
		parent: $('#database')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.form = $('.form', x.el.parent);
		x.el.settings = $('.settings', x.el.parent);

		x.template = {};
		x.template.form = x.el.form.html();
		x.template.settings = x.el.settings.html();

		x.settings.init();
		x.handlers_items();

		x.loadList(function(){
			x.draw_items(function(){
				callback();
			});
		});
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
	},
	loadList: function(callback)
	{
		var x = this;

		$.get('?database/get_list', function(json){
			x.config = json.config;
			x.arr = {};

			$.each(json.items, function(i, el){
				x.arr[el[0]] = {
					id: el[0],
					image: el[1],
					uid: el[2],
					type: el[3],
					private_title: el[4],
					public_title: el[5],
					fields: el[6],
					date_added: el[7],
					date_change: el[8],
					edited: el[9]
				};
			});

			callback(x.arr);
		}, 'json');
	},
	draw_items: function(callback)
	{
		var x = this;

		var load_items = x.config.display.some(function(id){
			return (typeof id === 'number' && fields.arr.fields[id].type === 'items');
		});

		var start = function(){
			var items_full = $.map(x.arr, function(el){
				var el = $.extend({}, el);
				el.fields = $.parseJSON(el.fields || '{}')[settings.arr['langFrontDefault']];
				return el;
			});

			// filter start
			if (x.filter.use) {
				var items = items_full.filter(function(el) {
					var valid = true;
					var vars = $.map(x.config.display, function(id){
						if (id) {
							if (typeof id === 'number') {
								if (fields.arr.fields[id]) {
									var type = fields.arr.fields[id].type;
									return fields.types[type].bases.view(el.fields[id] || '', id);
								}
							} else {
								if (id === 'id') return el.id;
								if (id === 'image') return el.image;
								if (id === 'uid') return el.uid;
								if (id === 'title') return el.private_title + ' ' + el.public_title;
							}
						}
					}).join(' ').toLowerCase();

					$.each(x.filter.text.split(' '), function(i, text){
						if (vars.indexOf(text) === -1) valid = false;
					});

					return valid;
				});
			} else {
				var items = items_full;
			}
			// filter end

			// sorting start
			items.sort(function(a, b){
				if (x.sorting.param == 'id') {
					var a = a.id;
					var b = b.id;
				} else if (x.sorting.param == 'image') {
					var a = a.image;
					var b = b.image;
				} else if (x.sorting.param == 'uid') {
					var a = a.uid;
					var b = b.uid;
				} else if (x.sorting.param == 'title') {
					var a = a.private_title;
					var b = b.private_title;
				} else if (x.sorting.param == 'date') {
					var a = a.date_added;
					var b = b.date_added;
				} else {
					var type = fields.arr.fields[x.sorting.param].type;
					var a = fields.types[type].bases.sort(a.fields[x.sorting.param] || '', x.sorting.param);
					var b = fields.types[type].bases.sort(b.fields[x.sorting.param] || '', x.sorting.param);
				}

				if (x.sorting.direction == 'ASC') {
					if (a > b) return 1;
					if (a < b) return -1;
				}
				if (x.sorting.direction == 'DESC') {
					if (a > b) return -1;
					if (a < b) return 1;
				}
				return 0;
			});
			// sorting end

			// template start
			if (x.config.view === 'table') {
				var width = 100 / (x.config.display.length + 1);
				var template = '<div class="box {{type}}" style="width:' + width + '%">{{value}}</div>';

				var head = '<div class="item head">\
					' + $.map(x.config.display, function(id){
						if (typeof id === 'number') {
							if (fields.arr.fields[id]) {
								return m.template(template, {
									type: 'f f_' + id + ' f_' + fields.arr.fields[id].type,
									value: fields.arr.fields[id].private_title
								});
							}
						} else {
							if (id === 'id')
								return m.template(template, {
									type: 'id',
									value: 'ID'
								});
							if (id === 'image')
								return m.template(template, {
									type: 'image',
									value: lang['database_list_table_image']
								});
							if (id === 'uid')
								return m.template(template, {
									type: 'uid',
									value: 'UID'
								});
							if (id === 'title')
								return m.template(template, {
									type: 'title',
									value: lang['database_list_table_title']
								});
							if (id === 'date_added')
								return m.template(template, {
									type: 'date_added',
									value: lang['database_list_table_date_added']
								});
						}
					}).join('') + '\
					<div class="box actions" style="width:' + width + '%"></div>\
				</div>';

				var body = '';
				$.each(items, function(i, el){
					var edited = x.mode == el.id ? ' edited' : '';
					var nr = el.edited ? ' nr' : '';

					var date = new Date(el.date_added * 1000);
					var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
					var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
					var year = date.getFullYear();
					var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
					var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

					body += '<div class="item' + edited + '' + nr + '" data="' + el.id + '">\
						' + $.map(x.config.display, function(id){
							if (typeof id === 'number') {
								if (fields.arr.fields[id]) {
									var type = fields.arr.fields[id].type;
									return m.template(template, {
										type: 'f f_' + id + ' f_' + type,
										value: fields.types[type].bases.view(el.fields[id] || '', id)
									});
								}
							} else {
								if (id === 'id')
									return m.template(template, {
										type: 'id',
										value: el.id
									});
								if (id === 'image')
									return m.template(template, {
										type: 'image',
										value: fields.types.file.bases.view(el.image)
									});
								if (id === 'uid')
									return m.template(template, {
										type: 'uid',
										value: el.uid
									});
								if (id === 'title')
									return m.template(template, {
										type: 'title',
										value: el.private_title
									});
								if (id === 'date_added')
									return m.template(template, {
										type: 'date_added',
										value: day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
									});
							}
						}).join('') + '\
						<div class="box actions" style="width:' + width + '%">\
							<div class="br3 clone" title="' + lang['database_list_clone'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.3 488.3"><path d="M314.25 85.4h-227c-21.3 0-38.6 17.3-38.6 38.6v325.7c0 21.3 17.3 38.6 38.6 38.6h227c21.3 0 38.6-17.3 38.6-38.6V124c-.1-21.3-17.4-38.6-38.6-38.6zm11.5 364.2c0 6.4-5.2 11.6-11.6 11.6h-227c-6.4 0-11.6-5.2-11.6-11.6V124c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.6z"/><path d="M401.05 0h-227c-21.3 0-38.6 17.3-38.6 38.6 0 7.5 6 13.5 13.5 13.5s13.5-6 13.5-13.5c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.7c0 6.4-5.2 11.6-11.6 11.6-7.5 0-13.5 6-13.5 13.5s6 13.5 13.5 13.5c21.3 0 38.6-17.3 38.6-38.6V38.6c0-21.3-17.3-38.6-38.6-38.6z"/></svg></div>\
							<div class="br3 remove" title="' + lang['database_list_remove'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
						</div>\
					</div>';
				});

				var empty = items.length ? '' : '<div class="empty">' + lang['database_list_table_empty'] + '</div>';

				$('.items', x.el.list).html('<div class="table br3">' + (items.length ? head + body : empty) + '</div>');
			}

			if (x.config.view === 'grid') {
				var template = '<div class="item{{edited}}{{nr}}" data="{{id}}"><div class="inner br3">\
					<div class="image" style="background-image:url({{image}});"></div>\
					<div class="title">{{title}}</div>\
					<div class="info">{{info}}</div>\
					<div class="br3 clone" title="' + lang['database_list_clone'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.3 488.3"><path d="M314.25 85.4h-227c-21.3 0-38.6 17.3-38.6 38.6v325.7c0 21.3 17.3 38.6 38.6 38.6h227c21.3 0 38.6-17.3 38.6-38.6V124c-.1-21.3-17.4-38.6-38.6-38.6zm11.5 364.2c0 6.4-5.2 11.6-11.6 11.6h-227c-6.4 0-11.6-5.2-11.6-11.6V124c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.6z"/><path d="M401.05 0h-227c-21.3 0-38.6 17.3-38.6 38.6 0 7.5 6 13.5 13.5 13.5s13.5-6 13.5-13.5c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.7c0 6.4-5.2 11.6-11.6 11.6-7.5 0-13.5 6-13.5 13.5s6 13.5 13.5 13.5c21.3 0 38.6-17.3 38.6-38.6V38.6c0-21.3-17.3-38.6-38.6-38.6z"/></svg></div>\
					<div class="br3 remove" title="' + lang['database_list_remove'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
				</div></div>';
				var template_info = '<p><b>{{title}}</b>: {{value}}</p>';
				var body = '';
				$.each(items, function(i, el){
					var date = new Date(el.date_added * 1000);
					var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
					var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
					var year = date.getFullYear();
					var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
					var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

					var info = $.map(x.config.display, function(id){
						if (typeof id === 'number') {
							if (fields.arr.fields[id]) {
								var type = fields.arr.fields[id].type;
								return m.template(template_info, {
									title: fields.arr.fields[id].private_title,
									value: fields.types[type].bases.view(el.fields[id] || '', id)
								});
							}
						} else {
							if (id === 'id')
								return m.template(template_info, {
									title: 'ID',
									value: el.id
								});
							if (id === 'uid')
								return m.template(template_info, {
									title: 'UID',
									value: el.uid
								});
							if (id === 'date_added')
								return m.template(template_info, {
									title: lang['database_list_table_date_added'],
									value: day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
								});
						}
						return '';
					}).join('');

					body += m.template(template, {
						edited: x.mode == el.id ? ' edited' : '',
						nr: el.edited ? ' nr' : '',
						image: '/qrs/getfile/' + (el.image || 0) + '/200/200/0',
						title: el.private_title,
						info: info,
						id: el.id
					});
				});

				var empty = items.length ? '' : '<div class="empty">' + lang['database_list_grid_empty'] + '</div>';

				$('.items', x.el.list).html('<div class="grid">' + (items.length ? body : empty) + '</div>');
			}
			// template end

			x.filter.set([items.length, items_full.length]);

			if (callback) callback();
		};

		if (load_items) { // TODO убрать, когда переделаю обновление контента на WS
			items.loadList(function(){ // обновляем итемы чтоб правильно формировлся показ списка (если итемы используются)
				start();
			});
		} else {
			start();
		}
	},
	handlers_items: function()
	{
		var x = this;

		x.filter = {
			text: '',
			use: false,
			change: function(){
				var s = this;

				var parent = $('.header .filter', x.el.list);

				s.text = $('input', parent).val().trim().toLowerCase();
				s.use = !!s.text;

				$('.clear, .count', parent).toggleClass('show', s.use);

				x.draw_items();
			},
			set: function(counts){
				$('.header .filter .count', x.el.list).text(counts.join(' / '));
			}
		};
		x.sorting = {
			param: 'id',
			direction: 'DESC',
			parent: $('.header .sorting', x.el.list),
			init: function(){
				var s = this;

				var title = $('.title', s.parent);
				var popup = $('.popup', s.parent);
				var html = popup.html();

				s.parent.on('click', '.title, .arrow', function(){
					popup.empty();

					$.each(['id'].concat(x.config.display), function(i, el){
						if (el === 'image') return true;

						var title = 'Undefined';
						if (typeof el === 'number') {
							if (fields.arr.fields[el]) title = fields.arr.fields[el].private_title;
						} else {
							if (el === 'id') title = 'ID';
							if (el === 'uid') title = 'UID';
							if (el === 'title') title = lang['database_list_table_title'];
							if (el === 'date_added') title = lang['database_list_table_date_added'];
						}

						var item = m.template(html, {
							active: el == s.param ? 'active' : '',
							title: title,
							data: el,
							asc: el == s.param && s.direction === 'ASC' ? 'asc' : ''
						});

						popup.append(item);
					});

					s.parent.toggleClass('open');
				}).on('mouseleave', function(){
					s.parent.removeClass('open');
				}).on('click', 'p', function(){
					var th = $(this);

					if (th.hasClass('active')) th.toggleClass('asc');
					th.addClass('active').siblings().removeClass('active asc');

					title.text(title.attr('data') + th.text());
					setTimeout(function(){
						s.parent.addClass('open');
					}, 10);

					s.param = th.attr('data');
					s.direction = th.hasClass('asc') ? 'ASC' : 'DESC';

					x.draw_items();
				});
			}
		};
		x.sorting.init();

		x.el.list.on('click', '.header .create_item', function(){
			x.add_items();
		}).on('click', '.header .pdf', function(){
			x.pdf.init();
		}).on('keyup', '.header .filter input', function(){
			x.filter.change();
		}).on('click', '.header .filter .clear', function(){
			$('.header .filter input', x.el.list).val('');
			x.filter.change();
		}).on('click', '.header .menu p', function(){
			var th = $(this);
			var data = th.attr('data');

			if (data === 'settings') {
				x.settings.open();
			}
		}).on('click', '.items .clone', function(){
			var th = $(this);
			var id = th.parents('.item').attr('data');

			x.clone_item(id, function(new_id){
				x.draw_items();
			});

			return false;
		}).on('click', '.items .remove', function(){
			var th = $(this);
			var id = th.parents('.item').addClass('r').attr('data');

			x.remove_item(id, function(){
				x.draw_items();
			});

			return false;
		}).on('click', '.table .item:not(.head)', function(){
			var th = $(this);
			var id = +th.attr('data');

			th.addClass('edited').siblings().removeClass('edited');
			x.edit_items(id);
		}).on('click', '.grid .inner', function(){
			var th = $(this).parent();
			var id = +th.attr('data');

			th.addClass('edited').siblings().removeClass('edited');
			x.edit_items(id);
		});

		x.el.form.on('click', '.header .lang', function(){
			var th = $(this);
			var data = th.text();

			th.addClass('active').siblings().removeClass('active');

			x.language.select(data, x, false);
		}).on('click', '.header .vo', function(){
			x.edit_items(x.mode, 'vo');
		}).on('click', '.header .vd', function(){
			x.edit_items(x.mode, 'vd');
		}).on('click', '.header .rd', function(){
			x.edit_items(x.mode, 'rd');
		}).on('click', '.header .edition_control p', function(){
			x.edition.start();
		}).on('click', '.header .save', function(){
			x.save_items();
		}).on('click', '.header .save_close', function(){
			x.save_items(true);
		}).on('click', '.header .close', function(){
			x.close_items();
		}).on('blur', '.wrapper #private_title', function(){
			var val = $(this).val().trim();
			var public_title = $('#public_title', x.el.form);
			var public_title_val = public_title.val().trim();
			if (!public_title_val) public_title.val(val);
		}).on('click', '.container.system .select p', function(){
			$(this).addClass('active').siblings().removeClass('active');
		});
	},
	language:
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
					fields: false
				};
			});
		},
		setValue: function(value, alias)
		{
			var x = this;

			var value = $.parseJSON(value || '{}');

			$.each(value, function(i, el){
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
				arr.fields = arr.fields || {};

				$.each(old.fields, function(i, v){
					arr.fields[i] = arr.fields[i] || v || '';
				});
			}

			$('#public_title', s.el.form).val(arr.public_title);

			$('.container.custom', s.el.form).remove();
			$.each(database.config.fields, function(i, id){
				if (id && fields.arr.fields[id]) s.append_fields(id);
			});
		},
		set: function(s)
		{
			var x = this;

			var public_title = $('#public_title', s.el.form).val().trim();

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
				fields: json
			};

			return x.fields[x.active];
		}
	},
	add_items: function()
	{
		var x = this;

		x.mode = 0;

		x.language.setDefault();

		var template = m.template(x.template.form, {
			title: lang['database_form_create_item'],
			language: $.map(x.language.getLangs(), function(title, alias){
				return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
			}).join(''),
			dc: 'hide',
			vo: 'hide',
			vd: 'hide',
			rd: 'hide',
			uid: '',
			uid_disabled: 'disabled',
			editions: 'hide'
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#private_title', x.el.form).focus();
			$('.container.system .select p[data="' + x.config.type + '"]', x.el.form).addClass('active');

			fields.types.file.item_add($('.container.system .field.file .group', x.el.form), '', null, 'database');

			$.each(x.config.fields, function(i, id){
				if (id && fields.arr.fields[id]) x.append_fields(id);
			});
		}, 210);
	},
	edit_items: function(id, e)
	{
		var x = this;

		x.mode = id;

		if (e === 'vo') {
			x.draft.clear();
			x.el.form.removeClass('show');

			setTimeout(function(){
				x.language.setDefault();

				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['database_form_view_item'], [x.arr[id].private_title]) + '</p><span>' + lang['database_form_edit_title_or'] + '</span>',
					language: $.map(x.language.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					s: 'hide',
					sc: 'hide',
					c: 'hide',
					vd: '',
					dc: 'hide',
					vo: 'hide',
					rd: 'hide',
					uid: x.arr[id].uid || '',
					uid_disabled: '',
					lock: 'show',
					editions: 'hide'
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					$('#private_title', x.el.form).val(x.arr[id].private_title);
					$('.container.system .select p[data="' + x.arr[id].type + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), x.arr[id].image, null, 'database');

					x.language.setValue(x.arr[id].public_title, 'public_title');
					x.language.setValue(x.arr[id].fields, 'fields');

					x.language.select(x.language.active, x, true);
				}, 210);
			}, 210);

			return false;
		}

		if (e === 'vd') {
			x.el.form.removeClass('show');

			setTimeout(function(){
				var item = $.extend({}, x.arr[id], $.parseJSON(x.draft.data.value));

				x.language.setDefault();

				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['database_form_' + (x.arr[x.mode].edited ? 'view' : 'edit') + '_item'], [item.private_title]) + '</p><span>' + lang['database_form_edit_title_draft'] + '</span>',
					language: $.map(x.language.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					s: x.arr[x.mode].edited ? 'hide' : '',
					sc: x.arr[x.mode].edited ? 'hide' : '',
					c: '',
					vd: 'hide',
					dc: '',
					vo: '',
					rd: x.arr[x.mode].edited ? 'hide' : '',
					uid: item.uid || '',
					uid_disabled: '',
					lock: x.arr[x.mode].edited ? 'show' : '',
					editions: x.arr[x.mode].edited ? 'hide' : ''
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					if (!x.arr[x.mode].edited) x.edition.init();

					$('#private_title', x.el.form).val(item.private_title);
					$('.container.system .select p[data="' + item.type + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), item.image, null, 'database');

					x.language.setValue(item.public_title, 'public_title');
					x.language.setValue(item.fields, 'fields');

					x.language.select(x.language.active, x, true);

					setTimeout(function(){
						if (x.mode && !x.arr[x.mode].edited) x.draft.init();
					}, 2000);
				}, 210);
			}, 210);

			return false;
		}

		if (e === 'rd') {
			x.el.form.removeClass('show');

			setTimeout(function(){
				x.draft.remove();

				x.language.setDefault();

				var template = m.template(x.template.form, {
					title: '<p>' + vsprintf(lang['database_form_edit_item'], [x.arr[id].private_title]) + '</p><span>' + lang['database_form_edit_title_or'] + '</span>',
					language: $.map(x.language.getLangs(), function(title, alias){
						return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
					}).join(''),
					s: 'hide',
					sc: 'hide',
					c: '',
					vd: 'hide',
					dc: 'hide',
					vo: 'hide',
					rd: 'hide',
					uid: x.arr[id].uid || '',
					uid_disabled: '',
					lock: '',
					editions: ''
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					x.edition.init();

					$('#private_title', x.el.form).val(x.arr[id].private_title);
					$('.container.system .select p[data="' + x.arr[id].type + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), x.arr[id].image, null, 'database');

					x.language.setValue(x.arr[id].public_title, 'public_title');
					x.language.setValue(x.arr[id].fields, 'fields');

					x.language.select(x.language.active, x, true);

					setTimeout(function(){
						if (x.mode) x.draft.init();
					}, 2000);
				}, 210);
			}, 210);

			return false;
		}

		x.el.overlay.addClass('show');
		var url = '?database/get_item_for_edit';
		$.post(url, {id: id}, function(json){
			if (json.status) {
				var el = json.item;
				x.arr[id] = {
					id: id,
					image: el[1],
					uid: el[2],
					type: el[3],
					private_title: el[4],
					public_title: el[5],
					fields: el[6],
					date_added: el[7],
					date_change: el[8],
					edited: el[9]
				};

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

				x.language.setDefault();

				if (el[9]) {
					var template = m.template(x.template.form, {
						title: '<p>' + vsprintf(lang['database_form_view_item'], [item.private_title]) + '</p><span>' + lang['database_form_edit_title_' + (json.draft ? 'draft' : 'or')] + '</span>',
						language: $.map(x.language.getLangs(), function(title, alias){
							return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
						}).join(''),
						s: 'hide',
						sc: 'hide',
						c: '',
						vd: 'hide',
						dc: json.draft ? '' : 'hide',
						vo: json.draft ? '' : 'hide',
						rd: 'hide',
						uid: item.uid || '',
						uid_disabled: '',
						lock: 'show',
						editions: 'hide'
					});
				} else {
					$('.item[data="' + id + '"]', x.el.list).removeClass('nr');
					WS.send('database/item_edit_start/' + id);

					var template = m.template(x.template.form, {
						title: '<p>' + vsprintf(lang['database_form_edit_item'], [item.private_title]) + '</p><span>' + lang['database_form_edit_title_' + (json.draft ? 'draft' : 'or')] + '</span>',
						language: $.map(x.language.getLangs(), function(title, alias){
							return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
						}).join(''),
						s: json.draft ? '' : 'hide',
						sc: json.draft ? '' : 'hide',
						c: '',
						vd: 'hide',
						dc: json.draft ? '' : 'hide',
						vo: json.draft ? '' : 'hide',
						rd: json.draft ? '' : 'hide',
						uid: item.uid || '',
						uid_disabled: '',
						lock: '',
						editions: ''
					});
				}

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					if (!el[9]) x.edition.init();

					$('#private_title', x.el.form).val(item.private_title);
					$('.container.system .select p[data="' + item.type + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), item.image, null, 'database');

					x.language.setValue(item.public_title, 'public_title');
					x.language.setValue(item.fields, 'fields');

					x.language.select(x.language.active, x, true);

					if (!el[9]) {
						setTimeout(function(){
							if (x.mode) x.draft.init();
						}, 2000);
					}
				}, 210);
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	append_fields: function(id)
	{
		var x = this;

		var required = false;

		var required = x.config.uid && x.config.uid.use && ($.inArray(id, x.config.uid.template) + 1);

		var field = fields.arr.fields[id];

		if (!field) return false;

		var container = $('<div class="container custom">\
			<div class="field ' + field.type + '" data="' + id + '">\
				<div class="head"><p>' + field.private_title + (required ? ' <r>*</r>' : '') + '</p></div>\
				<div class="group"></div>\
			</div>\
		</div>').insertBefore($('.editions', x.el.form));

		fields.types[field.type].item_add($('.group', container), x.language.fields[x.language.active].fields[id], field.value, 'database', x.language.active);
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

				var data = database.save_items_get();
				var valid = true;

				if (x.id) {
					var d = {
						item: database.mode,
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
						if (database.arr[database.mode][i] !== el) valid = false;
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
				item: database.mode,
				value: JSON.stringify(data)
			};
			var url = '?database/item_draft_create';
			$.post(url, data, function(json){
				if (json.status) {
					x.id = json.id;
					x.data = data;

					$('.header .title span', database.el.form).text(lang['database_form_edit_title_draft']);
					$('.header .save, .header .save_close', database.el.form).removeClass('hide');
					$('.header .drafts_control, .header .vo, .header .rd', database.el.form).removeClass('hide');
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
			var url = '?database/item_draft_edit';
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

			var url = '?database/item_draft_remove';
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
	save_items_get: function()
	{
		var x = this;

		x.language.set(x);

		var private_title = $('#private_title', x.el.form).val().trim();
		var image = fields.types.file.item_save($('.container.system .field.file .group', x.el.form)) || 0;
		var type = +$('.container.system .select p.active', x.el.form).attr('data');
		var public_title = {};
		var f = {};

		$.each(x.language.fields, function(i, el){
			public_title[i] = el.public_title || '';
			f[i] = el.fields || {};
		});

		var data = {
			private_title: private_title,
			public_title: JSON.stringify(public_title),
			image: image,
			type: type,
			fields: JSON.stringify(f)
		};
		if (x.mode) {
			data.id = x.mode;
			data.uid = $('#uid', x.el.form).val().trim();
		}

		return data;
	},
	save_items: function(close)
	{
		var x = this;

		loader.show();

		var data = x.save_items_get();

		// check uid generate
		if (x.config.uid && x.config.uid.use && !x.mode) {
			var f = {};
			$.each(x.language.fields, function(i, el){
				f[i] = el.fields || {};
			});
			var valid = true;
			$.each(x.config.uid.template, function(i, el){
				if (typeof el === 'number') {
					if (!f[settings.arr.langFrontDefault][el]) valid = false;
				}
			});
			if (!valid) {
				alertify.error(lang['database_form_error_save_required']);
				loader.hide();
				return false;
			}
		}

		var url = '?database/items_' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json.status) {
				if (x.mode) {
					$.extend(x.arr[x.mode], data, {date_change: json.date_change});
					WS.send('database/item_edit');
					x.draft.id = false;
					x.draft.data = false;
					$('.header .title span', x.el.form).text(lang['database_form_edit_title_or']);
					$('.header .save, .header .save_close', x.el.form).addClass('hide');
					$('.header .drafts_control, .header .vo, .header .rd', x.el.form).addClass('hide');
				} else {
					x.mode = +json.id;
					$.extend(data, {id: x.mode, uid: json.uid, date_added: json.date_added, date_change: json.date_change});
					x.arr[x.mode] = data;
					WS.send('database/item_new');
					if (!close) {
						x.el.form.removeClass('show');
						setTimeout(function(){
							x.edit_items(+json.id);
						}, 210);
					}
				}

				x.draw_items();
				loader.hide();

				if (close) x.close_items();
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	close_items: function()
	{
		var x = this;

		if (x.mode && !x.arr[x.mode].edited) {
			x.draft.clear();
			WS.send('database/item_edit_end/' + x.mode);
			$.post('?database/close_item_edit', {id: x.mode}, function(json){}, 'json');
		}

		x.mode = false;
		$('.item.edited', x.el.list).removeClass('edited');

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');
	},
	edition:
	{
		el: {},
		init: function(){
			var x = this;

			x.d = database;
			x.el.parent = $('.editions', x.d.el.form);
			x.el.form = $('.edition_form', x.d.el.parent);
			x.template = {
				form: x.el.form.html()
			}

			x.el.parent.on('click', '.head .create', function(){
				x.edition_create();
			}).on('click', '.edit', function(){
				var th = $(this).parent();
				x.edition_edit(th);
				return false;
			}).on('click', '.remove', function(){
				var th = $(this).parent();
				x.edition_remove(th);
				return false;
			}).on('click', '.item', function(){
				var th = $(this);
				x.edition_open(th);
			}).on('change', '.childs .i select', function(){
				var th = $(this);
				x.item_select(th);
			}).on('focus', '.childs .i .f > div', function(){
				var th = $(this);
				x.item_input_focus(th);
				x.focus = true;
			}).on('keyup', '.childs .i .f > div', function(){
				var th = $(this);
				x.item_input_key(th);
			}).on('blur', '.childs .i .f > div', function(){
				var th = $(this);
				x.item_input(th);
				x.focus = false;
			}).on('click', '.childs .i .f .popup .v', function(){
				var th = $(this);
				var html = th.html();
				th.parent().prev().html(html);
				th.parent().remove();
			}).on('blur', '.childs .i .nt', function(){
				var th = $(this);
				x.item_note(th);
			});

			x.el.form.on('click', '.header .save', function(){
				x.edition_save();
			}).on('click', '.header .close', function(){
				x.form_close();
			}).on('click', '.select p', function(){
				$(this).addClass('active').siblings().removeClass('active');
			});

			$.post('?database/edition_get_editions', {id: x.d.mode}, function(json){
				x.editions = json.items;
				x.draw();
			}, 'json');
		},
		draw: function(){
			var x = this;

			var items = [];
			$.each(x.editions, function(i, el){
				items.push('<div class="item animate1 br3 box" data="' + el.id + '">\
					<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
					<div class="edit"><svg viewBox="0 0 32 32"><path d="M 30.122,30.122L 28.020,23.778L 11.050,6.808L 10,7.858L 6.808,11.050L 23.778,28.020 zM 3.98,8.222L 8.222,3.98l-2.1-2.1c-1.172-1.172-3.070-1.172-4.242,0c-1.172,1.17-1.172,3.072,0,4.242 L 3.98,8.222z"></path></svg></div>\
					<div class="title">' + el.title + '</div>\
					<div class="loader"></div>\
				</div>');
			});
			items = items.length ? items.join('') : '<div class="empty">' + lang['database_edition_list_empty'] + '</div>';

			$('.items', x.el.parent).html(items);
		},
		edition_create: function(){
			var x = this;

			x.d.el.form.removeClass('show');
			setTimeout(function(){
				var template = m.template(x.template.form, {
					p: x.d.arr[x.d.mode].type === 1 ? 'show' : 'hide',
					d: x.d.arr[x.d.mode].type === 2 ? 'show' : 'hide',
					password: x.d.arr[x.d.mode].type === 2 ? '' : 'hide'
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					$('#title', x.el.form).focus();
				}, 210);
			}, 210);
		},
		edition_save: function(){
			var x = this;

			var data = {
				title: $('#title', x.el.form).val().trim(),
				count: +$('#count', x.el.form).val().trim() || 0,
				type: x.d.arr[x.d.mode].type,
				status: +$('.select.status.show p.active', x.el.form).attr('data'),
				password: +$('.select.password p.active', x.el.form).attr('data'),
				item: x.d.mode
			};

			if (data.count === 0) {
				alertify.error(lang['database_edition_f_error_count']);
				$('#count', x.el.form).focus();
				return false;
			}

			loader.show();

			$.post('?database/edition_create_edition', data, function(json){
				x.editions.push({id: json.id, item: x.d.mode, title: data.title});
				x.draw();
				x.form_close();
				loader.hide();
			}, 'json');
		},
		edition_edit: function(el){
			var x = this;

			var title = $('.title', el).text();
			var id = +el.attr('data');

			alertify.prompt(vsprintf(lang['database_edition_list_edit_item'], [title]), function(e, str){
				if (!e) return false;

				loader.show();

				$.post('?database/edition_edit_edition', {id: id, title: str}, function(json){
					$('.title', el).text(str);
					loader.hide();

					$.each(x.editions, function(i, el){
						if (el.id === id) x.editions[i].title = str;
					});
				}, 'json');
			}, title);
		},
		edition_remove: function(el){
			var x = this;

			el.addClass('remove');
			var id = +el.attr('data');

			alertify.confirm(lang['database_edition_list_remove_item'], function(e){
				if (e) {
					loader.show();

					$.post('?database/edition_remove_edition', {id: id}, function(json){
						el.next('.childs').remove();
						el.remove();
						loader.hide();
						$.each(x.editions, function(i, el){
							if (el.id === id) {
								x.editions.splice(i, 1);
								return false;
							}
						});
					}, 'json');
				} else {
					el.removeClass('remove');
				}
			});
		},
		edition_open: function(th){
			var x = this;

			var id = +th.attr('data');
			var load = th.data('load');

			if (load) {
				th.next().toggle();
				return false;
			}

			if (th.hasClass('l')) return false;
			th.addClass('l');

			$.post('?database/edition_get_items', {id: id}, function(json){
				var items = [];
				var fields = {};
				var type = false;
				$.each(json.items, function(i, el){
					if (type === false) type = el[2];
					fields[el[0]] = el[4] || '{}';
					var width = 100 / (5 - (el[5] ? 0 : 1));
					var status = '';
					if (type === 1) {
						status += '<option value="1"' + (el[3] === 1 ? ' selected' : '') + '>' + lang['database_edition_f_p_np'] + '</option>';
						status += '<option value="6"' + (el[3] === 6 ? ' selected' : '') + '>' + lang['database_edition_f_p_ol'] + '</option>';
						status += '<option value="2"' + (el[3] === 2 ? ' selected' : '') + '>' + lang['database_edition_f_p_st'] + '</option>';
						status += '<option value="3"' + (el[3] === 3 ? ' selected' : '') + '>' + lang['database_edition_f_p_re'] + '</option>';
						status += '<option value="4"' + (el[3] === 4 ? ' selected' : '') + '>' + lang['database_edition_f_p_so'] + '</option>';
						status += '<option value="5"' + (el[3] === 5 ? ' selected' : '') + '>' + lang['database_edition_f_p_gi'] + '</option>';
					}
					if (type === 2) {
						status += '<option value="5"' + (el[3] === 5 ? ' selected' : '') + '>' + lang['database_edition_f_d_ol'] + '</option>';
						status += '<option value="1"' + (el[3] === 1 ? ' selected' : '') + '>' + lang['database_edition_f_d_us'] + '</option>';
						status += '<option value="2"' + (el[3] === 2 ? ' selected' : '') + '>' + lang['database_edition_f_d_re'] + '</option>';
						status += '<option value="3"' + (el[3] === 3 ? ' selected' : '') + '>' + lang['database_edition_f_d_so'] + '</option>';
						status += '<option value="4"' + (el[3] === 4 ? ' selected' : '') + '>' + lang['database_edition_f_d_gi'] + '</option>';
					}

					items.push('<div class="i" data="' + el[0] + '">\
						<div class="box n" style="width:' + width + '%">' + el[1] + '</div>\
						' + (el[5] ? '<div class="box p" style="width:' + width + '%">' + el[5] + '</div>' : '') + '\
						<div class="box s t' + (type === 1 ? '1' : '2') + '" style="width:' + width + '%"><select>' + status + '</select></div>\
						<div class="box f" style="width:' + width + '%">\
							<div data="seller" content="' + lang['database_edition_childs_seller'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="client" content="' + lang['database_edition_childs_client'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date" content="' + lang['database_edition_childs_date'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date_start" content="' + lang['database_edition_childs_date_start'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date_end" content="' + lang['database_edition_childs_date_end'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="location" content="' + lang['database_edition_childs_location'] + '" contenteditable="true" style="display:none;"></div>\
							<span class="no">' + lang['database_edition_childs_nof'] + '</span>\
						</div>\
						<div class="box nt" style="width:' + width + '%" contenteditable="true" content="' + lang['database_edition_childs_note'] + '">' + el[6] + '</div>\
					</div>');
				});
				th.removeClass('l').data('load', true).after('<div class="childs" t="' + type + '">' + items.join('') + '</div>');

				$('.i', th.next()).each(function(){
					var i = $(this);
					var id = i.attr('data');
					i.attr('f', fields[id]);
					var f = $.parseJSON(fields[id]);
					var val = +$('select', i).val();

					$.each(f, function(k, v){
						$('.f > div[data="' + k + '"]', i).html(v);
					});

					if (type === 1 && val === 2) {
						$('.f > div[data="location"]', i).removeAttr('style');
						$('.f .no', i).hide();
					}
					if (type === 1 && (val === 4 || val === 5) || type === 2 && (val === 3 || val === 4)) {
						$('.f > div[data="seller"]', i).removeAttr('style');
						$('.f > div[data="client"]', i).removeAttr('style');
						$('.f > div[data="date"]', i).removeAttr('style');
						$('.f .no', i).hide();
					}
					if (type === 1 && val === 3 || type === 2 && val === 2) {
						$('.f > div[data="client"]', i).removeAttr('style');
						$('.f > div[data="date_start"]', i).removeAttr('style');
						$('.f > div[data="date_end"]', i).removeAttr('style');
						$('.f .no', i).hide();
					}
					if (type === 1 && val === 6 || type === 2 && val === 5) {
						$('.f > div[data="date_start"]', i).removeAttr('style');
						$('.f > div[data="date_end"]', i).removeAttr('style');
						$('.f > div[data="location"]', i).removeAttr('style');
						$('.f .no', i).hide();
					}
				});
			}, 'json');
		},
		item_select: function(th){
			var x = this;

			var val = +th.val();
			var parent = th.parents('.i');
			var id = +parent.attr('data');
			var type = +parent.parent().attr('t');

			$.post('?database/edition_set_item_status', {id: id, status: val}, function(){}, 'json');

			$('.f > div', parent).hide();
			$('.f .no', parent).show();
			if (type === 1 && val === 2) {
				$('.f > div[data="location"]', parent).removeAttr('style');
				$('.f .no', parent).hide();
			}
			if (type === 1 && (val === 4 || val === 5) || type === 2 && (val === 3 || val === 4)) {
				$('.f > div[data="seller"]', parent).removeAttr('style');
				$('.f > div[data="client"]', parent).removeAttr('style');
				$('.f > div[data="date"]', parent).removeAttr('style');
				$('.f .no', parent).hide();
			}
			if (type === 1 && val === 3 || type === 2 && val === 2) {
				$('.f > div[data="client"]', parent).removeAttr('style');
				$('.f > div[data="date_start"]', parent).removeAttr('style');
				$('.f > div[data="date_end"]', parent).removeAttr('style');
				$('.f .no', parent).hide();
			}
			if (type === 1 && val === 6 || type === 2 && val === 5) {
				$('.f > div[data="location"]', parent).removeAttr('style');
				$('.f > div[data="date_start"]', parent).removeAttr('style');
				$('.f > div[data="date_end"]', parent).removeAttr('style');
				$('.f .no', parent).hide();
			}
		},
		item_input: function(th){
			var x = this;

			if (!x.hover) th.next('.popup').remove();
			var parent_f = th.parent();
			var parent_i = th.parents('.i');

			var f_old = $.parseJSON(parent_i.attr('f'));
			$('>div', parent_f).each(function(){
				var i = $(this);
				var text = i.text();
				if (!text) i.empty();
				f_old[i.attr('data')] = i.html();
			});
			f_old = JSON.stringify(f_old);

			var id = +parent_i.attr('data');
			parent_i.attr('f', f_old);
			$.post('?database/edition_set_item_fields', {id: id, fields: f_old}, function(){}, 'json');
		},
		item_note: function(th){
			var x = this;

			var id = th.parent().attr('data');
			var text = th.text();
			if (!text) th.empty();
			var html = th.html();

			$.post('?database/edition_set_item_note', {id: id, note: html}, function(){}, 'json');
		},
		item_input_focus: function(el){
			var x = this;

			var parent = el.parent();
			var h = el.innerHeight();
			var t = el.position().top;
			var popup = $('<div class="popup" style="top:' + (h+t) + 'px;"></div>');
			popup.hover(function(){
				x.hover = true;
			}, function(){
				x.hover = false;
				if (!x.focus) popup.remove();
			});

			el.after(popup);
		},
		item_input_key: function(el){
			var x = this;

			var data = el.attr('data');
			var text = el.text();
			var html = el.html();
			var id = el.parents('.i').attr('data');

			if (text) {
				html = html.replace(/<div>|<\/div>|<p>|<\/p>|<br>|&nbsp;/g, ' ').trim().split(' ').filter(function(n){return !!n;});
				$.post('?database/edition_find_fields', {str: html, data: data, id: id}, function(json){
					var html = [];
					$.each(json.items, function(i, v){
						html.push('<div class="v">' + v + '</div>');
					});
					el.next('.popup').html(html.join('')).toggle(!!html.length);
				}, 'json');
			} else {
				el.next('.popup').hide();
			}
		},
		form_close: function(){
			var x = this;

			x.el.form.removeClass('show');
			setTimeout(function(){
				x.d.el.form.addClass('show');
			}, 210);
		}
	},
	pdf:
	{
		init: function()
		{
			var x = this;

			var pdf = $('<div id="pdf">\
				<div class="overlay loader animate2"></div>\
				<div class="list br3 animate2">\
					<div class="header">\
						<div class="actions">\
							<div class="br3 create">' + lang['database_pdf_create'] + '</div>\
							<div class="br3 close">' + lang['database_pdf_close'] + '</div>\
						</div>\
						<div class="title">' + lang['database_pdf_title'] + '</div>\
					</div>\
					<div class="wrapper box"></div>\
				</div>\
				<div class="form br3 animate2">\
					<div class="header">\
						<div class="actions">\
							<div class="br3 prev">' + lang['database_pdf_new_prev'] + '</div>\
							<div class="br3 next">' + lang['database_pdf_new_next'] + '</div>\
							<div class="br3 submit">' + lang['database_pdf_create'] + '</div>\
							<div class="br3 cancel">' + lang['database_pdf_new_cancel'] + '</div>\
						</div>\
						<div class="title">' + lang['database_pdf_new_title'] + '</div>\
					</div>\
					<div class="wrapper box">\
						<div class="s s1">\
							<div class="t">' + lang['database_pdf_new_s1_t'] + '</div>\
							<div class="c br3"></div>\
						</div>\
						<div class="s s2">\
							<div class="t">' + lang['database_pdf_new_s2_t'] + '</div>\
							<div class="c br3"></div>\
						</div>\
						<div class="s s3">\
							<div class="t">' + lang['database_pdf_new_s3_t'] + ': <span>0</span></div>\
							<div class="f"><input class="box br3 animate1" type="text" placeholder="' + lang['database_pdf_new_s3_fph'] + '"><div class="count"></div><div class="clear"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div></div>\
							<div class="clr"></div>\
							<div class="c"></div>\
						</div>\
						<div class="s s4">\
							<div class="t">' + lang['database_pdf_new_s4_t'] + '</div>\
							<div class="c"></div>\
						</div>\
						<div class="s s5">\
							<div class="t">' + lang['database_pdf_new_s5_t'] + '</div>\
							<div class="c"></div>\
						</div>\
					</div>\
				</div>\
			</div>');
			x.list.el.root = x.form.el.root = pdf;
			x.list.el.overlay = x.form.el.overlay = $('.overlay', pdf);
			x.list.el.parent = x.form.el.list = $('.list', pdf);
			x.list.el.form = x.form.el.parent = $('.form', pdf);

			common.el.body.append(pdf);

			x.list.init();
			x.form.init();

			x.opened = true;
		},
		list:
		{
			el: {},
			init: function(){
				var x = this;

				x.el.overlay.addClass('show');
				setTimeout(function(){
					x.load(function(){
						x.draw();
						x.el.parent.addClass('show');
					});
				}, 210);

				x.el.parent.on('click', '.create', function(){
					database.pdf.form.open();
				}).on('click', '.close', function(){
					database.pdf.opened = false;
					x.el.overlay.removeClass('show');
					x.el.parent.removeClass('show');

					setTimeout(function(){
						x.el.root.remove();
					}, 210);
				}).on('click', '.remove', function(){
					var id = +$(this).parents('.item').attr('data');

					x.remove(id);
				});
			},
			load: function(callback){
				var x = this;

				$.get('?database/pdf_get_list', function(json){
					x.list = json;
					callback();
				}, 'json');
			},
			draw: function(){
				var x = this;

				var width = 100 / 4;
				var template = '<div class="item" data="{{id}}">\
					<div class="box id" style="width:' + width + '%">{{id}}</div>\
					<div class="box date" style="width:' + width + '%">{{date}}</div>\
					<div class="box template" style="width:' + width + '%">{{template}}</div>\
					<div class="box actions" style="width:' + width + '%">{{actions}}</div>\
				</div>';
				var head = '<div class="item head">\
					<div class="box id" style="width:' + width + '%">ID</div>\
					<div class="box date" style="width:' + width + '%">' + lang['database_pdf_list_date'] + '</div>\
					<div class="box template" style="width:' + width + '%">' + lang['database_pdf_list_template'] + '</div>\
					<div class="box actions" style="width:' + width + '%"></div>\
				</div>';
				var body = $.map(x.list, function(el){
					return m.template(template, {
						id: el[0],
						date: el[1],
						template: el[2],
						actions: '<a class="view br3" href="/ve-files/pdf/' + el[3] + '" title="' + lang['database_pdf_list_view'] + '" target="_blank"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3m0 8c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"></path></svg></a><div class="remove br3" title="' + lang['database_pdf_list_remove'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>'
					});
				}).join('');
				var content = body ? head + body : '<div class="empty">' + lang['database_pdf_list_empty'] + '</div>';

				$('.wrapper', x.el.parent).html('<div class="table br3">' + content + '</div>');
			},
			remove: function(id){
				var x = this;

				alertify.confirm(lang['database_pdf_list_remove_desc'], function(e){
					if (e) {
						x.el.overlay.addClass('top');

						var url = '?database/pdf_remove', data = {id: id};
						$.post(url, data, function(json){
							if (json.status) {
								x.load(function(){
									x.draw();
									x.el.overlay.removeClass('top');
								});
								WS.send('database/pdf_remove');
							} else {
								m.report(url, data, JSON.stringify(json));
							}
							
						}, 'json');
					}
				});
			},
		},
		form:
		{
			el: {},
			temp: {},
			init: function(){
				var x = this;

				x.el.prev = $('.prev', x.el.parent);
				x.el.next = $('.next', x.el.parent);
				x.el.submit = $('.submit', x.el.parent);
				x.el.step = $('.s', x.el.parent);

				x.el.parent.on('click', '.prev', function(){
					x.step('prev');
				}).on('click', '.next', function(){
					x.step('next');
				}).on('click', '.submit', function(){
					x.submit();
				}).on('click', '.cancel', function(){
					x.el.parent.removeClass('show');
				}).on('click', '.s1 .i', function(){
					var th = $(this);
					x.temp.template = th.attr('data');
					th.addClass('active').siblings().removeClass('active');
					x.step('next');
				}).on('click', '.s2 .i', function(){
					var th = $(this);
					x.temp.lang = th.attr('data');
					th.addClass('active').siblings().removeClass('active');
					x.step('next');
				}).on('keyup', '.s3 .f input', function(){
					x.s3_filter.change();
				}).on('click', '.s3 .f .clear', function(){
					$('.s3 .f input', x.el.parent).val('');
					x.s3_filter.change();
				}).on('click', '.s3 .c .item:not(.head)', function(){
					$(this).toggleClass('selected');
					x.s3_selected();
				});

				x.el.step.filter('.s4').find('.c').empty();
				x.el.step.filter('.s5').find('.c').empty();
			},
			open: function(){
				var x = this;

				x.active = 0;
				x.step('next');
				x.el.parent.addClass('show');
			},
			step: function(direction){
				var x = this;

				x.el.prev.hide();
				x.el.next.hide();
				x.el.submit.hide();

				if (direction === 'prev') {
					x.active--;
					if (x.active < 1) x.active = 1;
				}
				if (direction === 'next') {
					x.active++;
				}

				var el = x.el.step.filter('.s' + x.active);

				x['s' + x.active](el, function(){
					el.addClass('show').siblings().removeClass('show');
					$('.wrapper', x.el.parent).scrollTop(0);
				});
			},
			s1: function(parent, callback){
				var x = this;

				var t = database.config.pdf_templates;
				var html = $.map(t, function(el, i){
					return '<div class="i box" data="' + i + '" style="width:' + (100 / t.length) + '%">' + el[0] + ' (' + el[1] + ')</div>';
				}).join('');
				$('.c', parent).html(html);

				if (t.length === 1) {
					$('.c .i', parent).trigger('click');
				} else {
					callback();
				}
			},
			s2: function(parent, callback){
				var x = this;

				x.el.prev.show();

				var l = database.language.getLangs();
				var html = $.map(l, function(el, i){
					return '<div class="i box" data="' + i + '" style="width:' + (100 / Object.keys(l).length) + '%">' + el + '</div>';
				}).join('');
				$('.c', parent).html(html);

				if (Object.keys(l).length === 1) {
					$('.c .i', parent).trigger('click');
				} else {
					callback();
				}
			},
			s3: function(parent, callback){
				var x = this;

				x.el.prev.show();

				x.s3_filter = {
					text: '',
					use: false,
					change: function(){
						var s = this;

						var parent = $('.f', parent);

						s.text = $('input', parent).val().trim().toLowerCase();
						s.use = !!s.text;

						$('.clear, .count', parent).toggleClass('show', s.use);

						x.s3_draw_filter();
					},
					set: function(counts){
						$('.f .count', parent).text(counts.join(' / '));
					}
				};
				x.s3_selected = function(){
					var selected = $('.c .item.selected', parent);
					var count = selected.length;
					$('.t span', parent).text(count);
					x.el.next.toggle(!!count);
					x.temp.items = selected.map(function(){
						return +$(this).attr('data');
					}).get();
				};
				x.s3_draw = function(callback){
					var load_items = database.config.display.some(function(id){
						return (typeof id === 'number' && fields.arr.fields[id].type === 'items');
					});

					var start = function(){
						var items = $.map(database.arr, function(el){
							var el = $.extend({}, el);
							el.fields = $.parseJSON(el.fields || '{}')[settings.arr['langFrontDefault']];
							return el;
						});

						// sorting start
						items.sort(function(a, b){
							var a = a.id;
							var b = b.id;

							if (a > b) return -1;
							if (a < b) return 1;
							return 0;
						});
						// sorting end

						// template start
						if (database.config.view === 'table') {
							var width = 100 / database.config.display.length;
							var template = '<div class="box {{type}}" style="width:' + width + '%">{{value}}</div>';

							var head = '<div class="item head">\
								' + $.map(database.config.display, function(id){
									if (typeof id === 'number') {
										if (fields.arr.fields[id]) {
											return m.template(template, {
												type: 'f_' + id + ' f_' + fields.arr.fields[id].type,
												value: fields.arr.fields[id].private_title
											});
										}
									} else {
										if (id === 'id')
											return m.template(template, {
												type: 'id',
												value: 'ID'
											});
										if (id === 'image')
											return m.template(template, {
												type: 'image',
												value: lang['database_list_table_image']
											});
										if (id === 'uid')
											return m.template(template, {
												type: 'uid',
												value: 'UID'
											});
										if (id === 'title')
											return m.template(template, {
												type: 'title',
												value: lang['database_list_table_title']
											});
										if (id === 'date_added')
											return m.template(template, {
												type: 'date_added',
												value: lang['database_list_table_date_added']
											});
									}
								}).join('') + '\
							</div>';

							var body = '';
							$.each(items, function(i, el){
								var date = new Date(el.date_added * 1000);
								var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
								var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
								var year = date.getFullYear();
								var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
								var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

								body += '<div class="item" data="' + el.id + '">\
									' + $.map(database.config.display, function(id){
										if (typeof id === 'number') {
											if (fields.arr.fields[id]) {
												var type = fields.arr.fields[id].type;
												return m.template(template, {
													type: 'f_' + id + ' f_' + type,
													value: fields.types[type].bases.view(el.fields[id] || '', id)
												});
											}
										} else {
											if (id === 'id')
												return m.template(template, {
													type: 'id',
													value: el.id
												});
											if (id === 'image')
												return m.template(template, {
													type: 'image',
													value: fields.types.file.bases.view(el.image)
												});
											if (id === 'uid')
												return m.template(template, {
													type: 'uid',
													value: el.uid
												});
											if (id === 'title')
												return m.template(template, {
													type: 'title',
													value: el.private_title
												});
											if (id === 'date_added')
												return m.template(template, {
													type: 'date_added',
													value: day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
												});
										}
									}).join('') + '\
								</div>';
							});

							var empty = items.length ? '' : '<div class="empty">' + lang['database_list_table_empty'] + '</div>';

							$('.c', parent).html('<div class="table br3">' + (items.length ? head + body : empty) + '</div>');
						}

						if (database.config.view === 'grid') {
							var template = '<div class="item" data="{{id}}"><div class="inner br3">\
								<div class="image" style="background-image:url({{image}});"></div>\
								<div class="title">{{title}}</div>\
								<div class="info">{{info}}</div>\
							</div></div>';
							var template_info = '<p><b>{{title}}</b>: {{value}}</p>';
							var body = '';
							$.each(items, function(i, el){
								var date = new Date(el.date_added * 1000);
								var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
								var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
								var year = date.getFullYear();
								var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
								var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

								var info = $.map(database.config.display, function(id){
									if (typeof id === 'number') {
										if (fields.arr.fields[id]) {
											var type = fields.arr.fields[id].type;
											return m.template(template_info, {
												title: fields.arr.fields[id].private_title,
												value: fields.types[type].bases.view(el.fields[id] || '', id)
											});
										}
									} else {
										if (id === 'id')
											return m.template(template_info, {
												title: 'ID',
												value: el.id
											});
										if (id === 'uid')
											return m.template(template_info, {
												title: 'UID',
												value: el.uid
											});
										if (id === 'date_added')
											return m.template(template_info, {
												title: lang['database_list_table_date_added'],
												value: day + '.' + month + '.' + year + ' ' + hours + ':' + minutes
											});
									}
									return '';
								}).join('');

								body += m.template(template, {
									image: '/qrs/getfile/' + (el.image || 0) + '/200/200/0',
									title: el.private_title,
									info: info,
									id: el.id
								});
							});

							var empty = items.length ? '' : '<div class="empty">' + lang['database_list_grid_empty'] + '</div>';

							$('.c', parent).html('<div class="grid">' + (items.length ? body : empty) + '</div>');
						}
						// template end

						$('.f input', parent).val('').trigger('keyup');
						x.s3_selected();
						callback();
					};

					if (load_items) { // TODO убрать, когда переделаю обновление контента на WS
						items.loadList(function(){ // обновляем итемы чтоб правильно формировлся показ списка (если итемы используются)
							start();
						});
					} else {
						start();
					}
				};
				x.s3_draw_filter = function(){
					var items_full = $.map(database.arr, function(el){
						var el = $.extend({}, el);
						el.fields = $.parseJSON(el.fields || '{}')[settings.arr['langFrontDefault']];
						return el;
					});

					// filter start
					if (x.s3_filter.use) {
						var items = items_full.filter(function(el) {
							var valid = true;
							var vars = $.map(database.config.display, function(id){
								if (id) {
									if (typeof id === 'number') {
										if (fields.arr.fields[id]) {
											var type = fields.arr.fields[id].type;
											return fields.types[type].bases.view(el.fields[id] || '', id);
										}
									} else {
										if (id === 'id') return el.id;
										if (id === 'image') return el.image;
										if (id === 'uid') return el.uid;
										if (id === 'title') return el.private_title + ' ' + el.public_title;
									}
								}
							}).join(' ').toLowerCase();

							$.each(x.s3_filter.text.split(' '), function(i, text){
								if (vars.indexOf(text) === -1) valid = false;
							});

							return valid;
						});
					} else {
						var items = items_full;
					}
					// filter end
					
					x.s3_filter.set([items.length, items_full.length]);

					var ids = [];
					$.each(items, function(i, el){
						ids.push(el.id);
					});

					$('.c .item', parent).addClass('hide');
					$('.c .empty', parent).remove();

					if (ids.length) {
						$('.c .item.head', parent).removeClass('hide');
						$.each(ids, function(i, id){
							$('.c .item[data="' + id + '"]', parent).removeClass('hide');
						});
					} else {
						$('.c .' + database.config.view, parent).append('<div class="empty">' + lang['database_list_' + database.config.view + '_empty'] + '</div>');
					}1
				};

				x.s3_draw(function(){
					callback();
				});
			},
			s4: function(parent, callback){
				var x = this;

				x.el.prev.show();
				x.el.next.show();

				x.el.overlay.addClass('top');
				var url = '?database/pdf_template_fields/' + x.temp.template;
				$.get(url, function(json){
					if (json.status) {
						x.temp.request = json.request;

						if (json.request.local && json.request.local.length) {
							$.each(x.temp.items, function(i, id){
								var item = database.arr[id];

								var html = $('<div class="item br3" data="' + id + '">\
									<div class="title">' + item.private_title + '</div>\
									<div class="image br3" style="background-image:url(/qrs/getfile/' + item.image + '/200/200/0);"></div>\
									<div class="fields"></div>\
									<div class="clr"></div>\
								</div>');
								$.each(json.request.local, function(index, r){
									var container = $('<div class="container">\
										<div class="field ' + r.type + '" data="' + r.id + '" type="' + r.type + '">\
											<div class="head"><p>' + r.title + '</p></div>\
											<div class="group"></div>\
										</div>\
									</div>');
									$('.fields', html).append(container);

									fields.types[r.type].item_add($('.group', container), '', '', 'database', '');
								});
								$('.c', parent).append(html);
							});

							callback();
						} else {
							x.step('next');
						}
						x.el.overlay.removeClass('top');
					} else {
						m.report(url, {}, JSON.stringify(json));
					}
				}, 'json');
			},
			s5: function(parent, callback){
				var x = this;

				x.el.prev.show();
				x.el.submit.show();

				if (x.temp.request.global && x.temp.request.global.length) {
					$.each(x.temp.request.global, function(index, r){
						var container = $('<div class="container">\
							<div class="field ' + r.type + '" data="' + r.id + '" type="' + r.type + '">\
								<div class="head"><p>' + r.title + '</p></div>\
								<div class="group"></div>\
							</div>\
						</div>');
						$('.c', parent).append(container);

						fields.types[r.type].item_add($('.group', container), '', '', 'database', '');
					});
					callback();
				} else {
					x.step('next');
				}
			},
			submit: function(){
				var x = this;

				x.el.overlay.addClass('top');
				var data = {
					template: x.temp.template,
					lang: x.temp.lang,
					items: x.temp.items,
					local: (function(){
						var data = {};

						x.el.step.filter('.s4').find('.item').each(function(){
							var th = $(this);
							var id = th.attr('data');
							var d = {};
							$('.field', th).each(function(){
								var f = $(this);
								var alias = f.attr('data');
								var type = f.attr('type');
								var value = fields.types[type].item_save(f.find('.group'));

								d[alias] = value;
							});

							data[id] = d;
						});

						return data;
					})(),
					global: (function(){
						var d = {};

						x.el.step.filter('.s5').find('.field').each(function(){
							var f = $(this);
							var alias = f.attr('data');
							var type = f.attr('type');
							var value = fields.types[type].item_save(f.find('.group'));

							d[alias] = value;
						});

						return d;
					})()
				};

				var url = '?database/pdf_create';
				$.post(url, data, function(json){
					if (json.status) {
						database.pdf.list.load(function(){
							database.pdf.list.draw();
							x.el.parent.removeClass('show');
							x.el.overlay.removeClass('top');
						});
						WS.send('database/pdf_new');
					} else {
						m.report(url, data, JSON.stringify(json));
						x.el.overlay.removeClass('top');
					}
				}, 'json');
			}
		}
	},
	clone_item: function(id, callback)
	{
		var x = this;

		loader.show();

		var item = x.arr[id];

		var data = $.extend({}, item);
		delete data.date_change;
		delete data.date_added;
		delete data.id;
		delete data.uid;

		var url = '?database/items_add';
		$.post(url, data, function(json){
			if (json.status == 'OK') {
				var id = +json.id;
				$.extend(data, {id: id, uid: json.uid, date_added: json.date_added, date_change: json.date_change});
				x.arr[id] = data;
				loader.hide();
				WS.send('database/item_new');
				if (callback) callback(id);
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	remove_item: function(id, callback)
	{
		var x = this;

		alertify.confirm(lang['database_list_remove_item'], function(e){
			if (e) {
				loader.show();

				var url = '?database/item_delete', data = {id: id};
				$.post(url, data, function(json){
					if (json.status === 'edited') {
						alertify.error(lang['database_list_remove_item_edited']);
						loader.hide();
						$('.item.r', x.el.list).removeClass('r').addClass('nr');
					} else if (json.status) {
						delete x.arr[id];
						loader.hide();
						if (callback) callback();
						WS.send('database/item_remove/');
					} else {
						m.report(url, data, JSON.stringify(json));
						loader.hide();
						$('.item.r', x.el.list).removeClass('r');
					}
				}, 'json');
			} else {
				$('.item.r', x.el.list).removeClass('r');
			}
		});
	},
	settings:
	{
		el: {},
		init: function(){
			var x = this;

			database.el.settings.on('click', '.save', function(){
				x.save();
			}).on('click', '.save_close', function(){
				x.save(true);
			}).on('click', '.close', function(){
				x.close();
			}).on('click', '.wrapper.s1 .uid .field.checkbox .add', function(){
				var th = $(this);

				var p = $('<p class="br3"></p>').append('<input type="text" placeholder="' + x.lang['bases_form_uid_fid_placeholder'] + '">');
				th.before(p);
				setTimeout(function(){
					p.find('input').focus();
				}, 50);
			}).on('click', '.wrapper.s1 .uid .field.checkbox p', function(){
				var th = $(this);
				var data = th.attr('data');

				th.toggleClass('active');
				if (data === 'mask') $('.uid .mask', x.el.form).toggle();
			});

			x.types.pdf.handlers(database.el.settings);
			x.types.view.handlers(database.el.settings);
			x.types.type.handlers(database.el.settings);
			x.types.fields.handlers(database.el.settings);
			x.types.uid.handlers(database.el.settings);
		},
		load: function(callback){
			var x = this;

			$.get('?database/get_config', function(json){
				callback(json);
			}, 'json');
		},
		open: function(){
			var x = this;

			database.el.overlay.addClass('show');

			setTimeout(function(){
				x.load(function(json){
					database.config = json.config;

					database.el.settings.html(database.template.settings);

					x.types.pdf.draw(database.el.settings, json);
					x.types.view.draw(database.el.settings, json);
					x.types.type.draw(database.el.settings, json);
					x.types.fields.draw(database.el.settings, json);
					x.types.uid.draw(database.el.settings, json);

					database.el.settings.addClass('show');
				});
			}, 210);
		},
		save: function(close){
			var x = this;

			var data = {
				pdf_templates: [],
				view: 'table',
				type: 1,
				fields: [],
				display: [],
				uid: {
					use: true,
					mask: '',
					separate: '',
					template: []
				}
			};

			$('.container.pdf .i', database.el.settings).each(function(){
				var th = $(this);
				var title = $('input', th).eq(0).val().trim();
				var path = $('input', th).eq(1).val().trim();

				if (title && path) data.pdf_templates.push([title, path]);
			});

			data.view = $('.container.view p.active', database.el.settings).attr('data');
			data.type = +$('.container.type p.active', database.el.settings).attr('data');

			$('.container.fields .f .elems .item', database.el.settings).each(function(){
				var id = +$(this).attr('data');

				if (id) data.fields.push(id);
			});

			$('.container.fields .d .item', database.el.settings).each(function(){
				var id = $(this).attr('data');

				data.display.push(+id || id);
			});

			data.uid.use = $('.container.uid .ui-switch', database.el.settings).hasClass('active');
			data.uid.mask = $('.container.uid .inner #mask', database.el.settings).val().trim();
			data.uid.separate = $('.container.uid .inner #separate', database.el.settings).val().trim();
			$('.container.uid .inner .elems .item', database.el.settings).each(function(){
				var id = $(this).attr('data');

				data.uid.template.push(+id || id);
			});

			loader.show();

			$.post('?database/set_config', {data: JSON.stringify(data)}, function(json){
				if (json.status) {
					database.config = data;
					if (close) x.close();
					loader.hide();
					WS.send('database/settings_edit/');
				}
			}, 'json');
		},
		close: function(){
			var x = this;

			database.el.overlay.removeClass('show');
			database.el.settings.removeClass('show');

			database.draw_items();
		},
		types: {
			pdf: {
				template: '<div class="i">\
					<div class="box title">\
						<input class="br3 box animate1" type="text" value="{{title}}" placeholder="' + lang['database_settings_pdf_template_title'] + '">\
					</div>\
					<div class="box path">\
						<input class="br3 box animate1" type="text" value="{{path}}" placeholder="' + lang['database_settings_pdf_template_path'] + '">\
					</div>\
					<div class="clr"></div>\
				</div>',
				handlers: function(parent){
					var x = this;

					parent.on('click', '.pdf .add', function(){
						$(this).parent().append(m.template(x.template, {
							title: '',
							path: ''
						}));
					});
				},
				draw: function(parent, json){
					var x = this;

					var html = $.map(json.config.pdf_templates, function(el){
						return m.template(x.template, {
							title: el[0],
							path: el[1]
						});
					}).join('');

					$('.container.pdf .group', parent).append(html);

					if (!json.config.pdf_templates.length) $('.pdf .add', parent).trigger('click');
				}
			},
			view: {
				template: '',
				handlers: function(parent){
					var x = this;

					parent.on('click', '.container.view p', function(){
						$(this).addClass('active').siblings().removeClass('active');
					});
				},
				draw: function(parent, json){
					var x = this;

					$('.container.view p[data="' + json.config.view + '"]', parent).addClass('active');
				}
			},
			type: {
				template: '',
				handlers: function(parent){
					var x = this;

					parent.on('click', '.container.type p', function(){
						$(this).addClass('active').siblings().removeClass('active');
					});
				},
				draw: function(parent, json){
					var x = this;

					$('.container.type p[data="' + (json.config.type || 1) + '"]', parent).addClass('active');
				}
			},
			fields: {
				template: '',
				handlers: function(parent){
					var x = this;
				},
				draw: function(parent, json){
					var x = this;

					database.settings.types.uid.fields = ['id', 'mask'];

					var f_group = $('.container.fields .f .group', parent);
					var d_group = $('.container.fields .d .group', parent);
					var $combobox = $('.ui-combobox', f_group);
					var $elems = $('.elems', f_group);
					var loading = $('.loading', f_group);
					var fields = json.fields;
					fields.push(['id', 'ID']);
					fields.push(['image', lang['database_settings_fields_f_image']]);
					fields.push(['uid', 'UID']);
					fields.push(['title', lang['database_settings_fields_f_title']]);
					fields.push(['date_added', lang['database_settings_fields_f_date_added']]);
					var titles = {};
					var value = ['id', 'image', 'uid', 'title', 'date_added'].concat(json.config.fields);
					var combobox = null;

					var start = function(){
						loading.remove();

						combobox = new ui.combobox($combobox, {
							placeholder: lang['database_settings_fields_filter_ph'],
							empty: lang['database_settings_fields_filter_empty'],
							fields: fields,
							selectedItems: value,
							onSelect: function(id){
								var item = add_field(id);

								if (item) {
									item.addClass('added');
									setTimeout(function(){
										item.removeClass('added');
									}, 1000);
								}
							}
						});

						$.each(value, function(i, id){
							add_field(id);
						});
						$.each(json.config.display, function(i, id){
							$('.item[data="' + id + '"] .show', $elems).trigger('click');
						});

						check_empty();
					};
					var add_field = function(id){
						if (!id || !titles[id]) {
							check_empty();
							return false;
						}

						if (+id) {
							database.settings.types.uid.fields.push(+id);
							database.settings.types.uid.reset();
						}

						var item = $('<div class="item br3 box' + (+id ? '' : ' lock') + '" data="' + id + '" title="ID ' + id + '">\
							<div class="show"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3m0 8c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/></svg></div>\
							<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
							<div class="title">' + titles[id] + '</div>\
						</div>');

						$elems.append(item);

						check_empty();

						$elems.sortable({items: '.item:not(.lock)', tolerance: 'pointer', axis: 'y', activate: function(e, ui){
							ui.sender.sortable('refreshPositions');
						}});

						return item;
					};
					var check_empty = function(){
						var items = $('.item', $elems);

						if (items.length) {
							$elems.find('.empty').remove();
						} else {
							$elems.html('<div class="empty br3 box">' + lang['database_settings_fields_items_empty'] + '</div>');
						}
					};
					var check_empty_d = function(){
						var items = $('.item', d_group);

						if (items.length) {
							d_group.find('.empty').remove();
						} else {
							d_group.html('<div class="empty br3 box">' + lang['database_settings_fields_items_empty'] + '</div>');
						}
					};

					f_group.on('click', '.show', function(){
						var th = $(this);
						var parent = th.parent();
						var id = parent.attr('data');

						th.toggleClass('active');

						if (th.hasClass('active')) {
							var clone = parent.clone();
							clone.removeAttr('style').find('.show').remove().end().appendTo(d_group);
						} else {
							$('.item[data="' + id + '"]', d_group).remove();
						}

						check_empty_d();
					}).on('click', '.remove', function(){
						var th = $(this).parent();
						var id = th.attr('data');
						th.remove();
						check_empty();

						$('.item[data="' + id + '"]', d_group).remove();

						var k = $.inArray(+id || id, combobox.options.selectedItems);
						if (k + 1) {
							combobox.options.selectedItems.splice(k, 1);
							combobox.reset();
						}

						var k = $.inArray(+id, database.settings.types.uid.fields);
						if (k + 1) {
							database.settings.types.uid.fields.splice(k, 1);
							database.settings.types.uid.reset();
						}
					});

					d_group.on('click', '.remove', function(){
						var th = $(this).parent();
						var id = th.attr('data');
						th.remove();
						check_empty_d();

						$('.item[data="' + id + '"] .show', f_group).removeClass('active');
					});

					d_group.sortable({items: '.item', tolerance: 'pointer', axis: 'y', activate: function(e, ui){
						ui.sender.sortable('refreshPositions');
					}});

					$.each(fields, function(i, el){
						titles[el[0]] = el[1];
					});

					start();
				}
			},
			uid: {
				template: '',
				fields: ['id', 'mask'],
				handlers: function(parent){
					var x = this;
				},
				draw: function(parent, json){
					var x = this;

					x.parent = $('.container.uid .group', parent);
					var inner = $('.inner', x.parent);

					$('#mask', inner).val(json.config.uid.mask);
					$('#separate', inner).val(json.config.uid.separate);

					$('.switch', x.parent).html(ui.switch.html());
					var sw = $('.switch .ui-switch', x.parent);
					ui.switch.init(sw, {
						status: json.config.uid.use,
						change: function(status){
							inner.toggle(status);
						}
					});

					x.all_fields = json.fields;
					var $combobox = $('.ui-combobox', x.parent);
					var $elems = $('.elems', x.parent);
					var loading = $('.loading', x.parent);
					var fields = [];
					fields.push(['id', 'ID']);
					fields.push(['mask', lang['database_settings_uid_mask']]);
					$.each(x.fields, function(i, id){
						if (+id) {
							$.each(json.fields, function(i, el){
								if (+id === el[0]) {
									fields.push(el);
								}
							});
						}
					});
					x.titles = {};
					$.each(fields, function(i, el){
						x.titles[el[0]] = el[1];
					});
					var value = json.config.uid.template;
					x.combobox = false;

					var start = function(){
						loading.remove();

						x.combobox = new ui.combobox($combobox, {
							placeholder: lang['database_settings_fields_filter_ph'],
							empty: lang['database_settings_fields_filter_empty'],
							fields: fields,
							selectedItems: value,
							onSelect: function(id){
								var item = add_field(id);

								if (item) {
									item.addClass('added');
									setTimeout(function(){
										item.removeClass('added');
									}, 1000);
								}
							}
						});

						$.each(value, function(i, id){
							add_field(id);
						});

						check_empty();
					};
					var add_field = function(id){
						if (!id || !x.titles[id]) {
							check_empty();
							return false;
						}

						var item = $('<div class="item br3 box' + (+id ? '' : ' lock') + '" data="' + id + '" title="ID ' + id + '">\
							<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
							<div class="title">' + x.titles[id] + '</div>\
						</div>');

						$elems.append(item);

						check_empty();

						$elems.sortable({items: '.item', tolerance: 'pointer', axis: 'y', activate: function(e, ui){
							ui.sender.sortable('refreshPositions');
						}});

						return item;
					};
					var check_empty = function(){
						var items = $('.item', $elems);

						if (items.length) {
							$elems.find('.empty').remove();
						} else {
							$elems.html('<div class="empty br3 box">' + lang['database_settings_fields_items_empty'] + '</div>');
						}
					};

					x.parent.on('click', '.remove', function(){
						var th = $(this).parent();
						var id = th.attr('data');
						th.remove();
						check_empty();

						var k = $.inArray(+id || id, x.combobox.options.selectedItems);
						if (k + 1) {
							x.combobox.options.selectedItems.splice(k, 1);
							x.combobox.reset();
						}
					});

					start();
				},
				reset: function(){
					var x = this;

					if (x.combobox) {
						var fields = [];
						fields.push(['id', 'ID']);
						fields.push(['mask', lang['database_settings_uid_mask']]);
						$.each(x.fields, function(i, id){
							if (+id) {
								$.each(x.all_fields, function(i, el){
									if (+id === el[0]) {
										fields.push(el);
									}
								});
							}
						});

						x.titles = {};
						$.each(fields, function(i, el){
							x.titles[el[0]] = el[1];
						});

						var selected = [];
						$.each($('.item', x.parent), function(i, el){
							var th = $(this);
							var id = th.attr('data');

							var k = $.inArray(+id || id, x.fields);
							if (k + 1) {
								selected.push(+id || id);
							} else {
								th.remove();
							}
						});

						x.combobox.options.selectedItems = selected;
						x.combobox.options.fields = fields;
						x.combobox.reset();
					}
				}
			}
		}
	},
	openPathToItem: function(id)
	{
		var x = this;

		$('.items', x.el.list).scrollTop(0);
		var item = $('.item[data="' + id + '"]', x.el.list);
		var top = item.position().top;

		$('.items', x.el.list).scrollTop(top);
		item.addClass('database_finded');
		setTimeout(function(){
			item.removeClass('database_finded');
		}, 5000);
	},
	WS: function(cmd, p)
	{
		var x = this;

		if (cmd === 'item_new') {
			WS.append(function(cb){
				x.loadList(function(){
					x.draw_items(function(){
						cb();
					});
				});
			});
		}
		if (cmd === 'item_edit') {
			WS.append(function(cb){
				x.loadList(function(){
					x.draw_items(function(){
						cb();
					});
				});
			});
		}
		if (cmd === 'item_edit_start') {
			WS.append(function(cb){
				if (+p[0] === x.mode) {
					x.draft.clear();
					alertify.alert(lang['database_form_error_opened_el'], function(){
						x.mode = false;
						$('.item.edited', x.el.list).removeClass('edited');
						x.el.overlay.removeClass('show');
						x.el.form.removeClass('show');
						x.edition.el.parent.removeClass('show');
						x.edition.el.form.removeClass('show');
					});
				}
				x.arr[+p[0]].edited = 1;
				$('.item[data="' + p[0] + '"]', x.el.list).addClass('nr');
				cb();
			});
		}
		if (cmd === 'item_edit_end') {
			WS.append(function(cb){
				x.arr[+p[0]].edited = 0;
				$('.item[data="' + p[0] + '"]', x.el.list).removeClass('nr');
				cb();
			});
		}
		if (cmd === 'item_remove') {
			WS.append(function(cb){
				x.loadList(function(){
					x.draw_items(function(){
						cb();
					});
				});
			});
		}
		if (cmd === 'settings_edit') {
			WS.append(function(cb){
				x.settings.load(function(json){
					x.config = json.config;
					x.draw_items(function(){
						cb();
					});
				});
			});
		}
		if (cmd === 'pdf_new') {
			if (database.pdf.opened) {
				WS.append(function(cb){
					database.pdf.list.load(function(){
						database.pdf.list.draw();
						cb();
					});
				});
			}
		}
		if (cmd === 'pdf_remove') {
			if (database.pdf.opened) {
				WS.append(function(cb){
					database.pdf.list.load(function(){
						database.pdf.list.draw();
						cb();
					});
				});
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

common.queue.push(database);