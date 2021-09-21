var files = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	opened: ['#'],
	el: {
		parent: $('#files')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.form = $('.form', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.upload = $('.upload', x.el.parent);

		x.template = {};
		x.template.list_item_group = $('.groups', x.el.list).html();
		$('.groups', x.el.list).html('{{groups}}');
		x.template.list_item_files = $('.files', x.el.list).html();
		$('.files', x.el.list).html('{{files}}');
		x.template.list = x.el.list.html();
		x.el.list.empty();
		x.template.form = x.el.form.html();
		x.el.form.empty();

		x.last_update = {items: false, sorting: false};

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

		x.input = $('<input type="file" multiple>').appendTo(m.cache.el).change(function(){
			x.addFile(this.files);
		});

		// header
		x.el.list.on('click', '.header .title', function(){
			var parents = $(this).parents('.items');
			var index = parents.index() + 1;
			parents.nextAll().remove();
			x.opened.splice(index, x.opened.length - index);
			$('.g', parents).removeClass('open');
			common.resize();
		}).on('mouseover', '.header .title', function(){
			var th = $(this).parents('.items');
			th.nextAll().addClass('fade');
		}).on('mouseout', '.header .title', function(){
			var th = $(this).parents('.items');
			th.nextAll().removeClass('fade');
		}).on('click', '.header .add_files', function(){
			x.parent = $(this).parents('.items').attr('parent');
			x.input.click();
		}).on('click', '.header .add_group', function(){
			x.parent = $(this).parents('.items').attr('parent');
			x.addGroup();
		}).on('click', '.header .menu p', function(){
			var th = $(this);
			var data = th.attr('data');
			var parent = th.parents('.items');
			x.parent = parent.attr('parent');

			if (data === 'select_all' && !files.openFiles) {
				$('.g, .f', parent).not('.hide').addClass('selected');
			}
			if (data === 'unselect_all' && !files.openFiles) {
				$('.selected', parent).removeClass('selected');
			}
			if (data === 'remove_selected' && !files.openFiles) {
				var elems = $('.selected', parent).not('.hide');
				x.remove(elems);
			}
		}).on('keyup', '.header .search input', function(){
			var th = $(this);
			var val = th.val().trim().toLowerCase();
			var parent = th.parents('.items');

			$('.scroll .files .f', parent).each(function(){
				var th = $(this);
				var hide = false;

				if (val) {
					var id = +th.attr('data');
					var str = x.arr.files[id].title.toLowerCase() + ' ' + id;

					hide = val.split(' ').some(function(t){
						return str.indexOf(t) === -1;
					});
				}

				th.toggleClass('hide', hide);
			});

			$('.scroll', parent).data('plugin_tinyscrollbar').update('relative');
		});

		// list group
		x.el.list.on('click', '.g .select', function(){
			var th = $(this).parent();
			th.toggleClass('selected');
			return false;
		}).on('click', '.g .edit', function(){
			var id = +$(this).parent().attr('data');
			x.parent = $(this).parents('.items').attr('parent');

			x.editGroup(id);
			return false;
		}).on('click', '.g', function(e){
			var th = $(this);
			var id = th.attr('data');
			var parents = th.parents('.items');
			var index = parents.index() + 1;

			if (e.ctrlKey) {
				th.toggleClass('selected');
				return false;
			}

			if (th.hasClass('open')) return false;

			x.opened.splice(index, x.opened.length - index, id);
			x.drawList();
		});

		// list file
		x.el.list.on('click', '.f .edit', function(){
			var id = +$(this).parents('.f').attr('data');
			x.editFile(id);
			return false;
		}).on('click', '.f', function(e){
			var th = $(this);
			var id = +th.attr('data');

			if (files.openFiles) {
				if (files.openFiles == 1) {
					$('.f', x.el.list).removeClass('selected');
					th.addClass('selected');
					files.openFilesSelected = [id];
				}
				if (files.openFiles == 2) {
					th.toggleClass('selected');
					if (th.hasClass('selected')) {
						files.openFilesSelected.push(id);
					} else {
						var n = $.inArray(id, files.openFilesSelected);
						if (n > -1) delete files.openFilesSelected[n];
						files.openFilesSelected = $.map(files.openFilesSelected, function(el, i){
							if (el) return +el;
						});
					}
				}
			} else {
				var parent = th.parent();

				if (e.shiftKey) {
					var file = $('.f.selected', parent);
					if (!file.length) parent.attr('last_selected', '');

					var f_selected = parent.attr('last_selected') || 0;
					var c_selected = th.index();
					var min = Math.min(f_selected, c_selected);
					var max = Math.max(f_selected, c_selected);

					$('.f', parent).removeClass('selected').each(function(i){
						if (i >= min && i <= max) $(this).addClass('selected');
					});
				} else {
					th.toggleClass('selected');
					parent.attr('last_selected', th.hasClass('selected') ? th.index() : '');
				}
			}
		}).on('dblclick', '.f', function(){
			var th = $(this);
			var id = th.attr('data');
			console.log('Open lightbox #' + id);
		});

		if (window.FileReader == null) return false;

		x.el.list.on('dragover', '.items', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.addClass('dragover').prev().find('.g.open').addClass('dragover');
		}).on('dragleave', '.items', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.removeClass('dragover').prev().find('.g.open').removeClass('dragover');
		}).on('drop', '.items', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.removeClass('dragover').prev().find('.g.open').removeClass('dragover');

			if (e.originalEvent.dataTransfer) {
				x.parent = th.attr('parent');
				x.addFile(e.originalEvent.dataTransfer.files);
			}
		}).on('dragover', '.g', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.addClass('dragover');
			if (th.hasClass('open')) {
				$('.items', x.el.list).filter('[parent="' + th.attr('data') + '"]').addClass('dragover');
			}
		}).on('dragleave', '.g', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.removeClass('dragover');
			$('.items', x.el.list).removeClass('dragover');
		}).on('drop', '.g', function(e){
			var th = $(this);

			e.preventDefault();
			e.stopPropagation();

			th.removeClass('dragover');
			$('.items', x.el.list).removeClass('dragover');

			if (e.originalEvent.dataTransfer) {
				x.parent = th.attr('data');
				x.addFile(e.originalEvent.dataTransfer.files);
			}
		});

		x.el.upload.on('click', '.save_close', function(){
			x.el.upload.removeClass('show');

			setTimeout(function(){
				$('.progress', x.el.upload).removeClass('hide').css({width: 0});
				$('.save_close', x.el.upload).hide();

				var ids = [];
				var info = [];

				$('.item', x.el.upload).each(function(){
					var th = $(this);
					var id = +th.attr('i');

					if (th.hasClass('disabled')) return true;

					var title = $('input[name="title"]', th).val().trim();
					var desc = $('input[name="desc"]', th).val().trim();

					ids.push(id);
					info.push([title, desc]);
					x.arr.files[id].title = title;
				});

				if (ids.length) {
					$.post('?files/file_upload_sorting', {ids: ids, parent: x.parent}, function(json){
						$.post('?files/edit_files', {ids: ids, info: info}, function(json){
							var parent = $('.items[parent="' + x.parent + '"]', x.el.list);
							parent.nextAll().remove();
							parent.remove();

							x.input.get(0).value = '';
							x.drawList();

							x.el.overlay.removeClass('show');
						}, 'json');
					}, 'json');
				} else {
					x.el.overlay.removeClass('show');
				}
			}, 210);
		}).on('click', '.remove', function(){
			// TODO
		});
	},
	handlers_form: function()
	{
		var x = this;

		x.el.form.on('click', '.header .save', function(){
			x.saveFile();
		}).on('click', '.header .save_close', function(){
			x.saveFile(true);
		}).on('click', '.header .close', function(){
			x.closeFile();
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

		var listUpdateEmpty = function(){
			$('.g.empty', x.el.list).remove();
			$('.overview .groups', x.el.list).each(function(){
				var th = $(this);
				var child = th.children();

				if (!child.length) th.html('<div class="g br3 empty">' + lang['files_list_groups_empty'] + '</div>');
			});
		};
		var listUpdateCounts = function(){
			$('.g', x.el.list).each(function(){
				var th = $(this);
				var id = th.attr('data');

				if (id) $('.count', th).text(x.getCount(id));
			});
		};
		var listUpdateScrollbar = function(){
			$('.scroll', x.el.list).each(function(){
				$(this).data('plugin_tinyscrollbar').update('relative');
			});
		};
		var setSortingFiles = function(){
			var s_files = [];

			var child = function(parent){
				if (!x.arr.groups[parent]) return false;

				$.each(x.arr.groups[parent].childs.files, function(i, el){
					if (el && x.arr.files[el]) s_files.push({id: el, parent: parent});
				});
				$.each(x.arr.groups[parent].childs.groups, function(i, el){
					if (el && x.arr.groups[el]) child(el);
				});
			};
			child('#');

			sorting.set('files', s_files);
		};
		var setSortingGroups = function(){
			var s_groups = [];

			var child = function(parent){
				if (!x.arr.groups[parent]) return false;

				$.each(x.arr.groups[parent].childs.groups, function(i, el){
					if (el && x.arr.groups[el]) {
						s_groups.push({id: el, parent: parent});
						child(el);
					}
				});
			};
			child('#');

			sorting.set('files_groups', s_groups);
		};

		x.sg = new ui.sortable(x.el.list, {
			items: '.g',
			exclude: '.empty',
			items_drop: '.g',
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

					common.resize();
				}
			},
			onUpdate: function(items){
				var parents = items.parents('.items');
				var parent = parents.attr('parent');

				if (hover_to_parent !== false && !($.inArray(+hover_to_parent.id, items_id) + 1)) {// item drop on other item

					clearTimeout(timer_open); timer_open = null;

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr.groups[sender_id].childs.groups);
						if (find >= 0) x.arr.groups[sender_id].childs.groups.splice(find, 1);

						x.arr.groups[el].parent = hover_to_parent.id;
					});

					x.arr.groups[hover_to_parent.id].childs.groups = items_id.concat(x.arr.groups[hover_to_parent.id].childs.groups);

					if (hover_to_parent.item.hasClass('open')) {
						hover_to_parent.item.parents('.items').next().find('.groups').prepend(items);
					} else {
						items.remove();
					}

					listUpdateEmpty();
					listUpdateCounts();
					listUpdateScrollbar();
					setSortingGroups();

					return false;
				}

				if (sender_id === parent) {// item in this list

					x.arr.groups[sender_id].childs.groups = [];
					$('.g', parents).each(function(){
						var id = +$(this).attr('data');

						if (id) {
							x.arr.groups[id].parent = sender_id;
							x.arr.groups[sender_id].childs.groups.push(id);
						}
					});

					listUpdateEmpty();
					listUpdateCounts();
					listUpdateScrollbar();
					setSortingGroups();
				}

				if (sender_id !== parent) {// item move on other list

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr.groups[sender_id].childs.groups);
						if (find >= 0) x.arr.groups[sender_id].childs.groups.splice(find, 1);
					});

					x.arr.groups[parent].childs.groups = [];
					$('.g', parents).each(function(){
						var id = +$(this).attr('data');

						if (id) {
							x.arr.groups[id].parent = parent;
							x.arr.groups[parent].childs.groups.push(id);
						}
					});

					listUpdateEmpty();
					listUpdateCounts();
					listUpdateScrollbar();
					setSortingGroups();
				}
			},
			onHover: function(parent){
				listUpdateEmpty();
				hover_to_parent = {id: parent.attr('data'), item: parent};

				clearTimeout(timer_open); timer_open = null;
				timer_open = setTimeout(function(){
					$('.info', parent).trigger('click');

					var interval = setInterval(function(){
						x.sg.options.setPosition();
					}, 10);

					setTimeout(function(){
						clearInterval(interval); interval = null;
						x.sg.options.setPosition();
					}, 210);
				}, 1000);
			},
			onLeave: function(){
				listUpdateEmpty();
				hover_to_parent = false;
				clearTimeout(timer_open); timer_open = null;
			}
		});

		x.sf = new ui.sortable(x.el.list, {
			items: '.f',
			items_drop: '.g, .items',
			items_drop_exclude: '.empty',
			many: '.selected',
			items_size_box: true,
			only_drop: true,
			onStart: function(items){
				items_id = items.map(function(){
					return +$(this).attr('data');
				}).get();
				sender_parents = items.parents('.items');
				sender_id = sender_parents.attr('parent');
			},
			onCreatePlaceholder: function(placeholder){
				placeholder.append('<div class="inner"><div class="wrapper box br3 animate1"></div></div>');
			},
			onUpdate: function(items){
				var parents = items.parents('.items');
				var parent = parents.attr('parent');

				if (hover_to_parent !== false) {// file drop on group

					clearTimeout(timer_open); timer_open = null;

					$.each(items_id, function(i, el){
						var find = $.inArray(el, x.arr.groups[sender_id].childs.files);
						if (find >= 0) x.arr.groups[sender_id].childs.files.splice(find, 1);

						x.arr.files[el].parent = hover_to_parent.id;
					});

					x.arr.groups[hover_to_parent.id].childs.files = items_id.concat(x.arr.groups[hover_to_parent.id].childs.files);

					if (hover_to_parent.isGroup) {
						if (hover_to_parent.item.hasClass('open')) {
							hover_to_parent.item.parents('.items').next().find('.files').prepend(items);
						} else {
							items.remove();
						}
					} else {
						hover_to_parent.item.find('.files').prepend(items);
					}

					listUpdateCounts();
					listUpdateScrollbar();
					setSortingFiles();
				}

				// sort
			},
			onHover: function(parent){
				var isGroup = parent.hasClass('g');

				if (isGroup) {
					hover_to_parent = {id: parent.attr('data'), item: parent, isGroup: true};

					$('.items', x.el.list).removeClass('ui_sortable-item-drop').filter('[parent="' + parent.attr('data') + '"]').addClass('ui_sortable-item-drop');

					clearTimeout(timer_open); timer_open = null;
					timer_open = setTimeout(function(){
						$('.info', parent).trigger('click');

						$('.items[parent="' + parent.attr('data') + '"]', x.el.list).addClass('ui_sortable-item-drop');

						var interval = setInterval(function(){
							x.sf.options.setPosition();
						}, 10);

						setTimeout(function(){
							clearInterval(interval); interval = null;
							x.sf.options.setPosition();
						}, 210);
					}, 1000);
				} else {
					hover_to_parent = {id: parent.attr('parent'), item: parent, isGroup: false};

					parent.prevAll().find('#g' + parent.attr('parent')).addClass('ui_sortable-item-drop');
				}
			},
			onLeave: function(parent){
				var isGroup = parent.hasClass('g');

				hover_to_parent = false;

				if (isGroup) {
					$('.items', x.el.list).removeClass('ui_sortable-item-drop');
					parent.parents('.items').addClass('ui_sortable-item-drop');

					clearTimeout(timer_open); timer_open = null;
				} else {
					parent.prevAll().find('#g' + parent.attr('parent')).removeClass('ui_sortable-item-drop');
				}
			}
		});
	},
	loadList: function(callback)
	{
		var x = this;

		var load_items = false;
		var load_sorting = false;

		var loadItems = function(){
			$.get('?files/get_list_items', function(json){
				x.arr = {
					files: {},
					groups: {}
				};

				$.each(json.files, function(i, el){
					x.arr.files[el[0]] = {
						id: el[0],
						title: el[1],
						type: x.get_typeFile(el[2]),
						parent: ''
					};
				});
				$.each(json.groups, function(i, el){
					x.arr.groups[el[0]] = {
						id: el[0],
						title: el[1],
						parent: ''
					};
				});
				x.arr.groups['#'] = {
					id: '#',
					title: lang['files_header_root']
				};

				load_items = true;
				parse();
			}, 'json');
		};
		var loadSorting = function(){
			$.get('?files/get_list_sorting', function(json){
				x.sorting = json;

				x.sorting.files = x.sorting.files.split(';');
				x.sorting.groups = x.sorting.groups.split(';');

				x.sorting.files = $.map(x.sorting.files, function(el){
					if (el) {
						var el = el.split(':');
						return {id: el[0], parent: el[1]};
					}
				});
				x.sorting.groups = $.map(x.sorting.groups, function(el){
					if (el) {
						var el = el.split(':');
						return {id: el[0], parent: el[1]};
					}
				});

				load_sorting = true;
				parse();
			}, 'json');
		};

		var parse = function(){
			if (load_items && load_sorting) {
				$.each(x.arr.files, function(i, el){
					x.arr.files[i].parent = '';
				});
				$.each(x.arr.groups, function(i, el){
					x.arr.groups[i].parent = '';
					x.arr.groups[i].childs = {files: [], groups: []};
				});

				$.each(x.sorting.files, function(i, el){
					if (el && x.arr.files[el.id] && x.arr.groups[el.parent]) {
						x.arr.files[el.id].parent = el.parent;
						x.arr.groups[el.parent].childs.files.push(+el.id);
					}
				});
				$.each(x.sorting.groups, function(i, el){
					if (el && x.arr.groups[el.id] && x.arr.groups[el.parent]) {
						x.arr.groups[el.id].parent = el.parent;
						x.arr.groups[el.parent].childs.groups.push(+el.id);
					}
				});
				$.each(x.arr.files, function(i, el){
					if (!el.parent) {
						x.arr.files[i].parent = '#';
						x.arr.groups['#'].childs.files.push(+i);
					}
				});
				$.each(x.arr.groups, function(i, el){
					if (!el.parent && i !== '#') {
						x.arr.groups[i].parent = '#';
						x.arr.groups['#'].childs.groups.push(+i);
					}
				});

				callback(x.arr);
			}
		};

		$.get('?files/get_last_update', function(json){
			if (json.lastUpdateFiles === x.last_update.items) {
				load_items = true;
				parse();
			} else {
				x.last_update.items = json.lastUpdateFiles;
				loadItems();
			}

			if (json.lastUpdateFilesSorting === x.last_update.sorting) {
				load_sorting = true;
				parse();
			} else {
				x.last_update.sorting = json.lastUpdateFilesSorting;
				loadSorting();
			}
		}, 'json');
	},
	loadDrawList: function()
	{
		var x = this;

		x.el.overlay.addClass('show');

		x.loadList(function(){
			x.drawList();
			x.el.overlay.removeClass('show');
		});
	},
	drawList: function()
	{
		var x = this;

		var template = '';

		$.each(x.opened, function(i, id){
			if (!x.arr.groups[id]) return false;

			var html = {files: [], groups: []};

			$.each(x.arr.groups[id].childs.files, function(index, el){
				if (el && x.arr.files[el]) {
					var classes = [];
					var type = x.arr.files[el].type;
					var image = type == 'image' ? 'style="background-image:url(/qrs/getfile/' + el + '/200/200/0);"' : '';
					if (files.openFiles && $.inArray(el, files.openFilesSelected) > -1) classes.push('selected');

					var template = m.template(x.template.list_item_files, {
						id: el,
						class: classes.join(' '),
						image: image,
						icon: type == 'image' ? '' : icons['format_' + type],
						title: x.arr.files[el].title
					});
					html.files.push(template);
				}
			});

			$.each(x.arr.groups[id].childs.groups, function(index, el){
				if (el && x.arr.groups[el]) {
					var classes = [];
					if (x.opened[i + 1] && x.opened[i + 1] == el) classes.push('open');

					var template = m.template(x.template.list_item_group, {
						id: el,
						class: classes.join(' '),
						count: x.getCount(el),
						title: x.arr.groups[el].title
					});
					html.groups.push(template);
				}
			});

			template += m.template(x.template.list, {
				parent: id,
				width: x.width,
				title: x.arr.groups[id].title,
				groups: html.groups.join('') || '<div class="g br3 empty">' + lang['files_list_groups_empty'] + '</div>',
				files: html.files.join('') + '<div class="clr"></div>'
			});
		});

		x.el.list.html(template);

		$('.items', x.el.list).last().find('.header .search input').focus();

		$('.scroll', x.el.list).each(function(){
			$(this).tinyscrollbar();
		});

		common.resize();
	},
	addGroup: function()
	{
		var x = this;

		alertify.prompt(lang['files_list_groups_title_create'], function(e, str){
			if (!e) return false;

			x.el.overlay.addClass('show');

			var url = '?files/groups_add', data = {title: str, parent: x.parent};
			$.post(url, data, function(json){
				if (json.status === 'OK') {
					var id = json.id;

					x.arr.groups[id] = {
						id: id,
						title: str,
						childs: {files: [], groups: []},
						parent: x.parent
					};
					x.arr.groups[x.parent].childs.groups.push(id);

					var parent = $('.items[parent="' + x.parent + '"]', x.el.list);
					parent.nextAll().remove();
					parent.remove();

					x.drawList();
				} else {
					m.report(url, data, JSON.stringify(json));
				}

				x.el.overlay.removeClass('show');
			}, 'json');
		}, lang['files_list_groups_title_default']);
	},
	editGroup: function(id)
	{
		var x = this;

		alertify.prompt(lang['files_list_groups_title_edit'], function(e, str){
			if (!e) return false;

			x.el.overlay.addClass('show');

			var url = '?files/groups_edit', data = {id: id, title: str};
			$.post(url, data, function(json){
				if (json.status === 'OK') {
					x.arr.groups[id].title = str;

					var parent = $('.items[parent="' + x.parent + '"]', x.el.list);
					parent.nextAll().remove();
					parent.remove();

					x.drawList();
				} else {
					m.report(url, data, JSON.stringify(json));
				}

				x.el.overlay.removeClass('show');
			}, 'json');
		}, x.arr.groups[id].title);
	},
	addFile: function(files)
	{
		var x = this;

		var files = files;
		var length = files.length;
		if (!length) return false;

		var end = function(){
			$('.progress', x.el.upload).addClass('hide');
			$('.save_close', x.el.upload).show();
		};
		var n = 0;
		var sendFile = function(el){
			if (!el.length) {
				end();
				return false;
			}

			var i = el.addClass('load').attr('i');
			var file = files[i];
			var old = 0;

			if (el.hasClass('disabled')) {
				$('.progress', x.el.upload).css({width: ++n / length * 100 + '%'});
				var next = el.next();
				sendFile(next);
				return false;
			}

			var fd = new FormData;
			fd.append('fileup[]', file);

			var xhr = new XMLHttpRequest();
			xhr.upload.addEventListener('progress', function(e){
				var p = e.loaded / e.total;
				n += p - old;
				old = p;
				$('.progress', x.el.upload).css({width: n / length * 100 + '%'});
			}, false);
			xhr.onreadystatechange = function(e){
				var q = e.target;
				if (q.readyState != 4 || q.status != 200) return false;

				var json = $.parseJSON(q.responseText);
				if (json.error) {
					el.addClass('disabled br3').html(vsprintf(lang['files_upload_error'], [file.name, json.error]));
				} else {
					$.each(json, function(index, elem){
						var id = +index;

						x.arr.files[id] = {
							id: id,
							title: elem.title,
							type: x.get_typeFile(elem.ext),
							parent: x.parent
						};
						x.arr.groups[x.parent].childs.files.unshift(id);

						el.attr('i', id);
					});
				}

				el.removeClass('load').addClass('loaded');
				var next = el.next();
				sendFile(next);
			};
			xhr.open('POST', '?files/file_upload');
			xhr.send(fd);
		};

		x.el.overlay.addClass('show');

		setTimeout(function(){
			var html = $.map(files, function(el, i){
				var valid = true;

				var title = el.name.replace(/_/g, ' ').split('.');
				var ext = '';
				if (title.length > 1) ext = title.splice(-1, 1)[0].toLowerCase();
				var type = x.get_typeFile(ext);

				if (type === 'undefined') valid = false;
				if (el.size > maxfilesize) valid = false;

				if (valid) {
					return '<div class="item" i="' + i + '" t="' + type + '">\
						<div class="image box br3">' + (type === 'image' ? '' : icons['format_' + type]) + '</div>\
						<div class="info">\
							<div class="remove"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212.982 212.982"><path d="M131.804 106.49l75.936-75.935c6.99-6.99 6.99-18.323 0-25.312-6.99-6.99-18.322-6.99-25.312 0L106.49 81.18 30.555 5.242c-6.99-6.99-18.322-6.99-25.312 0-6.99 6.99-6.99 18.323 0 25.312L81.18 106.49 5.24 182.427c-6.99 6.99-6.99 18.323 0 25.312 6.99 6.99 18.322 6.99 25.312 0L106.49 131.8l75.938 75.937c6.99 6.99 18.322 6.99 25.312 0 6.99-6.99 6.99-18.323 0-25.313l-75.936-75.936z"></path></svg></div>\
							<div class="title">' + el.name + '</div>\
							<input class="br3 box animate1" type="text" value="' + title.join('.') + '" name="title" placeholder="' + lang['files_upload_i_title'] + '">\
							<input class="br3 box animate1" type="text" value="" name="desc" placeholder="' + lang['files_upload_i_desc'] + '">\
						</div>\
						<div class="clr"></div>\
					</div>';
				} else {
					var error = vsprintf(lang[type === 'undefined' ? 'files_upload_error_fileformat' : 'files_upload_error_filesize'], [el.name]);
					return '<div class="item disabled br3" i="' + i + '">\
						' + error + '\
					</div>';
				}

			}).join('');

			$('.wrapper', x.el.upload).html(html);
			$('.footer', x.el.upload).html(vsprintf(lang['files_upload_footer'], [fileformats.join(', '), maxfilesize / 1024 / 1024]));

			$('.item', x.el.upload).each(function(){
				var th = $(this);
				var i = th.attr('i');
				var t = th.attr('t');

				if (t !== 'image') return true;

				var r = new FileReader();
				r.readAsDataURL(files[i]);
				r.onloadend = function() {
					m.preload(r.result, function(img){
						var w = img.width;
						var h = img.height;
						$('.image', th).toggleClass('big', w > 200 || h > 200).css({backgroundImage: 'url("' + r.result + '")'});
					}, function(e){
						th.addClass('disabled br3').html(vsprintf(lang['files_upload_error_fileformat'], [$('.title', th).text()]));
					});
				}
			});

			x.el.upload.addClass('show');

			setTimeout(function(){
				var el = $('.item', x.el.upload).eq(0);
				sendFile(el);
			}, 210);
		}, 210);
	},
	editFile: function(id)
	{
		var x = this;

		x.el.overlay.addClass('show');

		$.post('?files/get_file', {id: id}, function(json){
			if (json.status === 'OK') {
				var file = json.file;
				var type = x.arr.files[id].type;

				x.mode = id;

				var template = m.template(x.template.form, {
					title: vsprintf(lang['files_form_title'], [file.title]),
					childs: x.types[type].html()
				});
				x.el.form.html(template);

				$('#filename', x.el.form).val(siteurl + 've-files/' + file.filename);
				$('#title', x.el.form).val(file.title);
				$('#desc', x.el.form).val(file.desc);

				x.el.form.addClass('show');
				x.el.list.addClass('edited');

				common.resize();

				setTimeout(function(){
					x.types[type].action(x.el.form, file, function(){
						common.resize();
						x.el.overlay.removeClass('show');
					});
				}, 210);
			} else {
				alertify.error(lang['files_edit_file_empty']);
				$('.items', x.el.list).remove();
				x.loadDrawList();
			}
		}, 'json');
	},
	saveFile: function(close)
	{
		var x = this;

		x.el.overlay.addClass('show');

		var id = x.mode;
		var type = x.arr.files[id].type;

		var url = '?files/edit_file';
		var data = {
			id: x.mode,
			title: $('#title', x.el.form).val().trim(),
			desc: $('#desc', x.el.form).val().trim()
		};
		$.extend(data, x.types[type].save());

		$.post(url, data, function(json){
			if (json.status === 'OK') {
				x.arr.files[id].title = data.title;

				$('.f#f' + x.mode, x.el.list).find('.title').text(data.title).attr('title', data.title);

				if (close) {
					x.closeFile();
				} else {
					$('.header .title', x.el.form).text(vsprintf(lang['files_form_title'], [data.title]));
				}

				x.el.overlay.removeClass('show');
			} else {
				m.report(url, data, JSON.stringify(json));
				x.el.overlay.removeClass('show');
			}
		}, 'json');
	},
	closeFile: function()
	{
		var x = this;

		x.mode = false;

		x.el.list.removeClass('edited');
		x.el.form.empty().removeClass('show');
		$('.item.edited', x.el.list).removeClass('edited');

		common.resize();
	},
	remove: function(elems)
	{
		var x = this;

		if (!elems.length) return false;

		var groups = elems.filter('.g');
		var files = elems.filter('.f');
		var ids = {groups: [], files: []};

		elems.addClass('removed');

		ids.files = files.map(function(){
			var id = +$(this).attr('data');
			if (x.arr.files[id]) return id;
		}).get();

		var child = function(parent){
			if (!x.arr.groups[parent]) return false;

			ids.groups.push(parent);
			$.each(x.arr.groups[parent].childs.files, function(i, el){
				if (x.arr.files[el]) ids.files.push(el);
			});
			$.each(x.arr.groups[parent].childs.groups, function(i, el){
				child(el);
			});
		};
		groups.each(function(){
			var id = +$(this).attr('data');
			child(id);
		});

		var counts = ids.groups.length + ids.files.length;

		alertify.confirm(vsprintf(lang['files_remove_file_desc'], [counts]), function(e){
			if (e) {
				x.el.overlay.addClass('show');

				var deleted_files = !ids.files.length;
				var deleted_groups = !ids.groups.length;

				var end = function(){
					if (deleted_files && deleted_groups) {
						$('.items', x.el.list).remove();
						x.drawList();
						x.el.overlay.removeClass('show');
					}
				};

				if (ids.files.length) {
					var furl = '?files/file_delete', fdata = {ids: ids.files, parent: x.parent};
					$.post(furl, fdata, function(json){
						if (json.status === 'OK') {
							$.each(ids.files, function(i, id){
								var parent = x.arr.files[id].parent;
								if (x.arr.groups[parent]) {
									var key = $.inArray(id, x.arr.groups[parent].childs.files);
									x.arr.groups[parent].childs.files.splice(key, 1);
								}
								delete x.arr.files[id];
							});

							deleted_files = true;
							end();
						} else {
							m.report(furl, fdata, JSON.stringify(json));
							x.el.overlay.removeClass('show');
						}
					}, 'json');
				}

				if (ids.groups.length) {
					var gurl = '?files/groups_delete', gdata = {ids: ids.groups, parent: x.parent};
					$.post(gurl, gdata, function(json){
						if (json.status === 'OK') {
							$.each(ids.groups, function(i, id){
								var parent = x.arr.groups[id].parent;
								if (x.arr.groups[parent]) {
									var key = $.inArray(id, x.arr.groups[parent].childs.groups);
									x.arr.groups[parent].childs.groups.splice(key, 1);
								}
								delete x.arr.groups[id];
							});

							deleted_groups = true;
							end();
						} else {
							m.report(gurl, gdata, JSON.stringify(json));
							x.el.overlay.removeClass('show');
						}
					}, 'json');
				}
			} else {
				elems.removeClass('removed');
			}
		});
	},
	getCount: function(id)
	{
		var x = this;

		var childs = 0;

		var child = function(id){
			if (!x.arr.groups[id]) return false;
			$.each(x.arr.groups[id].childs.files, function(i, el){
				if (el && x.arr.files[el]) {
					childs++;
				}
			});
			$.each(x.arr.groups[id].childs.groups, function(i, el){
				if (el && x.arr.groups[el]) {
					child(el);
				}
			});
		};
		child(id);

		return childs || '';
	},
	get_typeFile: function(ext)
	{
		var x = this;

		var ext = ext.toLowerCase();
		if (ext == 'jpg' || ext == 'jpeg' || ext == 'png' || ext == 'gif')
			return 'image';
		if (ext == 'pdf' || ext == 'doc' || ext == 'docx' || ext == 'xls' || ext == 'xlsx')
			return 'document';
		if (ext == 'zip' || ext == 'rar')
			return 'archive';
		if (ext == 'mp3')
			return 'audio';
		if (ext == 'mp4' || ext == 'webm')
			return 'video';
		return 'undefined';
	},
	openPathToFile: function(id)
	{
		var x = this;

		x.loadList(function(){
			var parent = x.arr.files[id].parent;
			var parents = [parent];
			var get_parent = function(id){
				var parent = x.arr.groups[id].parent;
				parents.unshift(parent);
				if (parent !== '#') get_parent(parent);
			};
			if (parent !== '#') get_parent(parent);

			x.opened = parents;

			x.el.list.empty();
			x.drawList();

			setTimeout(function(){
				var item = $('#f' + id, x.el.list).addClass('finded');
				var top = item.position().top;
				item.parents('.scroll').data('plugin_tinyscrollbar').update(top).update('relative');
				setTimeout(function(){
					item.removeClass('finded');
				}, 5000);
			}, 500);
		});
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
			var w_list = ww - 40;
			var count = 2;
			x.width = w_list / count;
			var elems = $('.items', x.el.list).css({width: x.width});
			var length = elems.length;
			var left = -1 * (Math.max(count, length) - count) * x.width;
			x.el.list.css({width: x.width * length, transform: 'translateX(' + left + 'px)'});
		} else {
			var w_form = x.el.form.outerWidth();
			var w_list = ww - 40 - w_form;
			var count = w_list <= 450 ? 1 : 2;
			x.width = w_list / count;
			var elems = $('.items', x.el.list).css({width: x.width});
			var length = elems.length;
			var left = -1 * (Math.max(count, length) - count) * x.width;
			x.el.list.css({transform: 'translateX(' + left + 'px)'});
		}

		clearTimeout(x.timer); x.timer = null;
		x.timer = setTimeout(function(){
			if (x.types.image.resizeCrop) x.types.image.resizeCrop();
		}, 1000);
	},
	types:
	{
		image:
		{
			html: function(){
				return '<div class="container">\
					<div class="field box left text">\
						<div class="head"><p>' + lang['files_form_type_image_size_or'] + '</p></div>\
						<div class="group">\
							<input id="size_or" class="br3 box animate1" type="text" value="" disabled>\
						</div>\
					</div>\
					<div class="field box right text">\
						<div class="head"><p>' + lang['files_form_type_image_size_crop'] + '</p></div>\
						<div class="group crop_size">\
							<input id="size_crop_w" class="br3 box animate1" type="text" value="0">\
							<span>x</span>\
							<input id="size_crop_h" class="br3 box animate1" type="text" value="0">\
						</div>\
					</div>\
					<div class="clr"></div>\
				</div>\
				<div class="container">\
					<div class="field select">\
						<div class="head"><p>' + lang['files_form_type_image_crop_ratio'] + '</p></div>\
						<div class="group crop_ratio">\
							<p class="animate1 br3 active" data="none">' + lang['files_form_type_image_crop_ratio_none'] + '</p>\
							<p class="animate1 br3" data="current">' + lang['files_form_type_image_crop_ratio_current'] + '</p>\
							<p class="animate1 br3" data="1/1">1/1</p>\
							<p class="animate1 br3" data="4/3">4/3</p>\
							<p class="animate1 br3" data="16/9">16/9</p>\
							<p class="animate1 br3" data="10/4">10/4</p>\
							<div class="clr"></div>\
						</div>\
					</div>\
				</div>\
				<div class="container">\
					<div class="field text">\
						<div class="head"><p>' + lang['files_form_type_image_crop'] + '</p></div>\
						<div class="group crop_image">\
							<div class="rotate r_l" data="l">\
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 481.95 481.95"><path d="M114.75 191.25l-35.7-35.7C56.1 186.15 40.8 219.3 38.25 255h51c2.55-22.95 12.75-43.35 25.5-63.75zM89.25 306h-51c5.1 35.7 17.85 68.85 40.8 99.45l35.7-35.7C102 349.35 91.8 328.95 89.25 306zm25.5 135.15c30.6 22.949 63.75 35.699 99.45 40.8v-51c-22.95-2.55-43.35-12.75-63.75-25.5l-35.7 35.7zM265.2 79.05V0L150.45 114.75 265.2 229.5v-99.45C336.6 142.8 392.7 204 392.7 280.5s-56.1 137.7-127.5 150.45v51c99.45-12.75 178.5-99.45 178.5-201.45S364.65 91.8 265.2 79.05z"/></svg>\
							</div>\
							<div class="rotate r_r" data="r">\
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 481.95 481.95"><path d="M331.5 114.75L216.75 0v79.05C117.3 91.8 38.25 175.95 38.25 280.5s79.05 188.7 178.5 201.45v-51C145.35 418.2 89.25 357 89.25 280.5s56.1-137.7 127.5-150.45v99.45L331.5 114.75zM443.7 255c-5.101-35.7-17.851-68.85-40.8-99.45l-35.7 35.7c12.75 20.4 22.95 40.8 25.5 63.75h51zM267.75 430.95v51c35.7-5.101 68.85-17.851 99.45-40.8l-35.7-35.7c-20.4 12.75-40.8 22.95-63.75 25.5zm99.45-61.2l35.7 35.7c22.949-30.601 38.25-63.75 40.8-99.45h-51c-2.55 22.95-12.75 43.35-25.5 63.75z"/></svg>\
							</div>\
						</div>\
					</div>\
				</div>';
			},
			action: function(form, file, callback){
				var x = this;

				var $size_or = $('#size_or', form);
				var $size_crop_w = $('#size_crop_w', form);
				var $size_crop_h = $('#size_crop_h', form);
				var $crop_ratio = $('.crop_ratio', form);
				var $crop = $('.crop_image', form);

				x.jcrop = false;
				x.crop_size = '';
				var aspectRatio = false;
				var crop = file.crop ? file.crop.split(';') : [];
				var size = file.size ? file.size.split(';') : [];

				var coordsShow = function(c){
					crop = [Math.round(c.w), Math.round(c.h), Math.round(c.y), Math.round(c.x)];
					x.crop_size = crop.join(';');
					$size_crop_w.val(crop[0]);
					$size_crop_h.val(crop[1]);
				};
				var coordsClear = function(){
					x.crop_size = '';
					$size_crop_w.val(0);
					$size_crop_h.val(0);
				};
				var change = function(){
					var w = $size_crop_w.val().trim();
					var h = $size_crop_h.val().trim();
					var size = x.crop_size.split(';');
					var x1 = +size[3] || 0,
						x2 = +w + x1,
						y1 = +size[2] || 0,
						y2 = +h + y1;

					if (x.jcrop) x.jcrop.setSelect([x1, y1, x2, y2]);
				};

				$size_or.val(size.join(' x '));

				$size_crop_w.on('change', change);
				$size_crop_h.on('change', change);
				$crop_ratio.on('click', 'p', function(){
					var th = $(this);
					var data = th.attr('data');
					th.addClass('active').siblings().removeClass('active');

					if (data === 'none') aspectRatio = false;
					if (data === 'current') aspectRatio = $size_crop_w.val() / $size_crop_h.val();
					if (data === '1/1') aspectRatio = 1;
					if (data === '4/3') aspectRatio = 4 / 3;
					if (data === '16/9') aspectRatio = 16 / 9;
					if (data === '10/4') aspectRatio = 10 / 4;

					if (x.jcrop) x.jcrop.setOptions({aspectRatio: aspectRatio});
				});
				$crop.on('click', '.rotate', function(){
					var data = $(this).attr('data');
					files.el.overlay.addClass('show');
					files.el.form.removeClass('show');

					$.post('?files/rotate', {id: files.mode, rotate: data}, function(json){
						$('#f' + files.mode, files.el.list).find('.image').css({backgroundImage: 'url(/qrs/getfile/' + files.mode + '/200/200/0?' + (+new Date()) + ')'});
						files.editFile(files.mode);
					}, 'json');
				});

				x.resizeCrop = function(){
					if (x.jcrop) x.jcrop.destroy();
					$crop.find('.image').remove();
					$crop.find('.jcrop-holder').remove();

					$('<img class="image" src="' + siteurl + 've-files/' + file.filename + '?' + (+new Date()) + '" />').on('load', function(){
						var th = $(this);

						setTimeout(function(){
							// http://deepliquid.com/content/Jcrop.html
							x.jcrop = $.Jcrop(th, {
								onChange: coordsShow,
								onSelect: coordsShow,
								onRelease: coordsClear,
								aspectRatio: aspectRatio,
								trueSize: size,
								bgOpacity: .3
							});

							if (crop[0] && crop[1]) {
								var x1 = +crop[3] || 0;
								var x2 = +crop[0] + x1;
								var y1 = +crop[2] || 0;
								var y2 = +crop[1] + y1;
								x.jcrop.setSelect([x1, y1, x2, y2]);
							}
						}, 210);
					}).appendTo($crop);
				};

				callback();
			},
			save: function(){
				var x = this;

				return {
					crop: x.crop_size || ''
				};
			}
		},
		document:
		{
			html: function(){
				return '';
			},
			action: function(form, file, callback){
				callback();
			},
			save: function(){
				return {};
			}
		},
		archive:
		{
			html: function(){
				return '';
			},
			action: function(form, file, callback){
				callback();
			},
			save: function(){
				return {};
			}
		},
		audio:
		{
			html: function(){
				return '<div class="container">\
					<div class="field text">\
						<div class="head"><p>' + lang['files_form_type_audio_title'] + '</p></div>\
						<div class="group">\
							<div class="br3 audio">\
								<div class="play">\
									<svg class="audio_play" viewBox="0 0 124.512 124.512"><path d="M113.956,57.006l-97.4-56.2c-4-2.3-9,0.6-9,5.2v112.5c0,4.6,5,7.5,9,5.2l97.4-56.2 C117.956,65.105,117.956,59.306,113.956,57.006z"/></svg>\
									<svg class="audio_pause" viewBox="0 0 124.5 124.5"><path d="M116.35,124.5c3.3,0,6-2.699,6-6V6c0-3.3-2.7-6-6-6h-36c-3.3,0-6,2.7-6,6v112.5c0,3.301,2.7,6,6,6H116.35z"/><path d="M44.15,124.5c3.3,0,6-2.699,6-6V6c0-3.3-2.7-6-6-6h-36c-3.3,0-6,2.7-6,6v112.5c0,3.301,2.7,6,6,6H44.15z"/></svg>\
								</div>\
								<div class="creat_ts" title="' + lang['files_form_type_audio_creat_ts'] + '">\
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 542.183 542.183"><path d="M432.544 310.636c0-9.897-3.52-18.56-10.564-25.984L217.844 80.8c-7.232-7.238-16.94-13.374-29.12-18.416-12.182-5.043-23.32-7.565-33.408-7.565H36.546c-9.897 0-18.465 3.618-25.695 10.847C3.617 72.9 0 81.467 0 91.365v118.77c0 10.09 2.52 21.22 7.564 33.405 5.046 12.185 11.187 21.792 18.417 28.837L230.12 476.8c7.043 7.042 15.608 10.563 25.694 10.563 9.898 0 18.562-3.52 25.984-10.564l140.186-140.47c7.04-7.046 10.56-15.605 10.56-25.694zM117.204 172.02c-7.14 7.138-15.752 10.71-25.84 10.71-10.086 0-18.7-3.572-25.838-10.71-7.14-7.14-10.705-15.75-10.705-25.837 0-10.09 3.567-18.702 10.706-25.837 7.14-7.14 15.752-10.71 25.837-10.71 10.09 0 18.702 3.57 25.84 10.71 7.136 7.135 10.708 15.75 10.708 25.837 0 10.088-3.57 18.698-10.706 25.837z"/><path d="M531.612 284.655l-204.14-203.85c-7.23-7.24-16.938-13.375-29.12-18.418-12.178-5.042-23.314-7.564-33.403-7.564h-63.954c10.088 0 21.222 2.522 33.402 7.564 12.185 5.046 21.892 11.182 29.125 18.417l204.137 203.85c7.046 7.424 10.57 16.085 10.57 25.982 0 10.09-3.524 18.647-10.57 25.693L333.47 470.52c5.717 5.9 10.758 10.18 15.132 12.846 4.38 2.666 9.996 3.998 16.844 3.998 9.903 0 18.565-3.52 25.98-10.564l140.186-140.47c7.046-7.046 10.57-15.604 10.57-25.693-.003-9.898-3.524-18.56-10.57-25.982z"/></svg>\
								</div>\
								<div class="volume">\
									<div class="track"><div class="thumb br3"><div class="end br3"></div></div></div>\
								</div>\
								<div class="timebar loader">\
									<div class="preload"></div>\
									<div class="timestamp"></div>\
								</div>\
							</div>\
						</div>\
					</div>\
				</div>';
			},
			action: function(form, file, callback){
				var elWrap = $('.audio', form);
				var elPlay = $('.play', elWrap), elTimebar = $('.timebar', elWrap), elVolume = $('.volume', elWrap);
				var play = false, time = 0;

				var editVolume = function(volume){
					var volume = Math.max(Math.min(volume, 1), 0);
					elAudio.volume = volume;
					$('.thumb', elVolume).css({width: volume * 100 + '%'});
				};
				elVolume.on('mousedown', '.track', function(e){
					var th = $(this);
					var width = th.width(), left = th.offset().left;
					editVolume((e.pageX - left) / width);
					$('body').on('mousemove.volume', function(w){
						editVolume((w.pageX - left) / width);
					}).on('mouseup.volume', function(){
						$('body').removeClass('noSelect').off('mousemove.volume mouseup.volume');
					}).addClass('noSelect');
				});

				elWrap.append('<audio src="' + siteurl + 've-files/' + file.filename + '" preload="auto" />');
				var elAudio = $('audio', elWrap).get(0);
				editVolume(0.5);

				elPlay.click(function(){
					if (play) {
						play = false;
						$(this).removeClass('pause');
						elAudio.pause();
					} else {
						play = true;
						$(this).addClass('pause');
						elAudio.play();
					}
				});

				elAudio.addEventListener('loadedmetadata', function(e){
					time = e.srcElement.duration;

					elAudio.addEventListener('progress', function(e){
						var buffered = Math.min(e.srcElement.buffered.end(0) / time, 1) * 100;
						$('.preload', elTimebar).stop().animate({width: buffered + '%'}, 1000, 'swing', function(){
							if (buffered == 100) $(this).remove();
						});
					}, false);

					elTimebar.removeClass('loader').on('mousedown', function(e){
						var th = $(this);
						var width = th.width(), left = th.offset().left;
						elAudio.currentTime = (e.pageX - left) / width * time;
						$('body').on('mousemove.time', function(w){
							elAudio.currentTime = (w.pageX - left) / width * time;
						}).on('mouseup.time', function(){
							$('body').removeClass('noSelect').off('mousemove.time mouseup.time');
						}).addClass('noSelect');
					});

					elAudio.addEventListener('timeupdate', function(e){
						var width = e.srcElement.currentTime / time * 100;
						$('.timestamp', elTimebar).css({width: width + '%'});
					}, false);

					elAudio.addEventListener('ended', function(e){
						$('.timestamp', elTimebar).css({width: 0});
						elPlay.removeClass('pause');
						play = false;
					}, false);
				}, false);

				$('.creat_ts', elWrap).click(function(){
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
					} else {
						$(this).addClass('active');
					}
				});

				callback();
			},
			save: function(){
				return {};
			}
		},
		video:
		{
			html: function(){
				return '';
			},
			action: function(form, file, callback){
				callback();
			},
			save: function(){
				return {};
			}
		}
	}
};

common.queue.push(files);