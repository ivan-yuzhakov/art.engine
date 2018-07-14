var plugin_bases_page = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	el: {
		parent: $('#plugin_bases_page')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.form = $('.form', x.el.parent);

		x.template = {s1: {}, s2: {}};
		x.template.s1.list_item = $('.s1 .bases', x.el.list).html();
		$('.s1 .bases', x.el.list).empty();
		x.template.s1.list = $('.s1', x.el.list).html();
		x.template.s1.form = $('.s1', x.el.form).html();
		x.template.s2.list = $('.s2', x.el.list).html();
		x.template.s2.form = $('.s2', x.el.form).html();

		x.handlers_bases();
		x.handlers_items();

		x.sorting = {param: 'id', direction: 'ASC'};

		callback();
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
		x.loadDrawList();
	},
	loadList: function(callback)
	{
		var x = this;

		$.getJSON('?plugins/bases/page/get_list', function(json){
			x.arr.bases = {};
			x.arr.items = {};

			$.each(json.bases, function(i, el){
				x.arr.bases[el[0]] = {
					id: el[0],
					title: el[1],
					fields: el[2],
					date_added: el[3],
					date_change: el[4]
				};
			});
			$.each(json.items, function(i, el){
				x.arr.items[el[0]] = {
					id: el[0],
					base: el[1],
					uid: el[2],
					private_title: el[3],
					public_title: el[4],
					fields: el[5],
					date_added: el[6],
					date_change: el[7]
				};
			});

			callback(x.arr);
		});
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

		if (hash[2] && x.arr.bases[hash[2]]) {
			var base = x.arr.bases[hash[2]];

			var template = m.template(x.template.s2.list, {
				title: base.title
			});
			x.el.list.html(template);

			x.draw_items();
		} else {
			var template = m.template(x.template.s1.list, {});
			x.el.list.html(template);

			x.draw_base();
		}
	},
	handlers_bases: function()
	{
		var x = this;

		x.el.list.on('click', '.header.s1 .create_base', function(){
			x.add_base();
		}).on('click', '.wrapper.s1 .edit_base', function(){
			var th = $(this).parent();
			var id = th.attr('data');
			th.addClass('edited').siblings().removeClass('edited');
			x.edit_base(id);
			return false;
		}).on('click', '.wrapper.s1 .remove_base', function(){
			var th = $(this).parent();
			x.remove_base(th);
			return false;
		});

		x.el.form.on('click', '.header.s1 .save', function(){
			x.save_base();
		}).on('click', '.header.s1 .save_close', function(){
			x.save_base(true);
		}).on('click', '.header.s1 .close', function(){
			x.close_base();
		}).on('click', '.wrapper.s1 .group.fields p', function(){
			var th = $(this);
			var id = th.attr('data');
			var table = $('.field.checkbox .table', x.el.form);
			th.toggleClass('active');

			if (th.hasClass('active')) {
				table.append(th.clone().removeClass('active'));
				table.append($('.clr', table));
			} else {
				$('p.i' + id, table).remove();
			}
		}).on('click', '.wrapper.s1 .group.table p', function(){
			$(this).toggleClass('active');
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
	},
	handlers_items: function()
	{
		var x = this;

		x.select = function(){
			var tr = $('.wrapper.s2 tbody tr', x.el.list);
			var selected = tr.filter('.selected');

			$('.wrapper.s2 thead tr', x.el.list).toggleClass('selected', selected.length === tr.length);
		};
		var filter = function(){
			x.filter_text = $('.header.s2 .filter input', x.el.list).val().trim().toLowerCase();
			x.filter = !!x.filter_text;

			x.draw_items();
		};

		x.el.list.on('click', '.header.s2 .create_item', function(){
			x.add_items();
		}).on('click', '.header.s2 .create_pdf', function(){
			var ids = $('.wrapper.s2 tbody tr.selected', x.el.list).map(function(){
				return +$(this).attr('data');
			}).get();
			x.create_pdf(ids);
		}).on('keyup', '.header.s2 .filter input', function(){
			filter();
		}).on('click', '.header.s2 .menu p', function(){
			var th = $(this);
			var data = th.attr('data');

			if (data === 'select_all') {
				$('.wrapper.s2 tbody tr', x.el.list).addClass('selected');
				x.select();
			}
			if (data === 'unselect_all') {
				$('.wrapper.s2 tbody tr', x.el.list).removeClass('selected');
				x.select();
			}
			if (data === 'create_items_from_selected') {
				var ids = $('.wrapper.s2 tbody tr.selected', x.el.list).map(function(){
					return +$(this).attr('data');
				}).get();
				x.create_items(ids);
			}
			if (data === 'clone_selected') {
				var ids = $('.wrapper.s2 tbody tr.selected', x.el.list).map(function(){
					return +$(this).attr('data');
				}).get();
				x.clone_items(ids);
			}
			if (data === 'remove_selected') {
				x.remove_items();
			}
		}).on('click', '.wrapper.s2 thead .select', function(){
			var tr = $(this).parent();
			tr.toggleClass('selected');

			$('.wrapper.s2 tbody tr', x.el.list).toggleClass('selected', tr.hasClass('selected'));

			x.select();
		}).on('click', '.wrapper.s2 thead td', function(){
			var th = $(this);
			var data = th.attr('data');

			if (data) {
				x.sorting = {param: data, direction: th.hasClass('ASC') ? 'DESC' : 'ASC'};
				x.draw_items();
				x.select();
			}
		}).on('click', '.wrapper.s2 tbody .select', function(){
			var tr = $(this).parent();
			tr.toggleClass('selected');

			x.select();

			return false;
		}).on('click', '.wrapper.s2 tbody tr', function(){
			var th = $(this);
			var id = th.attr('data');

			th.addClass('edited').siblings().removeClass('edited');
			x.edit_items(id);
		}).on('click', '.wrapper.s2 .clear_filter', function(){
			$('.header.s2 .filter input', x.el.list).val('');
			filter();
		});

		x.el.form.on('click', '.header.s2 .lang', function(){
			var th = $(this);
			var data = th.text();

			th.addClass('active').siblings().removeClass('active');

			x.language.select(data, x, false);
		}).on('click', '.header.s2 .save', function(){
			x.save_items();
		}).on('click', '.header.s2 .save_close', function(){
			x.save_items(true);
		}).on('click', '.header.s2 .close', function(){
			x.close_items();
		}).on('blur', '.wrapper.s2 #private_title', function(){
			var val = $(this).val().trim();
			var public_title = $('#public_title', x.el.form);
			var public_title_val = public_title.val().trim();
			if (!public_title_val) public_title.val(val);
		});
	},
	draw_base: function()
	{
		var x = this;

		var html = $.map(x.arr.bases, function(el, i){
			return m.template(x.template.s1.list_item, {
				id: i,
				title: el.title || x.lang['bases_list_title_undefined'],
				classes: (x.mode == i ? 'edited' : ''),
				icon_edit: icons.edit,
				icon_remove: icons.remove
			});
		});

		$('.wrapper.s1 .bases', x.el.list).html(html.join(''));
	},
	add_base: function(id)
	{
		var x = this;

		x.mode = 0;

		var template = m.template(x.template.s1.form, {
			title: x.lang['bases_form_title_new'],
			uid_mask: 'UID',
			fields: $.map(fields.arr.fields['#'].childs, function(id, k){
				if (id && fields.arr.fields[id]) return '<p class="br3 i' + id + '" data="' + id + '">' + fields.arr.fields[id].private_title + '</p>';
			}).join('')
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#title', x.el.form).focus();
			$('.group.fields', x.el.form).sortable({items: 'p', tolerance: 'pointer'});
			$('.group.table', x.el.form).sortable({items: 'p', tolerance: 'pointer'});

			// UID
			$('.switch', x.el.form).html(ui.switch.html());
			var sw = $('.switch .ui-switch', x.el.form);
			ui.switch.init(sw, {
				status: false,
				change: function(status){
					$('.switch', x.el.form).next().toggle(status);
				},
				text: x.lang['bases_form_uid_use']
			});
			$('.uid .checkbox .group', x.el.form).sortable({items: 'p', tolerance: 'pointer'});
		}, 210);
	},
	edit_base: function(id)
	{
		var x = this;

		x.mode = id;

		var f = JSON.parse(x.arr.bases[id].fields || '{}');

		var template = m.template(x.template.s1.form, {
			title: vsprintf(x.lang['bases_form_title_edit'], [x.arr.bases[id].title]),
			uid_mask: f.uid ? f.uid.mask : '',
			fields: $.map(fields.arr.fields['#'].childs, function(id, k){
				if (id && fields.arr.fields[id]) return '<p class="br3 i' + id + '" data="' + id + '">' + fields.arr.fields[id].private_title + '</p>';
			}).join('')
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#title', x.el.form).val(x.arr.bases[id].title);

			var parent_fields = $('.group.fields', x.el.form);
			var parent_table = $('.group.table', x.el.form);

			$.each(f.fields, function(i, id){
				if (id && fields.arr.fields[id]) {
					var el = $('p.i' + id, parent_fields);
					el.clone().appendTo(parent_table);
					el.addClass('active').appendTo(parent_fields);
					$('.clr', parent_fields).appendTo(parent_fields);
				}
			});
			$.each(f.table, function(i, id){
				if (!id) return true;

				if (typeof id === 'number') {
					if (fields.arr.fields[id]) {
						$('p.i' + id, parent_table).addClass('active').appendTo(parent_table);
						$('.clr', parent_table).appendTo(parent_table);
					}
				} else {
					$('p[data="' + id + '"]', parent_table).addClass('active').appendTo(parent_table);
					$('.clr', parent_table).appendTo(parent_table);
				}
			});

			parent_fields.sortable({items: 'p', tolerance: 'pointer'});
			parent_table.sortable({items: 'p', tolerance: 'pointer'});

			// UID
			$('.switch', x.el.form).html(ui.switch.html());
			var sw = $('.switch .ui-switch', x.el.form);
			ui.switch.init(sw, {
				status: f.uid ? f.uid.use : false,
				change: function(status){
					$('.switch', x.el.form).next().toggle(status);
				},
				text: x.lang['bases_form_uid_use']
			});
			if (f.uid) {
				var group = $('.uid .checkbox .group', x.el.form);
				$.each(f.uid.template, function(i, el){
					if (typeof el === 'number') {
						$('<p class="br3 active"></p>').append('<input type="text" placeholder="' + x.lang['bases_form_uid_fid_placeholder'] + '" value="' + el + '">').appendTo(group);
					} else {
						group.find('p[data="' + el + '"]').trigger('click').appendTo(group);
					}
				});
				group.find('.add').appendTo(group);
				group.find('.clr').appendTo(group);
			}
			$('.uid .checkbox .group', x.el.form).sortable({items: 'p', tolerance: 'pointer'});
		}, 210);
	},
	remove_base: function(elems)
	{
		var x = this;

		if (!elems.length) return false;

		var ids = elems.addClass('removed').map(function(){
			return $(this).attr('data');
		}).get();

		alertify.confirm(x.lang['bases_list_remove_base'], function(e){
			if (!e) {
				elems.removeClass('removed');
				return false;
			}

			loader.show();

			var count = 0;
			var redraw = function(){
				if (++count === ids.length) {
					x.draw_base();
					loader.hide();
				}
			};
			$.each(ids, function(i, el){
				var data = {id: el};
				$.post('?plugins/bases/page/bases_delete', data, function(json){
					if (json.status === 'OK') {
						delete x.arr.bases[el];
						$.each(x.arr.items, function(index, elem){
							if (elem.base == el) delete x.arr.items[index];
						});
						redraw();
					} else {
						m.report('?plugins/bases/page/bases_delete', data, JSON.stringify(json));
						loader.hide();
					}
				}, 'json');
			});
		});
	},
	save_base: function(close)
	{
		var x = this;

		loader.show();

		var title = $('#title', x.el.form).val().trim();
		var uid = $('.uid', x.el.form);
		var f = {
			fields: $('.group.fields p.active', x.el.form).map(function(){
				return +$(this).attr('data');
			}).get(),
			table: $('.group.table p.active', x.el.form).map(function(){
				var data = $(this).attr('data');

				if (data === 'id' || data === 'uid' || data === 'title' || data === 'date_added') return data;
				return +data;
			}).get(),
			uid: {
				use: ui.switch.get($('.switch .ui-switch', uid)),
				mask: $('.mask input', uid).val().trim(),
				template: $('.checkbox p.active', uid).map(function(){
					var th = $(this);
					var data = th.attr('data');

					if (data) return data;

					var id = +$('input', th).val().trim();
					if (fields.arr.fields[id] && (fields.arr.fields[id].type === 'text' || fields.arr.fields[id].type === 'items')) return id;
				}).get()
			}
		};

		var data = {
			title: title,
			fields: JSON.stringify(f)
		};
		if (x.mode) data.id = x.mode;

		var url = '?plugins/bases/page/bases_' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				if (x.mode) {
					$.extend(x.arr.bases[x.mode], data, {date_change: json.date_change});
				} else {
					x.mode = +json.id;
					$.extend(data, {id: x.mode, date_added: json.date_added, date_change: json.date_change});
					x.arr.bases[x.mode] = data;
				}

				x.draw_base();
				loader.hide();

				if (close) {
					x.close_base();
				} else {
					$('.header .title', x.el.form).text(sprintf(x.lang['bases_form_title_edit'], [title]));
				}
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	close_base: function()
	{
		var x = this;

		x.mode = false;
		$('.base.edited', x.el.list).removeClass('edited');

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');
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
			$.each($.parseJSON(s.arr.bases[hash[2]].fields).fields, function(i, id){
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
	draw_items: function()
	{
		var x = this;

		var base = x.arr.bases[hash[2]];
		var f = $.parseJSON(base.fields);

		var load_items = f.table.some(function(id){
			return (typeof id === 'number' && fields.arr.fields[id].type === 'items');
		});

		var start = function(){
			var thead = '<tr class="thead">\
				<td class="select">' + icons.select_empty + icons.select_checked + '</td>\
				' + $.map(f.table, function(id){
					if (id) {
						if (typeof id === 'number') {
							if (fields.arr.fields[id]) {
								return '<td class="f' + id + '' + (x.sorting.param == id ? ' ' + x.sorting.direction : '') + '" data="' + id + '">' + fields.arr.fields[id].private_title + '</td>';
							}
						} else {
							if (id === 'id')
								return '<td class="id' + (x.sorting.param == 'id' ? ' ' + x.sorting.direction : '') + '" data="id">ID</td>';
							if (id === 'uid')
								return '<td class="uid' + (x.sorting.param == 'uid' ? ' ' + x.sorting.direction : '') + '" data="uid">UID</td>';
							if (id === 'title')
								return '<td class="title' + (x.sorting.param == 'title' ? ' ' + x.sorting.direction : '') + '" data="title">' + x.lang['bases_i_list_table_title'] + '</td>';
							if (id === 'date_added')
								return '<td class="date' + (x.sorting.param == 'date' ? ' ' + x.sorting.direction : '') + '" data="date">' + x.lang['bases_i_list_table_date_added'] + '</td>';
						}
					}
				}).join('') + '\
			</tr>';

			var items_full = $.map(x.arr.items, function(el){
				var el = $.extend({}, el);
				el.fields = $.parseJSON(el.fields || '{}')[settings.arr['langFrontDefault']];
				return el;
			});
			// filter start
			if (x.filter) {
				var items = $.map(items_full, function(el){
					var valid = true;
					var vars = $.map(f.table, function(id){
						if (id) {
							if (typeof id === 'number') {
								if (fields.arr.fields[id]) {
									var type = fields.arr.fields[id].type;
									return fields.types[type].bases.view(el.fields[id] || '', id);
								}
							} else {
								if (id === 'id') return el.id;
								if (id === 'uid') return el.uid;
								if (id === 'title') return el.private_title + ' ' + el.public_title;
							}
						}
					}).join(' ').toLowerCase();

					$.each(x.filter_text.split(' '), function(i, text){
						if (vars.indexOf(text) === -1) valid = false;
					});

					if (valid) return el;
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

			var tbody = '';
			$.each(items, function(i, el){
				if (el.base == hash[2]) {
					var edited = x.mode == el.id ? ' class="edited"' : '';

					var date = new Date(el.date_added * 1000);
					var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
					var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
					var year = date.getFullYear();
					var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
					var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

					tbody += '<tr data="' + el.id + '"' + edited + '>\
						<td class="select">' + icons.select_empty + icons.select_checked + '</td>\
						' + $.map(f.table, function(id){
							if (id) {
								if (typeof id === 'number') {
									if (fields.arr.fields[id]) {
										var type = fields.arr.fields[id].type;
										return '<td class="f' + id + ' type_' + type + '">' + fields.types[type].bases.view(el.fields[id] || '', id) + '</td>';
									}
								} else {
									if (id === 'id')
										return '<td class="id">' + el.id + '</td>';
									if (id === 'uid')
										return '<td class="uid">' + el.uid + '</td>';
									if (id === 'title')
										return '<td class="title">' + el.private_title + '</td>';
									if (id === 'date_added')
										return '<td class="date">' + day + '.' + month + '.' + year + ' ' + hours + ':' + minutes + '</td>';
								}
							}
						}).join('') + '\
					</tr>';
				}
			});

			var info = '';
			if (x.filter) {
				info = '<div class="filter' + (items.length ? '' : ' empty') + '">' + vsprintf(x.lang['bases_i_list_table_bottom_showing'], [items.length, items_full.length]) + ' <span class="clear_filter">' + x.lang['bases_i_list_table_bottom_clear_filter'] + '</span></div>';
			} else {
				info = tbody ? '' : '<div class="empty">' + x.lang['bases_i_list_table_empty'] + '</div>';
			}

			var template = (tbody ? '<table><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>' : '') + info;
			$('.wrapper.s2 .items', x.el.list).html(template);
		};

		if (load_items) {
			items.loadList(function(){
				start();
			});
		} else {
			start();
		}
	},
	add_items: function()
	{
		var x = this;

		x.mode = 0;

		x.language.setDefault();

		var template = m.template(x.template.s2.form, {
			title: x.lang['bases_i_form_create_item'],
			language: $.map(x.language.getLangs(), function(title, alias){
				return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
			}).join(''),
			uid: ''
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#private_title', x.el.form).focus();
			$.each($.parseJSON(x.arr.bases[hash[2]].fields).fields, function(i, id){
				if (id && fields.arr.fields[id]) x.append_fields(id);
			});
		}, 210);
	},
	edit_items: function(id)
	{
		var x = this;

		x.mode = id;

		x.language.setDefault();

		var template = m.template(x.template.s2.form, {
			title: vsprintf(x.lang['bases_i_form_edit_item'], [x.arr.items[id].private_title]),
			language: $.map(x.language.getLangs(), function(title, alias){
				return '<div class="lang animate1 br3' + (x.language.active === alias ? ' default active' : '') + '" title="' + title + '">' + alias + '</div>';
			}).join(''),
			uid: x.arr.items[id].uid || ''
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#private_title', x.el.form).val(x.arr.items[id].private_title);
			$('.container.uid', x.el.form).show();

			x.language.setValue(x.arr.items[id].public_title, 'public_title');
			x.language.setValue(x.arr.items[id].fields, 'fields');

			x.language.select(x.language.active, x, true);
		}, 210);
	},
	append_fields: function(id)
	{
		var x = this;

		var required = false;

		var base = x.arr.bases[hash[2]];
		var f = $.parseJSON(base.fields);
		var required = f.uid && f.uid.use && ($.inArray(id, f.uid.template) + 1);

		var field = fields.arr.fields[id];

		if (!field) return false;

		var container = $('<div class="container custom">\
			<div class="field ' + field.type + '" data="' + id + '">\
				<div class="head"><p>' + field.private_title + (required ? ' <r>*</r>' : '') + '</p></div>\
				<div class="group"></div>\
			</div>\
		</div>').appendTo($('.wrapper.s2', x.el.form));

		fields.types[field.type].item_add($('.group', container), x.language.fields[x.language.active].fields[id], field.value, 'plugin_bases_page', x.language.active);
	},
	save_items: function(close)
	{
		var x = this;

		loader.show();

		x.language.set(x);

		var private_title = $('#private_title', x.el.form).val().trim();
		var public_title = {};
		var fields = {};

		$.each(x.language.fields, function(i, el){
			public_title[i] = el.public_title || '';
			fields[i] = el.fields || '{}';
		});

		// check uid generate
		var base = x.arr.bases[hash[2]];
		var f = $.parseJSON(base.fields);
		if (f.uid && f.uid.use) {
			var valid = true;
			$.each(f.uid.template, function(i, el){
				if (typeof el === 'number') {
					if (!fields[settings.arr.langFrontDefault][el]) valid = false;
				}
			});
			if (!valid) {
				alertify.error(x.lang['bases_i_form_error_save_required']);
				loader.hide();
				return false;
			}
		}

		var data = {
			private_title: private_title,
			public_title: JSON.stringify(public_title),
			fields: JSON.stringify(fields)
		};
		if (x.mode) {
			data.id = x.mode;
			data.uid = $('#uid', x.el.form).val().trim();
		} else {
			data.base = hash[2];
		}

		var url = '?plugins/bases/page/items_' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json.status === 'OK') {
				if (x.mode) {
					$.extend(x.arr.items[x.mode], data, {date_change: json.date_change});
				} else {
					x.mode = +json.id;
					$.extend(data, {id: x.mode, uid: json.uid, date_added: json.date_added, date_change: json.date_change});
					x.arr.items[x.mode] = data;
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

		x.mode = false;
		$('tr.edited', x.el.list).removeClass('edited');

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');
	},
	create_pdf: function(ids, path)
	{
		var x = this;

		if (!ids.length) {
			alertify.error(x.lang['bases_i_list_create_pdf_no_selected_item']);
			return false;
		}

		x.el.overlay.addClass('show').removeClass('loader');
		$('.pdf', x.el.list).addClass('show');

		var loaded = false;
		var close = function(){
			x.el.overlay.removeClass('show').addClass('loader');
			$('.pdf', x.el.list).removeClass('show');

			x.el.overlay.off('click');
			$('.pdf', x.el.list).off();

			setTimeout(function(){
				$('.pdf .langs', x.el.list).empty();
				$('.pdf .requests', x.el.list).empty();
				$('.pdf .templates', x.el.list).html('<div class="loader br3"></div>');
				$('.pdf .link', x.el.list).attr('href', '#');
			}, 210);
		};
		var update = function(){
			var url = '?plugins/bases/page/items_pdf&id=' + ids.join(',') + '&path=' + $('.pdf .template.active', x.el.list).index() + '&lang=' + $('.pdf .lang.active', x.el.list).text();

			$('.pdf .request.active .container', x.el.list).each(function(){
				var th = $(this);
				var alias = th.find('.field').attr('data');
				var type = th.find('.field').attr('type');

				var value = fields.types[type].item_save(th.find('.group'));

				url += '&' + alias + '=' + encodeURIComponent(value);
			});

			$('.pdf a', x.el.list).attr('href', url);
		};

		$('.pdf .langs', x.el.list).html($.map(x.language.getLangs(), function(title, alias){
			return '<div class="lang animate1 br3' + (settings.arr.langFrontDefault === alias ? ' active' : '') + '" title="' + title + '">' + alias + '</div>';
		}).join(''));

		var url = '?plugins/bases/page/items_pdf_templates';
		$.get(url, function(json){
			if (json.status === 'OK') {
				if (json.templates.length) {
					$('.pdf .templates', x.el.list).html($.map(json.templates, function(el, i){
						return '<div class="template animate1 br3' + (i === 0 ? ' active' : '') + '" title="' + el[1] + '">' + el[0] + '</div>';
					}).join(''));

					$.each(json.templates, function(i, el){
						var request = $('<div class="request"></div>');

						if (i === 0) request.addClass('active');

						$('.pdf .requests', x.el.list).append(request);

						$.each(el[2], function(index, r){
							var container = $('<div class="container">\
								<div class="field ' + r.type + '" data="' + r.id + '" type="' + r.type + '">\
									<div class="head"><p>' + r.title + '</p></div>\
									<div class="group"></div>\
								</div>\
							</div>').appendTo(request);

							fields.types[r.type].item_add($('.group', container), '', '', 'bases', '');
						});
					});

					loaded = true;
					update();
				} else {
					$('.pdf .templates', x.el.list).html('<div class="empty">' + x.lang['bases_i_list_create_pdf_empty_template'] + '</div>');
				}
			} else {
				m.report(url, {}, JSON.stringify(json));
			}
		}, 'json');

		x.el.overlay.one('click', function(){
			close();
		});
		$('.pdf', x.el.list).on('click', '.close', function(){
			close();
		}).on('click', '.lang', function(){
			$(this).addClass('active').siblings().removeClass('active');
			update();
		}).on('click', '.template', function(){
			var th = $(this);
			var index = th.index();

			th.addClass('active').siblings().removeClass('active');
			$('.pdf .requests .request', x.el.list).removeClass('active').eq(index).addClass('active');

			update();
		}).on('mouseenter', 'a', function(){
			update();
		}).on('click', 'a', function(){
			if (!loaded) return false;
		});
	},
	create_items: function(ids)
	{
		var x = this;

		if (!ids.length) return false;

		var parent = $('<div id="plugin_bases_cifs">\
			<div class="overlay loader animate2"></div>\
			<div class="popup br3 animate2"></div>\
		</div>').appendTo('body');
		var items = {};
		var opened = ['#'];

		parent.on('click', '.create', function(){
			var id = opened[opened.length - 1];

			$('.popup', parent).removeClass('show');

			setTimeout(function(){
				$.post('?plugins/bases/page/set_cifs', {ids: ids, id: id}, function(json){
					if (json.status) {
						$('.cancel', parent).trigger('click');
					}
				}, 'json');
			}, 210);
		}).on('click', '.cancel', function(){
			$('.overlay', parent).removeClass('show');
			$('.popup', parent).removeClass('show');

			setTimeout(function(){
				parent.remove();
			}, 210);
		}).on('click', '.item', function(){
			var th = $(this);
			var id = +th.attr('data');
			var index = th.parents('.scroll').index() + 1;

			opened.splice(index, opened.length - index, id);

			draw();
		});

		$('.overlay', parent).addClass('show');

		setTimeout(function(){
			$('.popup', parent).html('\
				<div class="header">\
					<div class="actions">\
						<div class="br3 create">' + x.lang['bases_i_list_cifs_create'] + '</div>\
						<div class="br3 cancel">' + x.lang['bases_i_list_cifs_cancel'] + '</div>\
					</div>\
					<div class="title">' + x.lang['bases_i_list_cifs_title'] + '</div>\
				</div>\
				<div class="wrapper box"></div>\
			');

			$.get('?plugins/bases/page/get_cifs', function(json){
				$.each(json.items, function(i, el){
					var id = el[0];

					items[id] = {
						id: id,
						title: el[1],
						parent: el[2],
						childs: el[3]
					};
				});

				$('.popup', parent).addClass('show');

				setTimeout(function(){
					draw();
				}, 210);
			}, 'json');
		}, 210);

		var getCount = function(id){
			var childs = 0;

			var child = function(id){
				if (!items[id]) return false;

				$.each(items[id].childs, function(i, el){
					if (items[el]) {
						childs++;
						child(el);
					}
				});
			};
			child(id);

			return (childs ? childs : '');
		};

		var draw = function(){
			$('.wrapper', parent).empty();

			$.each(opened, function(i, id){
				var last = i === opened.length - 1;
				if (last) {
					last = '<div class="append br3">' + x.lang['bases_i_list_cifs_ph_append'] + '</div>';
				} else {
					last = '';
				}

				$('.wrapper', parent).append('<div class="scroll">\
					<div class="viewport"><div class="overview">\
						' + last + '\
						' + $.map(items[id].childs, function(el){
							var open = el === opened[i + 1] ? ' opened' : '';
							return '<div class="item br3 animate1' + open + '" data="' + el + '" title="ID ' + el + '">\
								<p class="count">' + getCount(el) + '</p>\
								<p class="title">' + items[el].title + '</p>\
							</div>';
						}).join('') + '\
					</div></div>\
					<div class="scrollbar animate1"><div class="track"><div class="thumb br3"></div></div></div>\
				</div>');
			});

			var indent = Math.max(0, opened.length - 4) * 25;

			$('.scroll', parent).css({left: -indent + '%'}).tinyscrollbar();
		};
	},
	clone_items: function(ids)
	{
		var x = this;

		if (!ids.length) return false;

		loader.show();

		var count = ids.length;
		var create = function(){
			count--;

			if (count < 0) {
				x.draw_items();
				loader.hide();
				return false;
			}

			var id = ids[count];
			var item = x.arr.items[id];

			if (!item) create();

			var data = $.extend({}, item);
			delete data.date_change;
			delete data.date_added;
			delete data.id;
			delete data.uid;

			var url = '?plugins/bases/page/items_add';
			$.post(url, data, function(json){
				if (json.status == 'OK') {
					var id = +json.id;
					$.extend(data, {id: id, uid: json.uid, date_added: json.date_added, date_change: json.date_change});
					x.arr.items[id] = data;
				} else {
					m.report(url, data, JSON.stringify(json));
					loader.hide();
				}

				create();
			}, 'json');
		};
		create();
	},
	remove_items: function()
	{
		var x = this;

		var elems = $('tr.selected', x.el.list);

		if (!elems.length) return false;

		var ids = elems.addClass('removed').map(function(){
			return $(this).attr('data');
		}).get();

		// проверять права на удаление итемов
		alertify.confirm(x.lang['bases_i_list_remove_item'], function(e){
			if (e) {
				loader.show();

				var count = 0;
				var redraw = function(){
					if (++count === ids.length) {
						x.draw_items();
						x.select();
						loader.hide();
					}
				};
				$.each(ids, function(i, el){
					var url = '?plugins/bases/page/items_delete', data = {id: el};
					$.post(url, data, function(json){
						if (json.status === 'OK') {
							delete x.arr.items[el];
							redraw();
						} else {
							m.report(url, data, JSON.stringify(json));
							loader.hide();
						}
					}, 'json');
				});
			} else {
				elems.removeClass('removed');
			}
		});
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