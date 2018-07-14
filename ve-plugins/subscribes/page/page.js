var plugin_subscribes_page = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	opened: ['#'], // load to localStorage
	el: {
		parent: $('#plugin_subscribes_page')
	},
	init: function(callback)
	{
		var x = this;

		x.el.lists = $('.lists', x.el.parent);
		x.el.forms = $('.forms', x.el.parent);

		$.getJSON('?plugins/subscribes/page/get', function(json){
			x.arr.items = {};
			x.arr.groups = {};

			$.each(json.subscribes, function(i, el){
				x.arr.items[el.id] = el;
			});
			$.each(json.subscribes_groups, function(i, el){
				x.arr.groups[el.id] = el;
			});

			x.arr.groups['#'] = {};

			$.each(x.arr.items, function(i, el){
				x.arr.items[i].parent = '';
			});
			$.each(x.arr.groups, function(i, el){
				x.arr.groups[i].childs = {items: [], groups: []};
				x.arr.groups[i].parent = '';
			});
			$.each(sorting.arr['subscribes'], function(i, el){
				if (el && x.arr.items[el.id] && x.arr.groups[el.parent]) {
					x.arr.items[el.id].parent = el.parent;
					x.arr.groups[el.parent].childs.items.push(+el.id);
				}
			});
			$.each(sorting.arr['subscribes_groups'], function(i, el){
				if (el && x.arr.groups[el.id] && x.arr.groups[el.parent]) {
					x.arr.groups[el.id].parent = el.parent;
					x.arr.groups[el.parent].childs.groups.push(+el.id);
				}
			});
			// set sorting for other
			$.each(x.arr.items, function(i, el){
				if (!el.parent) {
					x.arr.items[i].parent = '#';
					x.arr.groups['#'].childs.items.push(i);
				}
			});
			$.each(x.arr.groups, function(i, el){
				if (!el.parent && i != '#') {
					x.arr.groups[i].parent = '#';
					x.arr.groups['#'].childs.groups.push(i);
				}
			});

			callback();
		});
	},
	start: function()
	{
		var x = this;
		if (x.started) {x.reset(); return false;}
		x.started = true;

		x.draw();
		x.handlers();
	},
	handlers: function()
	{
		var x = this;

		var select = function(parent){
			var selected = $('.selected', parent);
			var add_group = $('.head', parent).find('.add_group');
			var add_item = $('.head', parent).find('.add_item');

			if (selected.length) {
				add_group.hide();
				add_item.addClass('remove');
			} else {
				add_group.show();
				add_item.removeClass('remove');
			}
		};
		x.el.lists.on('click', '.head_title', function(){
			var th = $(this).parents('.items');
			th.nextAll().remove();
			$('.item', th).removeClass('open');
			common.resize();

			x.reinit_scrollbars();
		}).on('click', '.menu p', function(){
			var th = $(this);
			var data = th.attr('data');
			var parent = th.parents('.items');

			if (data == 'select_all') {
				parent.find('.item').addClass('selected');
			}
			if (data == 'unselect_all') {
				parent.find('.selected').removeClass('selected');
			}
			if (data == 'send_mail') {
				var ids = [];
				var child = function(id){
					if (!x.arr.groups[id]) return false;
					$.each(x.arr.groups[id].childs.items, function(i, el){
						if (el && x.arr.items[el]) ids.push(+el);
					});
					$.each(x.arr.groups[id].childs.groups, function(i, el){
						if (el && x.arr.groups[el]) child(el);
					});
				};

				$('.item.selected', parent).each(function(){
					var th = $(this);
					var id = +th.attr('id');

					if (th.hasClass('group')) {
						child(id);
					} else {
						if (x.arr.items[id]) ids.push(id);
					}
				});

				x.create_mail(ids);
			}
			select(parent);
		}).on('click', '.add_group', function(){
			x.parent = $(this).parents('.items').attr('parent');
			x.addGroup();
		}).on('click', '.add_item', function(){
			var th = $(this);
			x.parent = th.parents('.items').attr('parent');
			if (th.hasClass('remove')) {
				var elems = th.parents('.items').find('.selected');
				x.remove(elems);
			} else {
				x.addItem();
			}
		}).on('click', '.select', function(){
			var th = $(this).parent();
			th.toggleClass('selected');
			select(th.parents('.items'));
			return false;
		}).on('click', '.edit', function(){
			var th = $(this).parent();
			var id = +th.attr('id');

			if (th.hasClass('group')) {
				x.editGroup(id);
			} else {
				x.editItem(id);
			}

			return false;
		}).on('click', '.item', function(){
			var th = $(this);
			var id = +th.attr('id');

			if (th.hasClass('group')) {
				var index = th.parents('.items').index() + 1;

				x.opened.splice(index, x.opened.length - index, id);
				x.draw();
			} else {
				th.toggleClass('selected');
				select(th.parents('.items'));
			}
		});

		x.reset();
	},
	sortable: function()
	{
		var x = this;

		var timer = null;
		var sort = function(id_parent, id_group, id_items){
			x.arr.groups[id_parent].childs.groups = id_group;
			x.arr.groups[id_parent].childs.items = id_items;

			$.each(id_group, function(i, id){
				x.arr.groups[id].parent = id_parent;
			});
			$.each(id_items, function(i, id){
				x.arr.items[id].parent = id_parent;
			});

			clearTimeout(timer); timer = null;
			timer = setTimeout(function(){
				x.draw();
				x.sorting();
			}, 50);
		};

		$('.overview', x.el.lists).sortable({
			connectWith: $('.overview', x.el.lists),
			appendTo: x.el.lists,
			helper: 'clone',
			items: '.item',
			update: function(e, ui){
				var item = ui.item;
				var sender = ui.sender;
				var parent = (sender ? sender : item).parents('.items');

				var id_parent = parent.attr('parent');
				var id_group = $('.item.group', parent).map(function(){
					return +$(this).attr('id');
				}).get();
				var id_items = $('.item:not(.group)', parent).map(function(){
					return +$(this).attr('id');
				}).get();

				sort(id_parent, id_group, id_items);
			},
			receive: function(e, ui){
				var item = ui.item;
				var sender = ui.sender;

				if (item.hasClass('open')) {
					item.removeClass('open');
					sender.parents('.items').nextAll().remove();
				}
				var new_parent = item.parent();
				$('.empty', new_parent).remove();
				var q = $('.item', sender);
				if (!q.length) sender.append('<div class="empty">' + x.lang['global_empty'] + '</div>');
			}
		});
		$('.item', x.el.lists).hover(function(){
			var th = $(this);
			if (th.hasClass('open')) {
				var prev = th.parents('.items').prevAll().find('.overview');
				th.parent().sortable('option', 'connectWith', prev);
			}
		}, function(){
			var th = $(this);
			if (th.hasClass('open')) th.parent().sortable('option', 'connectWith', $('.overview', x.el.lists));
		});
	},
	draw: function()
	{
		var x = this;

		var scrollbars = $('.scroll', x.el.lists).map(function(){
			return $(this).data('plugin_tinyscrollbar').contentPosition;
		}).get();

		x.el.lists.html($.map(x.opened, function(id, i){
			if (!x.arr.groups[id]) {
				x.opened.splice(i, x.opened.length - i);
				return false;
			}

			var html = [];

			$.each(x.arr.groups[id].childs.groups, function(index, el){
				if (el && x.arr.groups[el]) {
					var opened = x.opened[i + 1] && x.opened[i + 1] == el ? ' open' : '';

					html.push('<div id="' + el + '" class="item group' + opened + '">\
						<p class="select">' + icons.select_empty + icons.select_checked + '</p>\
						<p class="edit">' + icons.edit + '</p>\
						<p class="count">' + x.getCount(el) + '</p>\
						<p class="title">' + x.arr.groups[el].title + '</p>\
					</div>');
				}
			});

			$.each(x.arr.groups[id].childs.items, function(index, el){
				if (el && x.arr.items[el]) {
					html.push('<div id="' + el + '" class="item">\
						<p class="select">' + icons.select_empty + icons.select_checked + '</p>\
						<p class="edit">' + icons.edit + '</p>\
						<p class="title">' + x.arr.items[el].mail + '</p>\
					</div>');
				}
			});

			return drawing({
				attr_parent: id,
				attr_width: x.width,
				title_before: '<div class="actions fright">\
					<div class="animate menu">\
						' + icons.menu + '\
						<div class="hover">\
							<p data="select_all">' + x.lang['global_select_all'] + '</p>\
							<p data="unselect_all">' + x.lang['global_unselect_all'] + '</p>\
							<p data="send_mail">' + x.lang['send_email'] + '</p>\
						</div>\
					</div>\
					<div class="animate add_group">' + icons.add + '</div>\
					<div class="animate add add_item">' + icons.add + '</div>\
				</div>',
				title: id == '#' ? x.lang['subscribes'] : x.arr.groups[id].title,
				childs: !html.length ? '<div class="empty">' + x.lang['global_empty'] + '</div>' : html.join('')
			});
		}).join(''));

		x.scrollbar_lists = $('.scroll', x.el.lists).map(function(el, i){
			return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
		}).get();
		$.each(x.scrollbar_lists, function(i){
			this.update(scrollbars[i] || 0);
		});

		x.sortable();

		common.resize();

		x.reinit_scrollbars();
	},
	addGroup: function()
	{
		var x = this;

		alertify.prompt(x.lang['add_group_desc'], function(e, str){
			if (!e) return false;
			loader.show();
			var url = '?plugins/subscribes/page/add_group', group = {title: str};
			$.post(url, group, function(json){
				if (json['status'] == 'OK') {
					var id = +json['id'];
					x.arr.groups[id] = $.extend(group, {id: id, parent: x.parent, childs: {items: [], groups: []}});
					x.arr.groups[x.parent].childs.groups.push(id);
					x.draw();
					x.sorting();
				} else {
					m.report(url, group, JSON.stringify(json));
					loader.hide();
				}
			}, 'json');
		}, x.lang['add_group_default']);
	},
	editGroup: function(id)
	{
		var x = this;

		alertify.prompt(x.lang['edit_group_desc'], function(e, str){
			if (!e) return false;
			loader.show();
			x.arr.groups[id].title = str;
			$.post('?plugins/subscribes/page/edit_group', x.arr.groups[id], function(json){
				if (json['status'] == 'OK') {
					x.draw();
					x.reset();
				} else {
					m.report('?plugins/subscribes/page/edit_group', x.arr.groups[id], JSON.stringify(json));
					loader.hide();
				}
			}, 'json');
		}, x.arr.groups[id].title);
	},
	addItem: function(id)
	{
		var x = this;

		x.mode = id || 0;

		var title = (x.mode ? vsprintf(x.lang['edit_item_title'], [x.arr.items[id].mail]) : x.lang['add_item_title']);
		var childs = '<div class="field input">\
			<div class="group">\
				<input id="lang" class="box" type="text" value="">\
				<label for="lang">' + x.lang['input_lang'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="mail" class="box" type="text" value="">\
				<label for="mail">' + x.lang['input_email'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="name" class="box" type="text" value="">\
				<label for="name">' + x.lang['input_name'] + '</label>\
			</div>\
		</div>';

		var html = drawing_form({
			title: title,
			childs: childs
		});
		x.el.forms.html(html);

		x.el.lists.addClass('edited');
		x.scrollbar_form = $('.scroll', x.el.forms).tinyscrollbar().data('plugin_tinyscrollbar');
		common.resize();
		x.reinit_scrollbars();

		x.el.forms.find('.head').on('click', '.close', function(){
			x.mode = false;
			x.el.lists.removeClass('edited');
			common.resize();
		}).on('click', '.saveclose', function(){
			x.save(true);
		}).on('click', '.save', function(){
			x.save();
		});
	},
	editItem: function(id)
	{
		var x = this;

		x.addItem(id);

		var arr = x.arr.items[id];

		$('#lang', x.el.forms).val(arr.lang);
		$('#mail', x.el.forms).val(arr.mail);
		$('#name', x.el.forms).val(arr.name);

		x.reinit_scrollbars();
	},
	save: function(close)
	{
		var x = this;

		loader.show();

		var data = {
			lang: $('#lang', x.el.forms).val().trim(),
			mail: $('#mail', x.el.forms).val().trim(),
			name: $('#name', x.el.forms).val().trim(),
			parent: x.parent
		};
		if (x.mode) data.id = x.mode;

		if (!data.mail) {
			alertify.error(x.lang['error_email']);
			loader.hide();
			$('#mail', x.el.forms).focus();
			return false;
		}

		var url = '?plugins/subscribes/page/' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json['status'] == 'OK') {
				if (x.mode) {
					$.extend(x.arr.items[x.mode], data);
					loader.hide();
				} else {
					x.mode = data.id = json.id;
					x.arr.items[x.mode] = data;
					x.arr.items[x.mode].parent = x.parent;
					x.arr.groups[x.parent].childs.items.push(x.mode);
					x.sorting();
				}

				if (close) {
					x.mode = false;
					x.el.lists.removeClass('edited');
					common.resize();
				}
				x.draw();
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	remove: function(elems)
	{
		var x = this;

		if (!elems.length) return false;

		var group = elems.filter('.item.group');
		var items = elems.filter('.item:not(.group)');
		var ids = {group: [], items: []};

		elems.addClass('removed');

		ids.items = items.map(function(){
			var id = +$(this).attr('id');
			if (x.arr.items[id]) return id;
		}).get();

		var child = function(parent){
			if (!x.arr.groups[parent]) return false;

			ids.group.push(parent);
			$.each(x.arr.groups[parent].childs.items, function(i, el){
				if (x.arr.items[el]) ids.items.push(el);
			});
			$.each(x.arr.groups[parent].childs.groups, function(i, el){
				child(el);
			});
		};
		group.each(function(){
			var id = +$(this).attr('id');
			child(id);
		});

		var counts = ids.group.length + ids.items.length;
		alertify.confirm(vsprintf(x.lang['remove_desc'], [counts]), function(e){
			if (e) {
				loader.show();

				var count = 0;
				var redraw = function(){
					if (++count === counts) {
						x.draw();
						x.sorting();
						//common.progress.hide();
					}
				};
				$.each(ids.items, function(i, el){
					var data = {id: el};
					$.post('?plugins/subscribes/page/delete', data, function(json){
						if (json['status'] == 'OK') {
							delete x.arr.items[el];
							redraw();
						} else {
							m.report('?plugins/subscribes/page/delete', data, JSON.stringify(json));
							loader.hide();
						}
					}, 'json');
				});
				$.each(ids.group, function(i, el){
					var data = {id: el};
					$.post('?plugins/subscribes/page/delete_group', data, function(json){
						if (json['status'] == 'OK') {
							delete x.arr.groups[el];
							redraw();
						} else {
							m.report('?plugins/subscribes/page/delete_group', data, JSON.stringify(json));
							loader.hide();
						}
					}, 'json');
				});
			} else {
				elems.removeClass('removed');
			}
		});
	},
	create_mail: function(ids, subject, message){
		var x = this;

		x.mode = 'mail';

		var childs = '<div class="field input">\
			<div class="group">\
				<input id="from_name" class="box" type="text" value="">\
				<label for="from_name">' + x.lang['create_mail_from_name'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="from_mail" class="box" type="text" value="">\
				<label for="from_mail">' + x.lang['create_mail_from_email'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="subject" class="box" type="text" value="">\
				<label for="subject">' + x.lang['create_mail_subject'] + '</label>\
			</div>\
		</div>\
		<div class="field date">\
			<label>' + x.lang['create_mail_date'] + '</label>\
			<div class="group"></div>\
		</div>\
		<div class="field input tinymce">\
			<label>' + x.lang['create_mail_message'] + '</label>\
			<div class="group"></div>\
		</div>\
		<div class="field input mails">\
			<label>' + x.lang['create_mail_mails_to'] + '</label>\
			<div class="group">\
				' + (function(){
					var html = '';

					var child = function(id){
						if (!x.arr.groups[id]) return false;

						$.each(x.arr.groups[id].childs.groups, function(i, el){
							if (el && x.arr.groups[el] && x.getCount(el)) {
								html += '<div class="g"><div class="title">' + x.arr.groups[el].title + '</div><div class="clr"></div>';
								child(el);
								html += '<div class="clr"></div></div>';
							}
						});
						$.each(x.arr.groups[id].childs.items, function(i, el){
							if (el && x.arr.items[el]) {
								var active = $.inArray(el, ids) >= 0 ? ' active' : '';
								html += '<div class="cell' + active + '" data="' + el + '">' + x.arr.items[el].mail + '</div>';
							}
						});
					};
					child('#');

					return html;
				})() + '\
				<div class="clr"></div>\
			</div>\
		</div>';

		var html = drawing_form({
			title: x.lang['create_mail'],
			childs: childs,
			head_replace: '<div class="send">' + x.lang['global_send'] + '</div><div class="close">' + x.lang['global_close'] + '</div>'
		});
		x.el.forms.html(html);

		if (subject) $('#subject', x.el.forms).val(subject);
		fields.types.date.item_add($('.field.date .group', x.el.forms));
		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.forms), message || '');

		x.el.lists.addClass('edited');
		x.scrollbar_form = $('.scroll', x.el.forms).tinyscrollbar().data('plugin_tinyscrollbar');
		common.resize();
		x.reinit_scrollbars();

		x.el.forms.find('.mails').on('click', '.cell', function(){
			$(this).toggleClass('active');
		}).on('click', '.g .title', function(){
			var th = $(this).toggleClass('active');

			if (th.hasClass('active')) {
				$(this).nextAll('.cell').addClass('active');
			} else {
				$(this).nextAll('.cell').removeClass('active');
			}
		});

		x.el.forms.find('.head').on('click', '.close', function(){
			x.mode = false;
			x.el.lists.removeClass('edited');
			common.resize();
		}).on('click', '.send', function(){
			x.send_mail();
		});
	},
	send_mail: function(){
		var x = this;

		var from_name = $('#from_name', x.el.forms).val().trim();
		var from_mail = $('#from_mail', x.el.forms).val().trim();
		var subject = $('#subject', x.el.forms).val().trim();
		var date = fields.types.date.item_save($('.field.date .group', x.el.forms));
		var message = fields.types.tinymce.item_save($('.field.tinymce .group', x.el.forms));//.replace(/"|&quot;/g, '~^~')
		var to = $('.cell.active', x.el.forms).map(function(){
			var th = $(this);
			var id = +th.attr('data');
			if (id && x.arr.items[id] && /.+@.+\..+/i.test(x.arr.items[id].mail)) {
				return {email: x.arr.items[id].mail, name: x.arr.items[id].name, type: 'to'};
			}
		}).get();

		var data = {
			from_name: from_name,
			from_mail: from_mail,
			to: to,
			date: date,
			subject: subject,
			message: message,
		};

		if (!data.from_name) {
			alertify.error(x.lang['create_mail_from_name_error']);
			loader.hide();
			$('#from_name', x.el.forms).focus();
			return false;
		}
		if (!/.+@.+\..+/i.test(data.from_mail)) {
			alertify.error(x.lang['create_mail_from_email_error']);
			loader.hide();
			$('#from_mail', x.el.forms).focus();
			return false;
		}
		if (!data.to.length) {
			alertify.error(x.lang['create_mail_mails_to_error']);
			loader.hide();
			return false;
		}
		if (!data.subject) {
			alertify.error(x.lang['create_mail_subject_error']);
			loader.hide();
			$('#subject', x.el.forms).focus();
			return false;
		}
		if (!data.message) {
			alertify.error(x.lang['create_mail_message_error']);
			loader.hide();
			return false;
		}

		loader.show();

		$.post('?plugins/subscribes/page/mail', data, function(json){
			if (json.status == 'OK') {
				if (json.fail > 0) {
					alertify.error(x.lang['send_mail_fail']);
				} else {
					alertify.success(x.lang['send_mail_ok']);
				}
				loader.hide();
				x.mode = false;
				x.el.lists.removeClass('edited');
				common.resize();
			} else {
				m.report('?plugins/subscribes/page/mail', data, JSON.stringify(json));
			}
		}, 'json');
	},
	sorting: function()
	{
		var x = this;

		var sort_sg = [];
		var sort_s = [];

		var child_sg = function(parent){
			if (!x.arr.groups[parent]) return false;

			$.each(x.arr.groups[parent].childs.groups, function(i, el){
				if (el && x.arr.groups[el]) {
					sort_sg.push({id: el, parent: parent});
					child_sg(el);
				}
			});
		};
		var child_s = function(parent){
			if (!x.arr.groups[parent]) return false;

			$.each(x.arr.groups[parent].childs.items, function(i, el){
				if (el && x.arr.items[el]) sort_s.push({id: el, parent: parent});
			});
			$.each(x.arr.groups[parent].childs.groups, function(i, el){
				if (el && x.arr.groups[el]) child_s(el);
			});
		};

		child_sg('#');
		child_s('#');

		sorting.set('subscribes_groups', sort_sg);
		sorting.set('subscribes', sort_s);
	},
	getCount: function(id)
	{
		var x = this;

		var childs = 0;

		var child = function(id){
			if (!x.arr.groups[id]) return false;
			$.each(x.arr.groups[id].childs.items, function(i, el){
				if (el && x.arr.items[el]) {
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

		return (childs ? childs + ' ' + (childs == 1 ? x.lang['count_item'] : x.lang['count_items']) : '');
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		x.reinit_scrollbars(0);
	},
	reinit_scrollbars: function(time){
		var x = this;

		setTimeout(function(){
			if (x.scrollbar_form) x.scrollbar_form.update('relative');
			$.each(x.scrollbar_lists, function(i, el){
				el.update('relative');
			});
		}, time || 210);
	},
	resize: function()
	{
		var x = this;

		var w = ww - 80;
		var elems = $('.items', x.el.lists);

		var width_forms = x.mode === false ? 0 : w - 240 * Math.min(2, elems.length);
		x.el.forms.css({width: width_forms});

		var width = x.mode === false ? Math.max(Math.min(Math.floor(w / elems.length), w / 2), 300) : 240;
		var left = Math.min((x.mode === false ? -width * (elems.length - Math.floor(w / width)) : -width * Math.max(Math.max(elems.length, 2) - 2, 0)), 0);
		x.el.lists.css({width: width * elems.length, marginLeft: left});
		elems.css({width: x.width = width - 1});
	}
};