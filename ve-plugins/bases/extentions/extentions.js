var plugin_bases_extentions = {
	lang: {},
	fields: {},
	onLoad: function(){
		var s = this;

		fields.types['base'] = {
			title: s.lang['fields_types_base_title'],
			description: s.lang['fields_types_base_desc'],
			attr_add: function(parent){
				var x = this;

				x.parent = $('<div class="s_base">').insertAfter(parent);

				x.parent.append('<div class="header"><div class="title">' + s.lang['fields_types_base_s_title'] + '</div></div>');
				x.parent.append('<div class="group"><input type="text" class="br3 box animate1" value=""></div>');
			},
			attr_edit: function(elems){
				var x = this;

				if (!elems) return false;

				var json = $.parseJSON(elems);

				$('input', x.parent).val(json.base || '');
			},
			attr_save: function(){
				var x = this;

				var json = {base: +$('input', x.parent).val().trim() || ''};

				return JSON.stringify(json);
			},
			item_add: function(parent, value, elems){
				parent.html('<div class="edit">' + s.lang['fields_types_base_edit'] + '</div><div class="loading br3 box"></div>');

				var value = value ? $.map(value.split(';'), function(el){return +el}) : [];
				var elems = $.parseJSON(elems || '{}');
				var loading = $('.loading', parent);
				var base = {id: elems.base, fields: []};
				var items = {};

				var start = function(){
					$('.item', parent).remove();

					var html = $.map(value, function(id){
						if (!id || !items[id]) return true;

						var item = items[id];
						var width = 100 / base.fields.length;

						var f = $.map(base.fields, function(v){
							var cl = '';
							var co = '';

							if (typeof v === 'number') {
								var type = fields.arr.fields[v].type;
								cl = 'f f_' + v + ' f_' + type;
								co = fields.types[type].bases.view(item.fields[v] || '');
							} else {
								cl = v;
								co = item[v];
							}
							return '<div class="box ' + cl + '" style="width:' + width + '%;">' + co + '</div>';
						}).join('');

						return '<div class="item" data="' + id + '">\
							<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
							<div class="inner br3 box" title="ID ' + id + '">' + f + '</div>\
						</div>';
					}).join('');
					parent.append(html);

					check_empty();
				};
				var check_empty = function(){
					var items = $('.item', parent);

					if (items.length) {
						parent.find('.empty').remove();
					} else {
						parent.append('<div class="empty br3 box">' + s.lang['fields_types_base_empty'] + '</div>');
					}
				};

				parent.on('click', '.edit', function(){
					var bases = $('<div id="base_select_items">\
						<div class="overlay loader animate2"></div>\
						<div class="popup br3 animate2"></div>\
					</div>').appendTo('body');

					var count = 0;
					var filter_val = '';
					var filter = function(){
						$('.filter .clear', bases).toggleClass('show', !!filter_val);

						if (filter_val) {
							$('.empty', bases).remove();

							$('.item', bases).addClass('hide').each(function(){
								var th = $(this);
								var vars = th.text().toLowerCase();
								var valid = true;

								$.each(filter_val.toLowerCase().split(' '), function(i, text){
									if (vars.indexOf(text) === -1) valid = false;
								});

								if (valid) th.removeClass('hide');
							});

							var hide = $('.item.hide', bases);

							if (count === 0 || hide.length === count) $('.items', bases).append('<div class="empty">' + s.lang['fields_types_base_popup_empty'] + '</div>');
							$('.count', bases).text((count - hide.length) + ' / ' + count);
						} else {
							$('.empty', bases).remove();
							$('.count', bases).text('');
							$('.item', bases).removeClass('hide');
						}
					};

					bases.on('keyup', '.filter input', function(){
						filter_val = $(this).val().trim();
						filter();
					}).on('click', '.filter .clear', function(){
						$(this).prev().val('').focus();

						filter_val = '';
						filter();
					}).on('click', '.save', function(){
						value = $('.item.selected', bases).map(function(){
							return +$(this).attr('data');
						}).get();

						start();

						$('.cancel', bases).trigger('click');
					}).on('click', '.cancel', function(){
						$('.overlay', bases).removeClass('show');
						$('.popup', bases).removeClass('show');

						setTimeout(function(){
							bases.remove();
						}, 210);
					}).on('click', '.item', function(){
						$(this).toggleClass('selected');
					});

					$('.overlay', bases).addClass('show');

					setTimeout(function(){
						$.post('?plugins/bases/page/get_itemsByBase', {base: base.id}, function(json){
							$.each(json.items, function(i, item){
								items[item.id] = item;
							});
							$.extend(base, json.base);
							count = json.items.length;

							var width = 100 / base.fields.length;

							var html = $.map(json.items, function(item){
								var selected = $.inArray(item.id, value) + 1 ? ' selected' : '';

								var f = $.map(base.fields, function(v){
									var cl = '';
									var co = '';

									if (typeof v === 'number') {
										var type = fields.arr.fields[v].type;
										cl = 'f f_' + v + ' f_' + type;
										co = fields.types[type].bases.view(item.fields[v] || '');
									} else {
										cl = v;
										co = item[v];
									}
									return '<div class="box ' + cl + '" style="width:' + width + '%;">' + co + '</div>';
								}).join('');

								return '<div class="item' + selected + '" data="' + item.id + '">' + f + '</div>';
							}).join('');

							if (!html) html = '<div class="empty">' + s.lang['fields_types_base_popup_empty'] + '</div>';

							$('.popup', bases).html('\
								<div class="header">\
									<div class="actions">\
										<div class="count"></div>\
										<div class="filter">\
											<input class="br3 box animate1" type="text" placeholder="' + s.lang['fields_types_base_popup_filter_ph'] + '">\
											<div class="clear">\
												<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg>\
											</div>\
										</div>\
										<div class="br3 save">' + s.lang['fields_types_base_popup_save'] + '</div>\
										<div class="br3 cancel">' + s.lang['fields_types_base_popup_cancel'] + '</div>\
									</div>\
									<div class="title">' + sprintf(s.lang['fields_types_base_popup_title'], [base.title]) + '</div>\
								</div>\
								<div class="wrapper box"><div class="items br3">' + html + '</div></div>\
							');
							$('.popup', bases).addClass('show');

							setTimeout(function(){
								$('.popup .filter input', bases).focus();
							}, 100);
						}, 'json');
					}, 210);
				}).on('click', '.remove', function(){
					var th = $(this).parent();
					var id = +th.attr('data');

					th.remove();
					check_empty();

					var k = $.inArray(id, value);
					if (k + 1) value.splice(k, 1);
				}).sortable({items: '.item', tolerance: 'pointer', axis: 'y'});

				if (value.length) {
					$.post('?plugins/bases/page/get_itemsById', {base: base.id, ids: value}, function(json){
						$.each(json.items, function(i, item){
							items[item.id] = item;
						});
						$.extend(base, json.base);

						loading.remove();
						start();
					}, 'json');
				} else {
					loading.remove();
					start();
				}
			},
			item_save: function(parent){
				var ids = $('.item', parent).map(function(){
					return $(this).attr('data');
				}).get().join(';');

				return ids;
			}
		};

		$.extend(true, fields.types, {
			text: {
				bases: {
					view: function(str){
						return str.short(100);
					},
					sort: function(str){
						return str;
					}
				}
			},
			multiple_text: {
				bases: {
					view: function(str){
						return '<ul>' + $.map(str.split('~;~'), function(s){
							var s = s.split('~:~');
							if (s[1]) return '<li>' + s[1].short(10) + '</li>';
						}).join('') + '</ul>';
					},
					sort: function(str){
						return $.map(str.split('~;~'), function(s, i){
							var s = s.split('~:~');
							if (s[1]) return s[1];
						}).join('');
					}
				}
			},
			textarea: {
				bases: {
					view: function(str){
						return str.short(100);
					},
					sort: function(str){
						return str;
					}
				}
			},
			tinymce: {
				bases: {
					view: function(str){
						return str.replace(/<[^>]+>/g, '').short(100);
					},
					sort: function(str){
						return str.replace(/<[^>]+>/g, '');
					}
				}
			},
			checkbox: {
				bases: {
					view: function(str, id){
						var field = fields.arr.fields[id].value.lang()[settings.arr['langFrontDefault']];
						return $.map(str.split(';'), function(id){
							if (id && field[id]) return field[id];
						}).join(', ').short(100, ',');
					},
					sort: function(str, id){
						var field = fields.arr.fields[id].value.lang()[settings.arr['langFrontDefault']];
						return $.map(str.split(';'), function(id){
							if (id && field[id]) return field[id];
						}).join(', ');
					}
				}
			},
			select: {
				bases: {
					view: function(str, id){
						var field = fields.arr.fields[id].value.lang()[settings.arr['langFrontDefault']];
						return $.map(str.split(';'), function(id){
							if (id && field[id]) return field[id];
						}).join(', ').short(100, ',');
					},
					sort: function(str, id){
						var field = fields.arr.fields[id].value.lang()[settings.arr['langFrontDefault']];
						return $.map(str.split(';'), function(id){
							if (id && field[id]) return field[id];
						}).join(', ');
					}
				}
			},
			file: {
				bases: {
					view: function(str){
						return '<div class="image br3" style="background-image: url(/qrs/getfile/' + (str || 0) + '/200/200/0);"></div>';
					},
					sort: function(str){
						return str;
					}
				}
			},
			multiple_files: {
				bases: {
					view: function(str){
						var ids = str ? str.split(',') : [];
						if (ids.length) {
							return '<div class="image br3" style="background-image: url(/qrs/getfile/' + ids[0] + '/200/200/0);"></div>' + (ids.length > 1 ? '<div class="other">...</div>' : '');
						}

						return '';
					},
					sort: function(str){
						return str;
					}
				}
			},
			video: {
				bases: {
					view: function(str){
						var str = str ? str.split('~;~') : [];
						return $.map(str, function(s){
							var el = s.split(';');
							var link = false;
							if (el[0] == 'youtube') link = 'http://youtu.be/' + el[1];
							if (el[0] == 'vimeo') link = 'http://vimeo.com/' + el[1];
							if (link) return '<a href="' + link + '" target="_blank">' + link + '</a>';
						}).join(', ').short(200, ',');
					},
					sort: function(str){
						return str;
					}
				}
			},
			date: {
				bases: {
					view: function(str){
						if (str) {
							var date = new Date(str * 1000);
							var day = date.getDate(); day = (day < 10 ? '0' : '') + day;
							var month = date.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
							var year = date.getFullYear();

							return day + '.' + month + '.' + year;
						}

						return '';
					},
					sort: function(str){
						return str;
					}
				}
			},
			calendar: {
				bases: {
					view: function(str){
						var str = str ? str.split('~;~') : [];
						return $.map(str, function(s){
							var el = s.split(',');
							var timezone = new Date().getTimezoneOffset();

							var date1 = new Date(+el[0] * 1000);
							var day = date1.getDate(); day = (day < 10 ? '0' : '') + day;
							var month = date1.getMonth() + 1; month = (month < 10 ? '0' : '') + month;
							var year = date1.getFullYear();

							var date2 = new Date(+el[1] * 1000 + timezone*60*1000);
							var hours1 = date2.getHours(); hours1 = (hours1 < 10 ? '0' : '') + hours1;
							var minutes1 = date2.getMinutes(); minutes1 = (minutes1 < 10 ? '0' : '') + minutes1;
							var date3 = new Date(+el[2] * 1000 + timezone*60*1000);
							var hours2 = date3.getHours(); hours2 = (hours2 < 10 ? '0' : '') + hours2;
							var minutes2 = date3.getMinutes(); minutes2 = (minutes2 < 10 ? '0' : '') + minutes2;

							return day + '.' + month + '.' + year + ' ' + hours1 + ':' + minutes1 + ' - ' + hours2 + ':' + minutes2;
						}).join(', ').short(100, ',');
					},
					sort: function(str){
						return str;
					}
				}
			},
			color: {
				bases: {
					view: function(str){
						if (str) return '<div class="text"><div class="color" style="background:' + str + '"></div>' + str + '</div>';
						return '';
					},
					sort: function(str){
						return str;
					}
				}
			},
			users: {
				bases: {
					view: function(str){
						var str = str ? str.split(';') : [];
						return $.map(str, function(id){
							if (users.arr[id]) return users.arr[id].name;
						}).join(', ').short(100, ',');
					},
					sort: function(str){
						var str = str ? str.split(';') : [];
						return $.map(str, function(id){
							if (users.arr[id]) return users.arr[id].name;
						}).join(', ');
					}
				}
			},
			flag: {
				bases: {
					view: function(str){
						if (str == 1) return lang['fields_types_flag_yes'];
						return lang['fields_types_flag_no'];
					},
					sort: function(str){
						return str || 0;
					}
				}
			},
			items: {
				bases: {
					view: function(str){
						var ids = str ? str.split(';') : [];

						return $.map(ids, function(id){
							if (id && items.arr[id]) return items.arr[id].private_title;
						}).join(', ');
					},
					sort: function(str){
						var ids = str ? str.split(';') : [];

						return $.map(ids, function(id){
							if (id && items.arr[id]) return items.arr[id].private_title;
						}).join(', ');
					}
				}
			},
			base: {
				bases: {
					view: function(str){
						return str;
					},
					sort: function(str){
						return str;
					}
				}
			}
		});
	}
};