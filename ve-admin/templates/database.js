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

		x.ed = {};
		x.template = {};
		x.template.form = x.el.form.html();
		x.template.settings = x.el.settings.html();

		x.edition_modal.init();
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
				var id = el[0];
				x.arr[id] = {
					id: id,
					image: el[1],
					uid: el[2],
					type: el[3],
					unique: el[4],
					private_title: el[5],
					public_title: el[6],
					fields: el[7],
					date_added: el[8],
					date_change: el[9],
					edited: x.mode == id ? 0 : el[10],
					ed_status: el[11] || 1
				};
			});

			callback(x.arr);
		}, 'json');
	},
	draw_items: function(callback)
	{
		var x = this;

		var button_c = '<div class="br3 clone" title="' + lang['database_list_clone'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488.3 488.3"><path d="M314.25 85.4h-227c-21.3 0-38.6 17.3-38.6 38.6v325.7c0 21.3 17.3 38.6 38.6 38.6h227c21.3 0 38.6-17.3 38.6-38.6V124c-.1-21.3-17.4-38.6-38.6-38.6zm11.5 364.2c0 6.4-5.2 11.6-11.6 11.6h-227c-6.4 0-11.6-5.2-11.6-11.6V124c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.6z"/><path d="M401.05 0h-227c-21.3 0-38.6 17.3-38.6 38.6 0 7.5 6 13.5 13.5 13.5s13.5-6 13.5-13.5c0-6.4 5.2-11.6 11.6-11.6h227c6.4 0 11.6 5.2 11.6 11.6v325.7c0 6.4-5.2 11.6-11.6 11.6-7.5 0-13.5 6-13.5 13.5s6 13.5 13.5 13.5c21.3 0 38.6-17.3 38.6-38.6V38.6c0-21.3-17.3-38.6-38.6-38.6z"/></svg></div>';
		var button_r = '<div class="br3 remove" title="' + lang['database_list_remove'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>';
		var button_e = '<div class="br3 editions" title="' + lang['database_list_editions'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 331.331 331.331"><path d="M30.421 317.462l4.422-17.661-12.194-4.814-8.376 13.804s4.618 12.526-.511 22.539c.004.001 6.422-10.931 16.659-13.868zm-8.192-8.104c1.501-.615 3.231.087 3.851 1.561.625 1.474-.087 3.171-1.588 3.786-1.501.615-3.231-.087-3.851-1.561-.631-1.48.082-3.177 1.588-3.786zM158.353 112.621c-35.115 28.8-81.086 88.124-120.073 157.423l-.022-.027-6.815 12.026 7.267 2.796 3.84-10.117c20.799-37.491 77.224-135.4 180.397-200.451 0 0 38.411-22.877 76.256-54.516-9.214 7.702-27.391 17.356-37.247 23.584-25.868 16.344-57.79 31.704-103.603 69.282z"/><path d="M33.2 215.365c-7.985 28.223-7.528 49.718-4.438 55.625h4.83c13.337-27.625 77.572-127.693 117.554-159.016 41.424-32.455 73.378-51.339 100.253-65.111 9.437-4.835 19.118-11.384 27.848-17.949 10.601-8.36 21.348-17.302 30.758-26.053L282.728 20.75 294.89 2.148l-23.22 23.611L286.78 0c-35.746 3.225-68.918 21.109-68.918 21.109-13.271 15.741-23.959 40.782-23.959 40.782-.37-12.521 8.11-31.481 8.11-31.481-6.266 2.861-30.073 16.459-30.073 16.459-11.645 9.66-15.262 35.06-15.262 35.06-2.214-10.019 5.526-29.333 5.526-29.333-33.543 19.32-57.502 52.231-57.502 52.231-16.584 32.553-2.948 57.953-8.11 51.872-5.162-6.081-4.052-28.261-4.052-28.261-35.017 33.63-38.699 49.724-38.699 49.724-5.896 14.31-11.058 52.59-11.058 52.59-3.318-3.579 0-23.611 0-23.611-8.479 17.889-4.422 34.701-4.422 34.701-4.052-1.435-5.161-26.477-5.161-26.477z"/><path d="M310.01 14.191s-13.483 13.065-30.758 26.053c-27.081 21.359-53.156 38.819-53.156 38.819C123.945 139.425 67.025 237.932 48.212 271.708h10.002c3.535-2.834 8.844-4.971 31.014-11.389 28.011-8.11 44.72-25.041 44.72-25.041s-25.553 14.31-37.595 12.88-28.223 3.1-28.223 3.1-6.179-2.861 24.291-7.392 80.596-38.634 80.596-38.634-19.167 7.87-28.011 7.152c-8.844-.718-30.714 0-30.714 0 14.495-3.34 28.011-1.43 50.126-9.779s20.886-7.631 20.886-7.631c25.063-8.349 35.474-34.342 35.474-34.342-4.335 1.67-37.443 5.722-51.176 1.67-13.734-4.052-37.132 0-37.132 0 22.115-7.392 27.032-4.052 32.433-4.291 5.406-.239 22.855 1.191 57.502-10.731s44.475-26.711 44.475-26.711l-23.366 3.122c15.257-2.567 32.455-12.662 32.455-12.662-10.568 2.861-27.032 4.291-27.032 4.291 19.412-4.291 30.225-10.253 30.225-10.253 18.183-13.832 22.36-34.342 22.36-34.342-25.803 8.822-46.194 4.77-46.194 4.77 35.387-2.382 45.215-11.449 50.126-13.592 4.917-2.148 6.94-11.03 6.94-11.03-17.878 6.44-38.15 7.511-38.15 7.511 21.93-3.399 40.722-14.49 40.722-14.49V32.792c-8.479 4.83-23.399 8.588-23.399 8.588l23.219-15.023c1.305-7.516-4.776-12.166-4.776-12.166zM23.551 290.571l13.81 5.532 2.572-6.114-13.809-5.531zM177.036 285.458c-45.628 21.936-89.462 36.888-147.758 38.846-5.439.185-5.466 5.624 0 5.439 52.15-1.751 95.543-12.961 137.391-32.575 46.618-21.854 89.435-40.167 147.828-46.39 5.385-.577 3.095-5.814-2.252-5.243-51.714 5.516-93.731 19.984-135.209 39.923z"/></svg></div>';
		var date = function(str){
			var date = new Date(str * 1000);
			var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
			var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
			var year = date.getFullYear();
			var hours = date.getHours(); hours = (hours < 10 ? '0' : '') + hours;
			var minutes = date.getMinutes(); minutes = (minutes < 10 ? '0' : '') + minutes;

			return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
		};

		var items_full = $.map(x.arr, function(el){
			var el = $.extend({}, el);
			el.fields = $.parseJSON(el.fields || '{}')[settings.arr['langFrontDefault']];
			return el;
		});

		// filter start
		if (x.filter.ids === false) {
			var items = items_full;
		} else {
			var items = items_full.filter(function(el) {
				return !!($.inArray(el.id, x.filter.ids) + 1);
			});
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
			var width = Math.round(100 / (x.config.display.length + 1) * 100) / 100;
			var template = '<div class="box {{type}}" style="width:' + width + '%" data="{{attr}}">{{value}}</div>';

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
						if (id === 'status')
							return m.template(template, {
								type: 'status',
								value: lang['database_list_table_status']
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
				var unique = !!el.unique ? ' unique' : '';
				var report_selected = $.inArray(el.id, x.report.selected) + 1 ? ' report_selected' : '';

				body += '<div class="item' + edited + nr + unique + report_selected + '" data="' + el.id + '">\
					' + $.map(x.config.display, function(id){
						if (typeof id === 'number') {
							if (fields.arr.fields[id]) {
								var type = fields.arr.fields[id].type;
								var value = $.inArray(id, x.config.unique) < 0 || !!el.unique ? fields.types[type].bases.view(el.fields[id] || '', id) : '';

								return m.template(template, {
									type: 'f f_' + id + ' f_' + type,
									value: value,
									attr: ''
								});
							}
						} else {
							if (id === 'id')
								return m.template(template, {
									type: 'id',
									value: el.id,
									attr: ''
								});
							if (id === 'image')
								return m.template(template, {
									type: 'image',
									value: '<div class="bg br3"></div>',
									attr: ''
								});
							if (id === 'uid')
								return m.template(template, {
									type: 'uid',
									value: el.uid,
									attr: ''
								});
							if (id === 'title')
								return m.template(template, {
									type: 'title',
									value: el.private_title,
									attr: ''
								});
							if (id === 'status') {
								var status = '';
								if (!!el.unique) status = lang['database_edition_f_' + el.type + '_' + el.ed_status];

								return m.template(template, {
									type: 'status',
									value: status,
									attr: ''
								});
							}
							if (id === 'date_added')
								return m.template(template, {
									type: 'date_added',
									value: date(el.date_added),
									attr: ''
								});
						}
					}).join('') + '\
					<div class="box actions" style="width:' + width + '%">' + button_c + button_r + button_e + '</div>\
				</div>';
			});

			var empty = items.length ? '' : '<div class="empty">' + lang['database_list_table_empty'] + '</div>';

			$('.items', x.el.list).html('<div class="table br3">' + (items.length ? head + body : empty) + '</div>');
			$('.items', x.el.list).append('<style>' + x.config.style + '</style>');
			x.list_items = $('.items .item:not(.head)', x.el.list);
			common.resize();
		}

		if (x.config.view === 'grid') {
			var template = '<div class="item{{edited}}{{nr}}{{unique}}{{report_selected}}" data="{{id}}"><div class="inner br3">\
				<div class="image"><div class="bg"></div></div>\
				<div class="title">{{title}}</div>\
				<div class="info">{{info}}</div>\
				' + button_c + button_e + button_r + '\
			</div></div>';
			var template_info = '<p><b>{{title}}</b>: <span class="f f_{{id}}">{{value}}</span></p>';
			var body = '';
			$.each(items, function(i, el){
				var info = $.map(x.config.display, function(id){
					if (typeof id === 'number') {
						if (fields.arr.fields[id]) {
							var type = fields.arr.fields[id].type;
							var value = $.inArray(id, x.config.unique) < 0 || !!el.unique ? fields.types[type].bases.view(el.fields[id] || '', id) : '';

							return m.template(template_info, {
								title: fields.arr.fields[id].private_title,
								value: value,
								id: id
							});
						}
					} else {
						if (id === 'id')
							return m.template(template_info, {
								title: 'ID',
								value: el.id,
								id: id
							});
						if (id === 'uid')
							return m.template(template_info, {
								title: 'UID',
								value: el.uid,
								id: id
							});
						if (id === 'status') {
							var status = '';
							if (!!el.unique) status = lang['database_edition_f_' + el.type + '_' + el.ed_status];

							return m.template(template_info, {
								title: lang['database_list_table_status'],
								value: status,
								id: id
							});
						}
						if (id === 'date_added')
							return m.template(template_info, {
								title: lang['database_list_table_date_added'],
								value: date(el.date_added),
								id: id
							});
					}
					return '';
				}).join('');

				body += m.template(template, {
					edited: x.mode == el.id ? ' edited' : '',
					nr: el.edited ? ' nr' : '',
					unique: !!el.unique ? ' unique' : '',
					report_selected: $.inArray(el.id, x.report.selected) + 1 ? ' report_selected' : '',
					title: el.private_title,
					info: info,
					id: el.id
				});
			});

			var empty = items.length ? '' : '<div class="empty">' + lang['database_list_grid_empty'] + '</div>';

			$('.items', x.el.list).html('<div class="grid">' + (items.length ? body : empty) + '</div>');
			$('.items', x.el.list).append('<style>' + x.config.style + '</style>');
			x.list_items = $('.items .item:not(.head)', x.el.list);
			common.resize();
		}
		// template end

		x.filter.set([items.length, items_full.length]);

		x.selected();

		if (callback) callback();
	},
	handlers_items: function()
	{
		var x = this;

		x.selected = function(){
			var selected = $('.item.selected', x.el.list);
			var length = selected.length;

			$('.header .remove', x.el.list).toggle(!!length);
		};
		x.filter = {
			ids: false,
			change: function(){
				var s = this;

				var parent = $('.header .filter', x.el.list);

				var text = $('input', parent).val().trim().toLowerCase();

				if (text === s.old) return false;
				s.old = text;

				$('.clear, .count', parent).toggleClass('show', !!text);
				s.ids = text ? [] : false;

				if (s.ajax) s.ajax.abort();
				if (text) {
					$('.items .' + x.config.view, x.el.list).append('<div class="load"></div>');
					s.ajax = $.post('?database/search', {text: text}, function(json){
						if (json.status) {
							s.ids = json.ids;
							x.draw_items();
						}
					});
				} else {
					x.draw_items();
				}
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
						if ($.inArray(el, x.config.unique) + 1) return true;

						var title = false;
						if (typeof el === 'number') {
							if (fields.arr.fields[el]) title = fields.arr.fields[el].private_title;
						} else {
							if (el === 'id') title = 'ID';
							if (el === 'uid') title = 'UID';
							if (el === 'title') title = lang['database_list_table_title'];
							if (el === 'date_added') title = lang['database_list_table_date_added'];
						}

						if (title === false) return true;

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

		$('.items', x.el.list).on('scroll', function(){
			if (!x.list_items || !x.list_items_p) return false;

			Tasks.clear();

			var ws = $(this).scrollTop();
			var wsb = ws + x.list_items_h;

			$.each(x.list_items_p, function(i, el){
				if (el[1]) return true;

				if (ws < el[0]+140 && wsb > el[0]) {
					x.list_items_p[i][1] = true;
					el[2].data('load', true);

					Tasks.unshift(function(callback){
						var id = el[3];

						// image
						var image = x.arr[id].image;
						if (image) {
							$('.bg', el[2]).css({backgroundImage: 'url(/qrs/getfile/' + image + '/200/200/0)'});
						}

						if (x.arr[id].unique) {
							callback();
							return false;
						}

						// unique field
						if (x.ed[id]) {
							$.each(x.ed[id], function(i, v){
								if (i === 'status') {
									$('.' + i, el[2]).html(v);
								} else {
									$('.f.f_' + i, el[2]).html(v);
								}
							});

							common.resize();
							callback();
						} else {
							$.post('?database/get_itemEditions', {id: id}, function(json){
								x.ed[id] = {};
								$.each(json.edition, function(i, v){
									if (i === 'status') {
										var value = '';

										if (v.length > 1) {
											var types = $.map(v, function(){return v.type}).filter(function(v, i, a){return a.indexOf(v) === i});
											// var size = Object.keys(v).length;

											$.each(v, function(k, val){
												var t = val.title;
												if (types.length > 1 && val.type == 1) t += ', ' + lang['database_form_type_physical'];
												if (types.length > 1 && val.type == 2) t += ', ' + lang['database_form_type_digital'];
												if (k !== 0) value += '<br>';
												value += '<b>' + t + ':</b><br>';

												$.each(val.items, function(type, arr){
													var temp = [];
													var text = [];
													$.each(arr, function(p, y){
														if (temp.indexOf(y) + 1) return true;

														temp.push(y);
														var count = arr.reduce(function(prev, item){
															return item === y ? prev+1 : prev;
														}, 0);
														text.push(count + '/' + arr.length + ' ' + lang['database_edition_f_' + val.type + '_' + y]);
													});
													value += '<b>' + type + ':</b><br>' + text.join('<br>') + '<br>';
												});
											});
										} else {
											$.each(v, function(k, val){
												$.each(val.items, function(type, arr){
													var temp = [];
													var text = [];
													$.each(arr, function(p, y){
														if (temp.indexOf(y) + 1) return true;

														temp.push(y);
														var count = arr.reduce(function(prev, item){
															return item === y ? prev+1 : prev;
														}, 0);
														text.push(count + '/' + arr.length + ' ' + lang['database_edition_f_' + val.type + '_' + y]);
													});
													value += '<b>' + type + ':</b><br>' + text.join('<br>') + '<br>';
												});
											});
										}

										$('.' + i, el[2]).html(value);
										x.ed[id][i] = value;
									} else {
										var type = fields.arr.fields[i].type;
										value = $.map(v, function(el){
											return fields.types[type].bases.view(el || '', i);
										}).join(x.config.view === 'table' ? '<br>' : ', ');
										$('.f.f_' + i, el[2]).html(value);
										x.ed[id][i] = value;
									}
								});

								common.resize();
								callback();
							}, 'json');
						}
					}, function(){
						x.list_items_p[i][1] = false;
						el[2].data('load', false);
					});
				}
			});
		});

		x.el.list.on('click', '.header .create_item', function(){
			if (!users.get_access('database', 'add')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			x.add_items();
		}).on('click', '.header .remove', function(){
			if (!users.get_access('database', 'remove')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			var selected = [];
			$('.item.selected', x.el.list).addClass('r').each(function(){
				var th = $(this);
				var id = +th.attr('data');

				selected.push(id);
			});

			x.remove_items(selected, function(){
				x.draw_items();
			});
		}).on('click', '.header .pdf', function(){
			if (!users.get_access('database', 'pdf_view')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			x.pdf.init();
		}).on('click', '.header .actions .report', function(){
			x.report.init();
		}).on('keyup', '.header .filter input', function(){
			clearTimeout(x.timer); x.timer = null;
			x.timer = setTimeout(function(){
				x.filter.change();
			}, 500);
		}).on('click', '.header .filter .clear', function(){
			$('.header .filter input', x.el.list).val('').focus();
			x.filter.change();
		}).on('click', '.header .menu p', function(){
			var th = $(this);
			var data = th.attr('data');

			if (data === 'settings') {
				if (!users.get_access('database', 'settings')) {
					alertify.error(lang['users_access_error']);
					return false;
				}

				x.settings.open();
			}
		}).on('click', '.items .clone', function(){
			if (!users.get_access('database', 'add')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			var th = $(this);
			var id = th.parents('.item').attr('data');

			x.clone_item(id, function(new_id){
				x.draw_items();
			});

			return false;
		}).on('click', '.items .remove', function(){
			if (!users.get_access('database', 'remove')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			var th = $(this);
			var id = th.parents('.item').addClass('r').attr('data');

			x.remove_item(id, function(){
				x.draw_items();
			});

			return false;
		}).on('click', '.items .editions', function(){
			var id = +$(this).parents('.item').attr('data');

			x.edition_modal.open(id);

			return false;
		}).on('click', '.table .item:not(.head)', function(e){
			if (x.report.mode) return false;

			var th = $(this);
			var id = +th.attr('data');

			if (e.ctrlKey) {
				th.toggleClass('selected');
				x.selected();
				return false;
			}

			if (!users.get_access('database', 'edit')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

			th.addClass('edited').siblings().removeClass('edited');
			x.edit_items(id);
		}).on('click', '.grid .inner', function(e){
			if (x.report.mode) return false;

			var th = $(this).parent();
			var id = +th.attr('data');

			if (e.ctrlKey) {
				th.toggleClass('selected');
				x.selected();
				return false;
			}

			if (!users.get_access('database', 'edit')) {
				alertify.error(lang['users_access_error']);
				return false;
			}

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
		}).on('blur', '.wrapper #db_pr_title', function(){
			var val = $(this).val().trim();
			var public_title = $('#db_pu_title', x.el.form);
			var public_title_val = public_title.val().trim();
			if (!public_title_val) public_title.val(val);
		}).on('click', '.container.system .select.type p', function(){
			var th = $(this);
			var data = +th.attr('data');
			th.addClass('active').siblings().removeClass('active');

			$('.edition_settings .col.s', x.el.form).html((function(){
				var status = '';

				if (data === 1) {
					status += '<option value="1" selected>' + lang['database_edition_f_1_1'] + '</option>';
					status += '<option value="6">' + lang['database_edition_f_1_6'] + '</option>';
					status += '<option value="2">' + lang['database_edition_f_1_2'] + '</option>';
					status += '<option value="3">' + lang['database_edition_f_1_3'] + '</option>';
					status += '<option value="4">' + lang['database_edition_f_1_4'] + '</option>';
					status += '<option value="5">' + lang['database_edition_f_1_5'] + '</option>';
				}
				if (data === 2) {
					status += '<option value="5" selected>' + lang['database_edition_f_2_5'] + '</option>';
					status += '<option value="1">' + lang['database_edition_f_2_1'] + '</option>';
					status += '<option value="2">' + lang['database_edition_f_2_2'] + '</option>';
					status += '<option value="3">' + lang['database_edition_f_2_3'] + '</option>';
					status += '<option value="4">' + lang['database_edition_f_2_4'] + '</option>';
				}

				return '<select t="' + data + '">' + status + '</select>';
			})());
			x.edition_settings_select_change();

			alertify.log(lang['database_editionf_status_type_log']);
		}).on('click', '.container.system .select.unique p', function(){
			var th = $(this);
			var data = +th.attr('data');
			th.addClass('active').siblings().removeClass('active');
			$('.edition_settings', x.el.form).toggleClass('hide', !data);
			if (x.mode === 0) return false;
			$('.editions', x.el.form).toggleClass('hide', !!data);
			$.each(x.config.unique, function(i, id){
				$('.container.custom .field[data="' + id + '"]', x.el.form).parent().toggleClass('hide', !data);
			});
		}).on('change', '.edition_settings .col.s select', function(){
			x.edition_settings_select_change();
		});

		x.edition_settings_select_change = function(){
			var select = $('.edition_settings .col.s select', x.el.form);
			var val = +select.val();
			var type = +select.attr('t');
			var parent = $('.edition_settings .col.f', x.el.form);

			$('> div', parent).hide();
			$('> div[data="type"]', parent).removeAttr('style');
			$('.no', parent).show();
			if (type === 1 && val === 2) {
				$('> div[data="location"]', parent).removeAttr('style');
				$('.no', parent).hide();
			}
			if (type === 1 && (val === 4 || val === 5) || type === 2 && (val === 3 || val === 4)) {
				$('> div[data="seller"]', parent).removeAttr('style');
				$('> div[data="client"]', parent).removeAttr('style');
				$('> div[data="date"]', parent).removeAttr('style');
				$('.no', parent).hide();
			}
			if (type === 1 && val === 3 || type === 2 && val === 2) {
				$('> div[data="client"]', parent).removeAttr('style');
				$('> div[data="date_start"]', parent).removeAttr('style');
				$('> div[data="date_end"]', parent).removeAttr('style');
				$('.no', parent).hide();
			}
			if (type === 1 && val === 6 || type === 2 && val === 5) {
				$('> div[data="location"]', parent).removeAttr('style');
				$('> div[data="date_start"]', parent).removeAttr('style');
				$('> div[data="date_end"]', parent).removeAttr('style');
				$('.no', parent).hide();
			}
		};
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

			$('#db_pu_title', s.el.form).val(arr.public_title);

			$('.container.custom', s.el.form).remove();
			$.each(database.config.fields, function(i, id){
				if (id && fields.arr.fields[id]) s.append_fields(id);
			});
		},
		set: function(s)
		{
			var x = this;

			var public_title = $('#db_pu_title', s.el.form).val().trim();

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
	fill_ed_fields: function(str)
	{
		var x = this;

		var ed_f = $.parseJSON(str || '{}');
		var parent = $('.edition_settings .col.f', x.el.form);

		$.each(ed_f, function(i, v){
			$('> div[data="' + i + '"]', parent).html(v);
		});
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
			edition_settings: '',
			ed_status: (function(){
				var status = '';

				if (x.config.type === 1) {
					status += '<option value="1" selected>' + lang['database_edition_f_1_1'] + '</option>';
					status += '<option value="6">' + lang['database_edition_f_1_6'] + '</option>';
					status += '<option value="2">' + lang['database_edition_f_1_2'] + '</option>';
					status += '<option value="3">' + lang['database_edition_f_1_3'] + '</option>';
					status += '<option value="4">' + lang['database_edition_f_1_4'] + '</option>';
					status += '<option value="5">' + lang['database_edition_f_1_5'] + '</option>';
				}
				if (x.config.type === 2) {
					status += '<option value="5" selected>' + lang['database_edition_f_2_5'] + '</option>';
					status += '<option value="1">' + lang['database_edition_f_2_1'] + '</option>';
					status += '<option value="2">' + lang['database_edition_f_2_2'] + '</option>';
					status += '<option value="3">' + lang['database_edition_f_2_3'] + '</option>';
					status += '<option value="4">' + lang['database_edition_f_2_4'] + '</option>';
				}

				return '<select t="' + x.config.type + '">' + status + '</select>';
			})(),
			ed_note: '',
			editions: 'hide'
		});

		x.el.overlay.addClass('show');
		x.el.form.html(template).addClass('show');

		setTimeout(function(){
			$('#db_pr_title', x.el.form).focus();
			$('.container.system .select.type p[data="' + x.config.type + '"]', x.el.form).addClass('active');
			$('.container.system .select.unique p[data="1"]', x.el.form).addClass('active');

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
			x.edit_status = 'vo';
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
					edition_settings: '',
					ed_status: (function(){
						var status = '';

						if (x.arr[id].type === 1) {
							status += '<option value="1"' + (x.arr[id].ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
							status += '<option value="6"' + (x.arr[id].ed_status === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
							status += '<option value="2"' + (x.arr[id].ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
							status += '<option value="3"' + (x.arr[id].ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
							status += '<option value="4"' + (x.arr[id].ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
							status += '<option value="5"' + (x.arr[id].ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
						}
						if (x.arr[id].type === 2) {
							status += '<option value="5"' + (x.arr[id].ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
							status += '<option value="1"' + (x.arr[id].ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
							status += '<option value="2"' + (x.arr[id].ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
							status += '<option value="3"' + (x.arr[id].ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
							status += '<option value="4"' + (x.arr[id].ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
						}

						return '<select t="' + x.arr[id].type + '">' + status + '</select>';
					})(),
					ed_note: x.arr[id].ed_note,
					editions: 'hide'
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					$('#db_pr_title', x.el.form).val(x.arr[id].private_title);
					$('.container.system .select.type p[data="' + x.arr[id].type + '"]', x.el.form).addClass('active');
					$('.container.system .select.unique p[data="' + x.arr[id].unique + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), x.arr[id].image, null, 'database');

					x.language.setValue(x.arr[id].public_title, 'public_title');
					x.language.setValue(x.arr[id].fields, 'fields');

					x.fill_ed_fields(x.arr[id].ed_fields);
					x.language.select(x.language.active, x, true);

					x.edition_settings_select_change();
				}, 210);
			}, 210);

			return false;
		}

		if (e === 'vd') {
			x.edit_status = 'vd';
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
					edition_settings: item.unique ? '' : 'hide',
					ed_status: (function(){
						var status = '';

						if (item.type === 1) {
							status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
							status += '<option value="6"' + (item.ed_status === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
							status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
							status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
							status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
							status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
						}
						if (item.type === 2) {
							status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
							status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
							status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
							status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
							status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
						}

						return '<select t="' + item.type + '">' + status + '</select>';
					})(),
					ed_note: item.ed_note,
					editions: x.arr[x.mode].edited || item.unique ? 'hide' : ''
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					if (!x.arr[x.mode].edited) x.edition.init();

					$('#db_pr_title', x.el.form).val(item.private_title);
					$('.container.system .select.type p[data="' + item.type + '"]', x.el.form).addClass('active');
					$('.container.system .select.unique p[data="' + item.unique + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), item.image, null, 'database');

					x.language.setValue(item.public_title, 'public_title');
					x.language.setValue(item.fields, 'fields');

					x.language.select(x.language.active, x, true);

					x.fill_ed_fields(item.ed_fields);
					x.edition_settings_select_change();

					setTimeout(function(){
						if (x.mode && !x.arr[x.mode].edited) x.draft.init();
					}, 2000);
				}, 210);
			}, 210);

			return false;
		}

		if (e === 'rd') {
			x.edit_status = 'vo';
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
					edition_settings: x.arr[id].unique ? '' : 'hide',
					ed_status: (function(){
						var status = '';

						if (x.arr[id].type === 1) {
							status += '<option value="1"' + (x.arr[id].ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
							status += '<option value="6"' + (x.arr[id].ed_status === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
							status += '<option value="2"' + (x.arr[id].ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
							status += '<option value="3"' + (x.arr[id].ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
							status += '<option value="4"' + (x.arr[id].ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
							status += '<option value="5"' + (x.arr[id].ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
						}
						if (x.arr[id].type === 2) {
							status += '<option value="5"' + (x.arr[id].ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
							status += '<option value="1"' + (x.arr[id].ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
							status += '<option value="2"' + (x.arr[id].ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
							status += '<option value="3"' + (x.arr[id].ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
							status += '<option value="4"' + (x.arr[id].ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
						}

						return '<select t="' + x.arr[id].type + '">' + status + '</select>';
					})(),
					ed_note: x.arr[id].ed_note,
					editions: x.arr[id].unique ? 'hide' : ''
				});

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					x.edition.init();

					$('#db_pr_title', x.el.form).val(x.arr[id].private_title);
					$('.container.system .select.type p[data="' + x.arr[id].type + '"]', x.el.form).addClass('active');
					$('.container.system .select.unique p[data="' + x.arr[id].unique + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), x.arr[id].image, null, 'database');

					x.language.setValue(x.arr[id].public_title, 'public_title');
					x.language.setValue(x.arr[id].fields, 'fields');

					x.language.select(x.language.active, x, true);

					x.fill_ed_fields(x.arr[id].ed_fields);
					x.edition_settings_select_change();

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
					unique: el[4],
					private_title: el[5],
					public_title: el[6],
					fields: el[7],
					date_added: el[8],
					date_change: el[9],
					edited: el[10],
					ed_status: el[11],
					ed_fields: el[12],
					ed_note: el[13]
				};

				var item = false;

				if (json.draft) {
					x.edit_status = 'vd';
					item = $.extend({}, x.arr[id], json.draft.value);
					x.draft.id = json.draft.id;
					x.draft.data = {item: id, value: JSON.stringify(json.draft.value)};
				} else {
					x.edit_status = 'vo';
					item = x.arr[id];
					x.draft.id = false;
					x.draft.data = false;
				}

				x.language.setDefault();

				if (el[10]) {
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
						edition_settings: '',
						ed_status: (function(){
							var status = '';

							if (item.type === 1) {
								status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
								status += '<option value="6"' + (item.ed_status === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
								status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
								status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
								status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
								status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
							}
							if (item.type === 2) {
								status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
								status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
								status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
								status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
								status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
							}

							return '<select t="' + item.type + '">' + status + '</select>';
						})(),
						ed_note: item.ed_note,
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
						edition_settings: item.unique ? '' : 'hide',
						ed_status: (function(){
							var status = '';

							if (item.type === 1) {
								status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
								status += '<option value="6"' + (item.ed_status === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
								status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
								status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
								status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
								status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
							}
							if (item.type === 2) {
								status += '<option value="5"' + (item.ed_status === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
								status += '<option value="1"' + (item.ed_status === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
								status += '<option value="2"' + (item.ed_status === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
								status += '<option value="3"' + (item.ed_status === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
								status += '<option value="4"' + (item.ed_status === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
							}

							return '<select t="' + item.type + '">' + status + '</select>';
						})(),
						ed_note: item.ed_note,
						editions: item.unique ? 'hide' : ''
					});
				}

				x.el.form.html(template).addClass('show');

				setTimeout(function(){
					if (!el[10]) x.edition.init();

					$('#db_pr_title', x.el.form).val(item.private_title);
					$('.container.system .select.type p[data="' + item.type + '"]', x.el.form).addClass('active');
					$('.container.system .select.unique p[data="' + item.unique + '"]', x.el.form).addClass('active');

					fields.types.file.item_add($('.container.system .field.file .group', x.el.form), item.image, null, 'database');

					x.language.setValue(item.public_title, 'public_title');
					x.language.setValue(item.fields, 'fields');

					x.language.select(x.language.active, x, true);

					x.fill_ed_fields(item.ed_fields);
					x.edition_settings_select_change();

					if (!el[10]) {
						setTimeout(function(){
							if (x.mode) x.draft.init();
						}, 2000);
					}
				}, 210);

				$(window).off('beforeunload').on('beforeunload', function(e){
					return null;
				});
			} else {
				m.report(url, data, JSON.stringify(json));
			}
		}, 'json');
	},
	append_fields: function(id)
	{
		var x = this;

		var required = x.config.uid && x.config.uid.use && ($.inArray(id, x.config.uid.template) + 1);

		var field = fields.arr.fields[id];

		if (!field) return false;

		var hide = '';
		if (x.mode !== 0 && $.inArray(id, x.config.unique) + 1) {
			var item = $.extend({}, x.arr[x.mode], $.parseJSON(x.edit_status === 'vo' ? '{}' : (x.draft.data.value || '{}')));
			if (!item.unique) hide = ' hide';
		}
		var container = $('<div class="container custom' + hide + '">\
			<div class="field ' + field.type + '" data="' + id + '">\
				<div class="head"><p>' + field.private_title + (required ? ' <r>*</r>' : '') + '</p></div>\
				<div class="group"></div>\
			</div>\
		</div>').insertBefore($('.edition_settings', x.el.form));

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

		var private_title = $('#db_pr_title', x.el.form).val().trim();
		var image = fields.types.file.item_save($('.container.system .field.file .group', x.el.form)) || 0;
		var type = +$('.container.system .select.type p.active', x.el.form).attr('data');
		var unique = +$('.container.system .select.unique p.active', x.el.form).attr('data');
		var ed_status = +$('.edition_settings .col.s select', x.el.form).val();
		var ed_fields = {};
		$('.edition_settings .col.f > div', x.el.form).each(function(){
			var th = $(this);
			var i = th.attr('data');
			var val = th.text();
			if (!val) th.empty();
			val = th.html();

			if (i) ed_fields[i] = val;
		});
		var ed_note_el = $('.edition_settings .col.n', x.el.form);
		var ed_note = ed_note_el.text();
		if (!ed_note) ed_note_el.empty();
		ed_note = ed_note_el.html();
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
			unique: unique,
			fields: JSON.stringify(f),
			ed_status: ed_status,
			ed_fields: JSON.stringify(ed_fields),
			ed_note: ed_note
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
					x.arr[x.mode] = $.extend({}, data, {id: x.mode, uid: json.uid, date_added: json.date_added, date_change: json.date_change});
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

		$(window).off('beforeunload');
	},
	edition:
	{
		el: {},
		init: function(){
			var x = this;

			x.d = database;
			x.el.parent = $('.editions', x.d.el.form);

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
				setTimeout(function(){
					x.item_input(th);
				}, 100);
				x.focus = false;
			}).on('click', '.childs .i .f .popup .v', function(){
				var th = $(this);
				var html = th.html();
				var parent = th.parent();
				parent.prev().html(html);
				parent.remove();
			}).on('click', '.childs .i .c .button', function(){
				var th = $(this);
				x.item_captions(th);
			}).on('blur', '.childs .i .nt', function(){
				var th = $(this);
				x.item_note(th);
			});

			$.post('?database/edition_get_editions', {id: x.d.mode}, function(json){
				x.editions = json.items;
				x.draw();
			}, 'json');

			if (x.created) return false;
			x.created = true;

			x.el.form = $('.edition_form', x.d.el.parent);
			x.template = {
				form: x.el.form.html()
			}

			x.el.form.on('click', '.header .save', function(){
				x.edition_save();
			}).on('click', '.header .close', function(){
				x.form_close();
			}).on('click', '.select p', function(){
				$(this).addClass('active').siblings().removeClass('active');
			});
		},
		draw: function(){
			var x = this;

			var items = [];
			$.each(x.editions, function(i, el){
				items.push('<div class="item animate1 br3 box" data="' + el.id + '">\
					<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
					<div class="edit"><svg viewBox="0 0 32 32"><path d="M 30.122,30.122L 28.020,23.778L 11.050,6.808L 10,7.858L 6.808,11.050L 23.778,28.020 zM 3.98,8.222L 8.222,3.98l-2.1-2.1c-1.172-1.172-3.070-1.172-4.242,0c-1.172,1.17-1.172,3.072,0,4.242 L 3.98,8.222z"></path></svg></div>\
					<div class="title" data="' + el.title + '">' + el.title + ' (' + el.count + ' items)</div>\
					<div class="loader"></div>\
				</div>');
			});
			items = items.length ? items.join('') : '<div class="empty">' + lang['database_edition_list_empty'] + '</div>';

			$('.items', x.el.parent).html(items);
		},
		edition_create: function(){
			var x = this;

			x.mode = 0;

			x.d.el.form.removeClass('show');
			setTimeout(function(){
				var template = m.template(x.template.form, {
					title: lang['database_edition_f_h_create'],
					q: '',
					p: x.d.arr[x.d.mode].type === 1 ? 'show' : 'hide',
					d: x.d.arr[x.d.mode].type === 2 ? 'show' : 'hide',
					password: x.d.arr[x.d.mode].type === 2 ? '' : 'hide'
				});

				x.el.form.html(template).addClass('show');

				// add parent fields
				var captions = $('.captions', x.el.form);
				$.each(x.d.config.unique, function(i, id){
					var el = $('.container.custom .field[data="' + id + '"]', x.d.el.form);
					var field = fields.arr.fields[id];
					var val = fields.types[field.type].item_save(el.find('.group'));

					var container = $('<div class="container custom">\
						<div class="field ' + field.type + '" data="' + id + '">\
							<div class="head"><p>' + field.private_title + '</p></div>\
							<div class="group"></div>\
						</div>\
					</div>').appendTo(captions);

					fields.types[field.type].item_add($('.group', container), val, field.value, 'database', x.d.language.active);
				});

				setTimeout(function(){
					$('#ed_title', x.el.form).focus();
				}, 210);
			}, 210);
		},
		edition_edit: function(el){
			var x = this;

			var title = $('.title', el).attr('data');
			var id = +el.attr('data');

			x.mode = id;

			x.d.el.form.removeClass('show');
			setTimeout(function(){
				var template = m.template(x.template.form, {
					title: sprintf(lang['database_edition_f_h_edit'], [title]),
					q: 'hide',
					p: 'hide',
					d: 'hide',
					password: 'hide'
				});

				x.el.form.html(template).addClass('show');

				// add parent fields
				var captions = $('.captions', x.el.form);
				$.each(x.d.config.unique, function(i, id){
					var field = fields.arr.fields[id];

					var container = $('<div class="container custom">\
						<div class="field ' + field.type + '" data="' + id + '">\
							<div class="head"><p>' + field.private_title + '</p></div>\
							<div class="group"></div>\
						</div>\
					</div>').appendTo(captions);

					fields.types[field.type].item_add($('.group', container), '', field.value, 'database', x.d.language.active);
				});

				setTimeout(function(){
					$('#ed_title', x.el.form).val(title).focus();
				}, 210);
			}, 210);
		},
		edition_save: function(){
			var x = this;

			if (x.mode) {
				var data = {
					id: x.mode,
					title: $('#ed_title', x.el.form).val().trim(),
					captions: (function(){
						var json = {};

						$('.captions .container', x.el.form).each(function(){
							var th = $(this);
							var id = +$('.field', th).attr('data');
							var field = fields.arr.fields[id];
							var val = fields.types[field.type].item_save(th.find('.group'));
							if (val) json[id] = val;
						});

						return JSON.stringify(json);
					})()
				};
			} else {
				var data = {
					title: $('#ed_title', x.el.form).val().trim(),
					count: +$('#count', x.el.form).val().trim() || 0,
					type: x.d.arr[x.d.mode].type || 1,
					status: +$('.select.status.show p.active', x.el.form).attr('data'),
					password: +$('.select.password p.active', x.el.form).attr('data'),
					item: x.d.mode,
					captions: (function(){
						var json = {};

						$('.captions .container', x.el.form).each(function(){
							var th = $(this);
							var id = +$('.field', th).attr('data');
							var field = fields.arr.fields[id];
							json[id] = fields.types[field.type].item_save(th.find('.group'));
						});

						return JSON.stringify(json);
					})()
				};

				if (data.count === 0) {
					alertify.error(lang['database_edition_f_error_count']);
					$('#count', x.el.form).focus();
					return false;
				}
			}

			loader.show();

			$.post('?database/edition_' + (x.mode ? 'edit' : 'create') + '_edition', data, function(json){
				if (x.mode) {
					var item = $('.editions .item[data="' + x.mode + '"]', x.d.el.form);
					item.data('load', false);
					item.next('.childs').remove();

					$.each(x.editions, function(i, el){
						if (el.id === x.mode) {
							x.editions[i].title = data.title;
							$('.title', item).text(data.title + ' (' + el.count + ' items)').attr('data', data.title);
						}
					});
				} else {
					x.editions.push({id: json.id, item: x.d.mode, title: data.title, count: data.count});
					x.draw();
				}

				x.reset_load_scroll();
				x.form_close();
				loader.hide();
			}, 'json');
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
						var items = $('.items', x.el.parent);
						if (!$('.item', items).length) items.html('<div class="empty">' + lang['database_edition_list_empty'] + '</div>');
						x.reset_load_scroll();
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
				var fi = {};
				var type = json.items[0][2] || false;
				var childs = $('<div class="childs" t="' + type + '"></div>');

				th.removeClass('l').data('load', true).after(childs);

				$.each(json.items, function(i, el){
					fi[el[0]] = el[4] || '{}';
					var width = 100 / (6 - (el[6] ? 0 : 1));
					var status = '';
					if (type === 1) {
						status += '<option value="1"' + (el[3] === 1 ? ' selected' : '') + '>' + lang['database_edition_f_1_1'] + '</option>';
						status += '<option value="6"' + (el[3] === 6 ? ' selected' : '') + '>' + lang['database_edition_f_1_6'] + '</option>';
						status += '<option value="2"' + (el[3] === 2 ? ' selected' : '') + '>' + lang['database_edition_f_1_2'] + '</option>';
						status += '<option value="3"' + (el[3] === 3 ? ' selected' : '') + '>' + lang['database_edition_f_1_3'] + '</option>';
						status += '<option value="4"' + (el[3] === 4 ? ' selected' : '') + '>' + lang['database_edition_f_1_4'] + '</option>';
						status += '<option value="5"' + (el[3] === 5 ? ' selected' : '') + '>' + lang['database_edition_f_1_5'] + '</option>';
					}
					if (type === 2) {
						status += '<option value="5"' + (el[3] === 5 ? ' selected' : '') + '>' + lang['database_edition_f_2_5'] + '</option>';
						status += '<option value="1"' + (el[3] === 1 ? ' selected' : '') + '>' + lang['database_edition_f_2_1'] + '</option>';
						status += '<option value="2"' + (el[3] === 2 ? ' selected' : '') + '>' + lang['database_edition_f_2_2'] + '</option>';
						status += '<option value="3"' + (el[3] === 3 ? ' selected' : '') + '>' + lang['database_edition_f_2_3'] + '</option>';
						status += '<option value="4"' + (el[3] === 4 ? ' selected' : '') + '>' + lang['database_edition_f_2_4'] + '</option>';
					}

					var item = $('<div class="i" data="' + el[0] + '">\
						<div class="box n" style="width:' + width + '%">' + el[1] + '</div>\
						' + (el[6] ? '<div class="box p" style="width:' + width + '%">' + el[6] + '</div>' : '') + '\
						<div class="box s t' + (type === 1 ? '1' : '2') + '" style="width:' + width + '%"><select>' + status + '</select></div>\
						<div class="box f" style="width:' + width + '%">\
							<div data="type" content="' + lang['database_edition_childs_type'] + '" contenteditable="true"></div>\
							<div data="seller" content="' + lang['database_edition_childs_seller'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="client" content="' + lang['database_edition_childs_client'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date" content="' + lang['database_edition_childs_date'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date_start" content="' + lang['database_edition_childs_date_start'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="date_end" content="' + lang['database_edition_childs_date_end'] + '" contenteditable="true" style="display:none;"></div>\
							<div data="location" content="' + lang['database_edition_childs_location'] + '" contenteditable="true" style="display:none;"></div>\
							<span class="no">' + lang['database_edition_childs_nof'] + '</span>\
						</div>\
						<div class="box c" style="width:' + width + '%"></div>\
						<div class="box nt" style="width:' + width + '%" contenteditable="true" content="' + lang['database_edition_childs_note'] + '">' + el[7] + '</div>\
					</div>');

					childs.append(item);

					var captions = $.parseJSON(el[5] || '{}');
					$.each(x.d.config.unique, function(i, v){
						var capt = captions[v];
						if (capt === undefined) return true;
						var field = fields.arr.fields[v];
						if (!field) return true;
						var container = $('<div class="container">\
							<div class="field ' + field.type + '" data="' + v + '">\
								<div class="head"><p>' + field.private_title + '</p></div>\
								<div class="group"></div>\
							</div>\
						</div>').appendTo($('.c', item));

						fields.types[field.type].item_add($('.group', container), capt, field.value, 'database', x.d.language.active);
					});
					if ($('.c', item).html() !== '') $('.c', item).append('<div class="button br3">' + lang['database_edition_childs_captions_save'] + '</div><div class="loader"></div>');
				});

				$('.i', th.next()).each(function(){
					var i = $(this);
					var id = i.attr('data');
					i.attr('f', fi[id]);
					var f = $.parseJSON(fi[id]);
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
			$('.f > div[data="type"]', parent).removeAttr('style');
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
				var data = i.attr('data');
				if (!data) return true;
				var text = i.text();
				if (!text) i.empty();
				f_old[data] = i.html();
			});
			f_old = JSON.stringify(f_old);

			var id = +parent_i.attr('data');
			parent_i.attr('f', f_old);
			$.post('?database/edition_set_item_fields', {id: id, fields: f_old}, function(){}, 'json');
		},
		item_captions: function(el){
			var x = this;

			var parent = el.parent();
			var item = +el.parents('.i').attr('data');
			var json = {};

			el.next().addClass('show');

			$('.container', parent).each(function(){
				var th = $(this);
				var id = +$('.field', th).attr('data');
				var field = fields.arr.fields[id];
				json[id] = fields.types[field.type].item_save(th.find('.group'));
			});

			$.post('?database/edition_set_item_captions', {id: item, captions: JSON.stringify(json)}, function(){
				el.next().removeClass('show');
				x.reset_load_scroll();
			}, 'json');
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
		},
		reset_load_scroll: function(){
			var x = this;

			x.d.ed[x.d.mode] = false;
			$.each(x.d.list_items_p, function(i, el){
				if (x.d.mode === el[3]) {
					x.d.list_items_p[i][1] = false;
					el[2].data('load', false);
				}
			});
			$('.items', x.d.el.list).trigger('scroll');

			WS.send('database/item_edition_edit/' + x.d.mode);
		}
	},
	edition_modal:
	{
		el: {},
		init: function(){
			var x = this;

			x.el.parent = $('.edition_modal', database.el.parent);
			x.el.overlay = database.el.overlay;

			x.template = x.el.parent.html();

			x.el.parent.on('click', '.close', function(){
				x.close();
			}).on('click', '.e', function(){
				var th = $(this);
				x.edition_open(th);
			});
		},
		open: function(id){
			var x = this;

			x.el.overlay.addClass('show');

			setTimeout(function(){
				$.post('?database/edition_get_editions/', {id: id}, function(json){
					var editions = $.map(json.items, function(el){
						return '<div class="e br3" data="' + el.id + '">' + el.title + ' (' + el.count + ' items)</div>';
					}).join('');

					var template = m.template(x.template, {
						title: vsprintf(lang['database_edition_modal_header'], [database.arr[id].private_title]),
						editions: editions || '<div class="empty br3">' + lang['global_empty'] + '</div>'
					});

					x.el.parent.html(template).addClass('show');
				}, 'json');
			}, 210);
		},
		close: function(){
			var x = this;

			x.el.parent.removeClass('show');
			x.el.overlay.removeClass('show');
			setTimeout(function(){
				x.el.parent.empty();
			}, 210);
		},
		edition_open: function(th){
			var x = this;

			var id = +th.attr('data');
			var open = th.hasClass('open');
			var load = th.hasClass('load');
			var childs = th.next('.childs');

			if (load) return false;

			if (open) {
				th.removeClass('open');
				childs.hide();
			} else {
				if (childs.length) {
					th.addClass('open');
					childs.show();
				} else {
					var loader = $('<div class="loader">');
					th.addClass('load').append(loader);

					$.post('?database/edition_get_items/', {id: id}, function(json){
						var childs = $('<div class="childs">');

						$.each(json.items, function(i, el){
							var status = '';
							if (el[2] === 1) {
								if (el[3] === 1) status = lang['database_edition_f_1_1'];
								if (el[3] === 2) status = lang['database_edition_f_1_2'];
								if (el[3] === 3) status = lang['database_edition_f_1_3'];
								if (el[3] === 4) status = lang['database_edition_f_1_4'];
								if (el[3] === 5) status = lang['database_edition_f_1_5'];
								if (el[3] === 6) status = lang['database_edition_f_1_6'];
							}
							if (el[2] === 2) {
								if (el[3] === 1) status = lang['database_edition_f_2_1'];
								if (el[3] === 2) status = lang['database_edition_f_2_2'];
								if (el[3] === 3) status = lang['database_edition_f_2_3'];
								if (el[3] === 4) status = lang['database_edition_f_2_4'];
								if (el[3] === 5) status = lang['database_edition_f_2_5'];
							}
							var f = '';
							$.each($.parseJSON(el[4] || '{}'), function(i, el){
								if (el) f += '<p><b>' + lang['database_edition_childs_' + i] + ':</b> ' + el + '</p>';
							});
							var d = '';
							$.each($.parseJSON(el[5] || '{}'), function(i, el){
								if (fields.arr.fields[i]) {
									var type = fields.arr.fields[i].type;
									var val = fields.types[type].bases.view(el, i);
									if (val) d += '<p><b>' + fields.arr.fields[i].private_title + ':</b> ' + val + '</p>';
								}
							});
							
							childs.append('<div class="c">\
								<div class="box n">' + el[1] + '</div>\
								<div class="box s">' + status + '</div>\
								<div class="box f">' + f + '</div>\
								<div class="box d">' + d + '</div>\
								<div class="box no">' + el[7] + '</div>\
							</div>');
						});

						th.addClass('open').removeClass('load').after(childs);
						loader.remove();
					}, 'json');
				}
			}

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
					if (!users.get_access('database', 'pdf_add')) {
						alertify.error(lang['users_access_error']);
						return false;
					}

					database.pdf.form.open();
				}).on('click', '.close', function(){
					database.pdf.opened = false;
					x.el.overlay.removeClass('show');
					x.el.parent.removeClass('show');

					setTimeout(function(){
						x.el.root.remove();
					}, 210);
				}).on('click', '.remove', function(){
					if (!users.get_access('database', 'pdf_remove')) {
						alertify.error(lang['users_access_error']);
						return false;
					}

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
				}).on('click', '.s3 .c .item:not(.head) .editions .e', function(){
					var th = $(this);
					var id = +th.attr('data');

					x.s3_open_edition(th, id);

					return false;
				}).on('click', '.s3 .c .item:not(.head) .editions .childs .c', function(){
					var th = $(this);

					th.toggleClass('selected');

					var parent = th.parent();
					var selected = $('.c.selected', parent);

					parent.parents('.item').toggleClass('selected', !!selected.length);
					x.s3_selected();

					return false;
				}).on('click', '.s3 .c .item:not(.head)', function(){
					var th = $(this);
					var id = +th.attr('data');
					var unique = database.arr[id].unique;

					if (unique) {
						th.toggleClass('selected');
						x.s3_selected();
					} else {
						x.s3_open_item(th, id);
					}
				});

				$('.wrapper', x.el.parent).on('scroll', function(){
					if (x.active !== 3) return false;

					Tasks.clear();

					var ws = $(this).scrollTop();
					var wsb = ws + $(this).innerHeight();

					x.el.step.filter('.s3').find('.c').find('.table').find('.item:not(.head):not(.hide)').each(function(){
						var th = $(this);
						var id = +th.attr('data');
						var top = th.position().top + 120;
						var load = th.data('load2');

						if (load) return true;

						if (ws < top && wsb > top) {
							th.data('load2', true);

							Tasks.unshift(function(callback){
								// image
								var image = database.arr[id].image;
								if (image) {
									$('.bg', th).css({backgroundImage: 'url(/qrs/getfile/' + image + '/200/200/0)'});
								}

								if (database.arr[id].unique) {
									callback();
									return false;
								}

								// unique field
								if (database.ed[id]) {
									$.each(database.ed[id], function(i, v){
										if (i === 'status') {
											$('.' + i, th).html(v);
										} else {
											$('.f_' + i, th).html(v);
										}
									});

									callback();
								} else {
									$.post('?database/get_itemEditions', {id: id}, function(json){
										database.ed[id] = {};
										$.each(json.edition, function(i, v){
											if (i === 'status') {
												var value = '';

												if (v.length > 1) {
													var types = $.map(v, function(){return v.type}).filter(function(v, i, a){return a.indexOf(v) === i});
													// var size = Object.keys(v).length;

													$.each(v, function(k, val){
														var t = val.title;
														if (types.length > 1 && val.type == 1) t += ', ' + lang['database_form_type_physical'];
														if (types.length > 1 && val.type == 2) t += ', ' + lang['database_form_type_digital'];
														if (k !== 0) value += '<br>';
														value += '<b>' + t + ':</b><br>';

														$.each(val.items, function(type, arr){
															var temp = [];
															var text = [];
															$.each(arr, function(p, y){
																if (temp.indexOf(y) + 1) return true;

																temp.push(y);
																var count = arr.reduce(function(prev, item){
																	return item === y ? prev+1 : prev;
																}, 0);
																text.push(count + '/' + arr.length + ' ' + lang['database_edition_f_' + val.type + '_' + y]);
															});
															value += '<b>' + type + ':</b><br>' + text.join('<br>') + '<br>';
														});
													});
												} else {
													$.each(v, function(k, val){
														$.each(val.items, function(type, arr){
															var temp = [];
															var text = [];
															$.each(arr, function(p, y){
																if (temp.indexOf(y) + 1) return true;

																temp.push(y);
																var count = arr.reduce(function(prev, item){
																	return item === y ? prev+1 : prev;
																}, 0);
																text.push(count + '/' + arr.length + ' ' + lang['database_edition_f_' + val.type + '_' + y]);
															});
															value += '<b>' + type + ':</b><br>' + text.join('<br>') + '<br>';
														});
													});
												}

												$('.' + i, th).html(value);
												database.ed[id][i] = value;
											} else {
												var type = fields.arr.fields[i].type;
												value = $.map(v, function(el){
													return fields.types[type].bases.view(el || '', i);
												}).join('<br>');
												$('.f_' + i, th).html(value);
												database.ed[id][i] = value;
											}
										});

										callback();
									}, 'json');
								}
							}, function(){
								th.data('load2', false);
							});
						}
					});
				});

				x.el.step.filter('.s4').find('.c').empty();
				x.el.step.filter('.s5').find('.c').empty();

				x.editions = {};
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
					old: '',
					change: function(){
						var s = this;

						var parent = $('.f', parent);

						var text = $('input', parent).val().trim().toLowerCase();

						if (text === s.old) return false;
						s.old = text;

						s.text = text;
						s.use = !!s.text;

						$('.clear, .count', parent).toggleClass('show', s.use);

						x.s3_draw_filter();
					},
					set: function(counts){
						$('.f .count', parent).text(counts.join(' / '));
					}
				};
				x.s3_selected = function(){
					var count = 0;
					x.temp.items = [];

					$('.item.selected', parent).each(function(){
						var th = $(this);
						var id = +th.attr('data');
						var c = $('.childs .c.selected', th);

						if (c.length) {
							var childs = [];
							c.each(function(){
								var el = $(this);
								var data = +el.attr('data');

								childs.push(data);
								count++;
							});
							x.temp.items.push({id: id, childs: childs});
						} else {
							x.temp.items.push(id);
							count++;
						}
					});

					$('.t span', parent).text(count);
					x.el.next.toggle(!!count);
				};
				x.s3_open_item = function(th, id){
					if (th.data('loading')) return false;

					if (th.hasClass('open')) {
						th.removeClass('open');
					} else {
						if (th.data('load')) {
							th.addClass('open');
						} else {
							th.data('loading', true);

							var loader = $('<div class="loader">');

							th.append(loader);

							$.post('?database/edition_get_editions', {id: id}, function(json){
								var editions = [];
								$.each(json.items, function(i, el){
									editions.push('<div class="e br3" data="' + el.id + '">' + el.title + ' (' + el.count + ' items)</div>');
								});
								editions = editions.join('') || '<div class="empty">' + lang['global_empty'] + '</div>';

								loader.fadeOut(200, function(){
									loader.remove();
									th.append('<div class="editions">' + editions + '</div>').data('load', true).addClass('open').data('loading', false);
								});
							}, 'json');
						}
					}
				};
				x.s3_open_edition = function(th, id){
					if (th.data('loading')) return false;

					if (th.hasClass('open')) {
						th.removeClass('open');
					} else {
						if (th.data('load')) {
							th.addClass('open');
						} else {
							th.data('loading', true);

							var loader = $('<div class="loader">');

							th.append(loader);

							$.post('?database/edition_get_items', {id: id}, function(json){
								var items = [];
								$.each(json.items, function(i, el){
									var status = '';
									if (el[2] === 1) {
										if (el[3] === 1) status = lang['database_edition_f_1_1'];
										if (el[3] === 2) status = lang['database_edition_f_1_2'];
										if (el[3] === 3) status = lang['database_edition_f_1_3'];
										if (el[3] === 4) status = lang['database_edition_f_1_4'];
										if (el[3] === 5) status = lang['database_edition_f_1_5'];
										if (el[3] === 6) status = lang['database_edition_f_1_6'];
									}
									if (el[2] === 2) {
										if (el[3] === 1) status = lang['database_edition_f_2_1'];
										if (el[3] === 2) status = lang['database_edition_f_2_2'];
										if (el[3] === 3) status = lang['database_edition_f_2_3'];
										if (el[3] === 4) status = lang['database_edition_f_2_4'];
										if (el[3] === 5) status = lang['database_edition_f_2_5'];
									}
									var f = '';
									$.each($.parseJSON(el[4] || '{}'), function(i, el){
										if (el) f += '<p><b>' + lang['database_edition_childs_' + i] + ':</b> ' + el + '</p>';
									});
									var d = '';
									$.each($.parseJSON(el[5] || '{}'), function(i, el){
										if (el && fields.arr.fields[i]) d += '<p><b>' + fields.arr.fields[i].private_title + ':</b> ' + el + '</p>';
									});

									x.editions[el[0]] = {
										n: el[1],
										status: status,
										f: f,
										d: d,
										no: el[7]
									};

									items.push('<div class="c" data="' + el[0] + '">\
										<div class="box n">' + el[1] + '</div>\
										<div class="box st">' + status + '</div>\
										<div class="box fi">' + f + '</div>\
										<div class="box d">' + d + '</div>\
										<div class="box no">' + el[7] + '</div>\
									</div>');
								});

								loader.fadeOut(200, function(){
									loader.remove();
									th.data('load', true).addClass('open').data('loading', false).after('<div class="childs">' + items.join('') + '</div>');
								});
							}, 'json');
						}
					}
				};
				x.s3_draw = function(callback){
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
					// if (database.config.view === 'table') {
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
									if (id === 'status')
										return m.template(template, {
											type: 'status',
											value: lang['database_list_table_status']
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
											var value = $.inArray(id, database.config.unique) < 0 || !!el.unique ? fields.types[type].bases.view(el.fields[id] || '', id) : '';

											return m.template(template, {
												type: 'f_' + id + ' f_' + type,
												value: value
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
												value: '<div class="bg br3"></div>'
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
										if (id === 'status') {
											var status = '';
											if (!!el.unique) status = lang['database_edition_f_' + el.type + '_' + el.ed_status];

											return m.template(template, {
												type: 'status',
												value: status
											});
										}
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
						$('.wrapper', x.el.parent).trigger('scroll');
					// }
					// template end

					$('.f input', parent).val('').trigger('keyup');
					x.s3_selected();
					callback();
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
					}

					$('.wrapper', x.el.parent).trigger('scroll');
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
						x.temp.debug = json.debug;
						x.temp.request = json.request;

						if (json.request.local && json.request.local.length) {
							$('.c', parent).empty();

							$.each(x.temp.items, function(i, el){
								var number = typeof el === 'number';

								if (number) {
									var item = database.arr[el];

									var html = $('<div class="item br3" data="' + el + '">\
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
								} else {
									var item = database.arr[el.id];

									var html = $('<div class="item br3" data="' + el.id + '">\
										<div class="title">' + item.private_title + '</div>\
										<div class="image br3" style="background-image:url(/qrs/getfile/' + item.image + '/200/200/0);"></div>\
									</div>');
									$.each(el.childs, function(ind, id){
										var fi = $('<div class="fields" data="' + id + '">');
										fi.append('<div class="info"><p>#' + x.editions[id].n + '</p><p>' + x.editions[id].status + '</p>' + x.editions[id].f + x.editions[id].d + '<p>' + x.editions[id].no + '</p></div>');
										html.append(fi);

										$.each(json.request.local, function(index, r){
											var container = $('<div class="container">\
												<div class="field ' + r.type + '" data="' + r.id + '" type="' + r.type + '">\
													<div class="head"><p>' + r.title + '</p></div>\
													<div class="group"></div>\
												</div>\
											</div>');
											fi.append(container);

											fields.types[r.type].item_add($('.group', container), '', '', 'database', '');
										});
									});

									$('.c', parent).append(html);
								}
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
					$('.c', parent).empty();

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

				var local = {};

				var data = {
					template: x.temp.template,
					lang: x.temp.lang,
					items: x.temp.items,
					local: (function(){
						var data = {};

						x.el.step.filter('.s4').find('.item').each(function(){
							var th = $(this);
							var id = +th.attr('data');

							if (database.arr[id].unique) {
								var d = {};
								$('.field', th).each(function(){
									var f = $(this);
									var alias = f.attr('data');
									var type = f.attr('type');
									var value = fields.types[type].item_save(f.find('.group'));

									d[alias] = value;
								});

								data[id] = d;
							} else {
								$('.fields', th).each(function(){
									var th = $(this);
									var e = +th.attr('data');
									var d = {};
									$('.field', th).each(function(){
										var f = $(this);
										var alias = f.attr('data');
										var type = f.attr('type');
										var value = fields.types[type].item_save(f.find('.group'));

										d[alias] = value;
									});

									data[id + '_' + e] = d;
								});
							}
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

				if (x.temp.debug) {
					window.open(location.origin + location.pathname + '?database/pdf_create&' + $.param(data));
					return false;
				}

				$.post('?database/pdf_create', data, function(json){
					if (json.status) {
						database.pdf.list.load(function(){
							database.pdf.list.draw();
							x.el.parent.removeClass('show');
							x.el.overlay.removeClass('top');
						});
						WS.send('database/pdf_new');
					} else {
						x.el.overlay.removeClass('top');
						alertify.error(json.error);
					}
				}, 'json');
			}
		}
	},
	report:
	{
		el: {},
		mode: false,
		init: function(){
			var x = this;

			x.s = database;
			x.mode = true;
			x.selected = [];

			$('.header .actions', x.s.el.list).hide();
			$('.header', x.s.el.list).append('<div class="report">\
				<div class="info">' + lang['database_report_selected'] + ': 0</div>\
				<div class="br3 animate1 create">' + lang['database_report_create'] + '</div>\
				<div class="br3 animate1 cancel">' + lang['database_report_cancel'] + '</div>\
			</div>');
			$('.items', x.s.el.list).addClass('report');

			x.s.el.list.on('click.report1', '.table .item:not(.head)', function(){
				var th = $(this);
				th.toggleClass('report_selected');

				x.select(+th.hasClass('report_selected'), +th.attr('data'));

				return false;
			}).on('click.report2', '.grid .inner', function(){
				var th = $(this).parent();
				th.toggleClass('report_selected');

				x.select(+th.hasClass('report_selected'), +th.attr('data'));

				return false;
			});

			$('.header > .report', x.s.el.list).on('click', '.create', function(){
				x.create();
			}).on('click', '.cancel', function(){
				x.cancel();
			});

			if (x.inited) return false;

			x.el.modal = $('.report_modal', x.s.el.parent);
			x.el.overlay = x.s.el.overlay;

			x.el.modal.on('click', '.print', function(){
				window.print();
			}).on('click', '.close', function(){
				x.el.modal.removeClass('show');
				x.el.overlay.removeClass('show');
				setTimeout(function(){
					$('.wrapper', x.el.modal).empty();
				}, 210);
			});

			x.inited = true;
		},
		select: function(type, id){
			var x = this;

			if (type) {
				x.selected.push(id);
			} else {
				var k = $.inArray(id, x.selected);
				if (k >= 0) x.selected.splice(k, 1);
			}

			$('.header .report .info', x.s.el.list).text(lang['database_report_selected'] + ': ' + x.selected.length);
		},
		create: function(){
			var x = this;

			if (!x.selected.length) {
				alertify.error(lang['database_report_no_selected']);
				return false;
			}

			x.el.overlay.addClass('show');

			setTimeout(function(){
				$.post('?database/get_report/', {ids: x.selected}, function(json){
					var html = '';
					var w = 100 / json.result.length;

					html += '<div class="tr"><div class="head"></div>';
					html += $.map(json.result, function(el){
						return '<div class="v box" style="width:' + w + '%"><div class="image br3"><div class="bg" style="background-image:url(/qrs/getfile/' + el.image + '/200/200/0)"></div></div></div>';
					}).join('');
					html += '</div>';

					html += '<div class="tr"><div class="head">Title</div>';
					html += $.map(json.result, function(el){
						return '<div class="v box" style="width:' + w + '%">' + el.title + '</div>';
					}).join('');
					html += '</div>';

					html += '<div class="tr"><div class="head">UID</div>';
					html += $.map(json.result, function(el){
						return '<div class="v box" style="width:' + w + '%">' + el.uid + '</div>';
					}).join('');
					html += '</div>';

					html += '<div class="tr"><div class="head">Type</div>';
					html += $.map(json.result, function(el){
						var t = '';
						if (el.type === 1) t = 'physical';
						if (el.type === 2) t = 'digital';
						return '<div class="v box" style="width:' + w + '%">' + lang['database_form_type_' + t] + '</div>';
					}).join('');
					html += '</div>';

					html += '<div class="tr"><div class="head">Unique</div>';
					html += $.map(json.result, function(el){
						return '<div class="v box" style="width:' + w + '%">' + (el.unique ? 'Yes' : 'No') + '</div>';
					}).join('');
					html += '</div>';

					$.each(x.s.config.unique, function(i, id){
						var field = fields.arr.fields[id];
						if (!field) return true;

						html += '<div class="tr h"><div class="head">' + field.private_title + '</div>';
						html += $.map(json.result, function(el){
							var v = el.unique ? fields.types[field.type].bases.view(el.fields[id], id) : x.s.ed[el.id][id];
							return '<div class="v box" style="width:' + w + '%">' + v + '</div>';
						}).join('');
						html += '</div>';
					});

					$.each(x.s.config.fields, function(i, id){
						var isUnique = $.inArray(id, x.s.config.unique) + 1;
						if (isUnique) return true;

						var field = fields.arr.fields[id];
						if (!field) return true;

						html += '<div class="tr"><div class="head">' + field.private_title + '</div>';
						html += $.map(json.result, function(el){
							return '<div class="v box" style="width:' + w + '%">' + fields.types[field.type].bases.view(el.fields[id], id) + '</div>';
						}).join('');
						html += '</div>';
					});

					html += '<div class="tr h"><div class="head">Editions</div>';
					html += $.map(json.result, function(el){
						return '<div class="v box" style="width:' + w + '%">' + (el.unique ? '-' : el.editions.join('<br>')) + '</div>';
					}).join('');
					html += '</div>';

					html += '<div class="tr"><div class="head">Status</div>';
					html += $.map(json.result, function(el){
						var status = el.unique ? lang['database_edition_f_' + el.type + '_' + el.ed_status] : x.s.ed[el.id].status;
						return '<div class="v box" style="width:' + w + '%">' + status + '</div>';
					}).join('');
					html += '</div>';

					x.el.modal.addClass('show').find('.wrapper').html('<div class="table br3">' + html + '</div>');
				}, 'json');
			}, 210);
		},
		cancel: function(){
			var x = this;

			x.mode = false;
			x.selected = [];

			$('.header .actions', x.s.el.list).show();
			$('.header > .report', x.s.el.list).remove();
			$('.items', x.s.el.list).removeClass('report');
			$('.report_selected', x.s.el.list).removeClass('report_selected');
			x.s.el.list.off('click.report1').off('click.report2');
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
			if (json.status) {
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
	remove_items: function(ids, callback)
	{
		var x = this;

		alertify.confirm(lang['database_list_remove_items'], function(e){
			if (e) {
				loader.show();

				var url = '?database/items_delete', data = {ids: ids};
				$.post(url, data, function(json){
					loader.hide();

					if (json.edited.length) {
						alertify.error(lang['database_list_remove_items_edited']);
					}

					$.each(json.remove, function(i, id){
						delete x.arr[id];
					});

					if (callback) callback();
					WS.send('database/item_remove/');
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
			x.types.style.handlers(database.el.settings);
			x.types.ed_type.handlers(database.el.settings);
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
					x.types.style.draw(database.el.settings, json);
					x.types.ed_type.draw(database.el.settings, json);

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
				unique: [],
				uid: {
					use: true,
					mask: '',
					separate: '',
					template: []
				},
				style: '',
				ed_type: ''
			};

			$('.container.pdf .i', database.el.settings).each(function(){
				var th = $(this);
				var title = $('input', th).eq(0).val().trim();
				var path = $('input', th).eq(1).val().trim();

				if (title && path) data.pdf_templates.push([title, path]);
			});

			data.view = $('.container .field.view p.active', database.el.settings).attr('data');
			data.type = +$('.container .field.type p.active', database.el.settings).attr('data');

			$('.container.fields .f .elems .item', database.el.settings).each(function(){
				var th = $(this);
				var id = +th.attr('data');
				var star = $('.star', th);

				if (id) {
					data.fields.push(id);
					if (star.hasClass('active')) data.unique.push(id);
				}
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
			data.style = $('.container.style textarea', database.el.settings).val();
			data.ed_type = $('.container.ed_type input', database.el.settings).val().trim();

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

					parent.on('click', '.container .field.view p', function(){
						$(this).addClass('active').siblings().removeClass('active');
					});
				},
				draw: function(parent, json){
					var x = this;

					$('.container .field.view p[data="' + json.config.view + '"]', parent).addClass('active');
				}
			},
			type: {
				template: '',
				handlers: function(parent){
					var x = this;

					parent.on('click', '.container .field.type p', function(){
						$(this).addClass('active').siblings().removeClass('active');
					});
				},
				draw: function(parent, json){
					var x = this;

					$('.container .field.type p[data="' + (json.config.type || 1) + '"]', parent).addClass('active');
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

					var s_group = $('.container.fields .s .group', parent);
					var f_group = $('.container.fields .f .group', parent);
					var d_group = $('.container.fields .d .group', parent);
					var $combobox = $('.ui-combobox', s_group);
					var $elems = $('.elems', f_group);
					var fields = json.fields;
					fields.push(['id', 'ID']);
					fields.push(['image', lang['database_settings_fields_f_image']]);
					fields.push(['uid', 'UID']);
					fields.push(['title', lang['database_settings_fields_f_title']]);
					fields.push(['status', lang['database_settings_fields_f_status']]);
					fields.push(['date_added', lang['database_settings_fields_f_date_added']]);
					var titles = {};
					var value = ['id', 'image', 'uid', 'title', 'status', 'date_added'].concat(json.config.fields);
					var combobox = null;

					var start = function(){
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
						$.each(json.config.unique, function(i, id){
							$('.item[data="' + id + '"] .star', $elems).addClass('active');
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
							<div class="star" title="' + lang['database_settings_star'] + '"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46.354 46.354"><path d="M21.57 2.049a1.796 1.796 0 0 1 3.218 0l5.771 11.695c.261.529.767.896 1.352.981L44.817 16.6a1.792 1.792 0 0 1 .994 3.06l-9.338 9.104a1.796 1.796 0 0 0-.517 1.588l2.204 12.855a1.797 1.797 0 0 1-2.605 1.893l-11.544-6.07a1.793 1.793 0 0 0-1.67 0l-11.544 6.069a1.795 1.795 0 0 1-2.604-1.892l2.204-12.855a1.794 1.794 0 0 0-.517-1.588L.542 19.66a1.794 1.794 0 0 1 .995-3.06l12.908-1.875a1.794 1.794 0 0 0 1.351-.982L21.57 2.049z"/></svg></div>\
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

					f_group.on('click', '.star', function(){
						$(this).toggleClass('active');
					}).on('click', '.show', function(){
						var th = $(this);
						var parent = th.parent();
						var id = parent.attr('data');

						th.toggleClass('active');

						if (th.hasClass('active')) {
							var clone = parent.clone();
							clone.removeAttr('style').find('.star').remove().end().find('.show').remove().end().appendTo(d_group);
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
			},
			style: {
				template: '',
				handlers: function(parent){
					var x = this;

					
				},
				draw: function(parent, json){
					var x = this;

					$('.container.style textarea', parent).val(json.config.style);
				}
			},
			ed_type: {
				template: '',
				handlers: function(parent){
					var x = this;

					
				},
				draw: function(parent, json){
					var x = this;

					$('.container.ed_type input', parent).val(json.config.ed_type);
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

		if (cmd === 'item_edition_edit') {
			WS.append(function(cb){
				var id = +p[0];
				x.ed[id] = false;
				$.each(x.list_items_p, function(i, el){
					if (id === el[3]) {
						x.list_items_p[i][1] = false;
						el[2].data('load', false);
					}
				});
				$('.items', x.el.list).trigger('scroll');
				cb();
			});
		}
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

		x.list_items_h = $('.items', x.el.list).height();
		x.list_items_p = [];
		$.each(x.list_items, function(){
			var th = $(this);
			var top = th.position().top;
			var load = th.data('load');
			var id = +th.attr('data');
			x.list_items_p.push([top, load, th, id]);
		});
		$('.items', x.el.list).trigger('scroll');
	}
};

common.queue.push(database);