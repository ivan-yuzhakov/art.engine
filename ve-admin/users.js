/*
	User permissions:
	3 - Access to all data
	4 - Administrator
*/

var users = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	el: {
		parent: $('<div id="users" class="content" />'),
		lists: $('<div class="lists animate" />'),
		forms: $('<div class="forms animate" />')
	},
	init: function(callback)
	{
		var x = this;

		$.getJSON('?members/get', function(json){
			x.arr = $.isArray(json.members) ? {} : json.members;
			x.arr['#'] = {childs: []};

			$.each(sorting.arr['users'], function(i, el){
				if (el && x.arr[el.id] && x.arr[el.parent]) {
					x.arr[el.id].parent = el.parent;
					x.arr[el.parent].childs.push(+el.id);
				}
			});
			$.each(x.arr, function(i, el){
				if (i != '#' && !el.parent) {
					x.arr[i].parent = '#';
					x.arr['#'].childs.push(i);
				}
			});

			x.logged = json.logged;
			x.access = x.arr[x.logged].access;

			callback();
		});
	},
	start: function()
	{
		var x = this;
		if (x.started) {x.reset(); return false;}
		x.started = true;

		x.el.parent.append(x.el.lists, x.el.forms).appendTo(content);
		x.draw();

		x.handlers();
		common.resize();
	},
	handlers: function()
	{
		var x = this;

		var select = function(){
			$('.items', x.el.lists).each(function(){
				var th = $(this);
				var selected = $('.item.selected', th);
				var add = $('.head', th).find('.add');
				if (selected.length) {
					add.addClass('remove');
				} else {
					add.removeClass('remove');
				}
			});
		};

		x.el.lists.on('click', '.add', function(){
			var th = $(this);
			var parent = th.parents('.items');
			x.parent = parent.attr('parent');

			if (th.hasClass('remove')) {
				var selected = $('.item.selected', parent);
				x.remove(selected);
			} else {
				$('.item.selected', x.el.lists).removeClass('selected');
				select();
				x.add();
			}
		}).on('click', '.select', function(){
			var th = $(this).parent();
			th.toggleClass('selected');
			select();
		}).on('click', '.edit', function(){
			var th = $(this);
			var id = +th.parent().attr('id');

			$('.item.selected', x.el.lists).removeClass('selected');
			select();
			x.parent = th.parents('.items').attr('parent');
			x.edit(id);
		});

		x.reset();
	},
	sortable: function()
	{
		var x = this;

		var sort = function(ids){
			x.arr['#'].childs = ids;
			$.each(ids, function(i, id){
				x.arr[id].parent = '#';
			});

			x.sorting();
		};

		$('.overview', x.el.lists).sortable({
			appendTo: x.el.lists,
			helper: 'clone',
			items: '.item',
			update: function(e, ui){
				var parent = ui.item.parents('.items');

				var id_items = $('.item', parent).map(function(){
					return +$(this).attr('id');
				}).get();

				sort(id_items);
			}
		});
	},
	draw: function()
	{
		var x = this;

		var child = $.map(x.arr['#'].childs, function(id){
			if (id && x.arr[id]) {
				return '<div id="' + id + '" class="item">\
					' + (x.logged == 1 && id != 1 ? '<p class="select">' + icons.select_empty + icons.select_checked + '</p>' : '') + '\
					' + (x.logged == 1 || id == x.logged ? '<p class="edit">' + icons.edit + '</p>' : '') + '\
					<p class="title' + (x.logged == 1 && id != 1 ? '' : ' padding') + '">' + x.arr[id].name + '</p>\
				</div>';
			}
		}).join('');

		var html = drawing({
			attr_width: x.width,
			title_before: x.access < 4 ? '' : '<div class="actions fright"><div class="animate add">' + icons.add + '</div></div>',
			title: lang['users'],
			childs: child
		});
		x.el.lists.html(html);

		x.scrollbar_lists = $('.scroll', x.el.lists).map(function(el, i){
			return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
		}).get();
		x.sortable();

		common.resize();
		x.reinit_scrollbars(0);
	},
	add: function(id)
	{
		var x = this;

		x.mode = 0;

		var title = (id ? vsprintf(lang['users_edit_user'], [x.arr[id].name]) : lang['users_create_user']);
		var childs = '<div class="field input">\
			<div class="group">\
				<input id="f_login" class="box" type="text" value="">\
				<label for="f_login">' + lang['users_input_login'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="f_password" class="box" type="password" value="">\
				<label for="f_password">' + lang['users_input_password'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="name" class="box" type="text" value="">\
				<label for="name">' + lang['users_input_name'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="mail" class="box" type="text" value="">\
				<label for="mail">' + lang['users_input_email'] + '</label>\
			</div>\
		</div>\
		<div class="field input">\
			<div class="group">\
				<input id="phone" class="box" type="text" value="">\
				<label for="phone">' + lang['users_input_phone'] + '</label>\
			</div>\
		</div>\
		<div class="field input tinymce">\
			<label>' + lang['users_input_desc'] + '</label>\
			<div class="group"></div>\
		</div>\
		<div class="field file">\
			<label>' + lang['users_input_image'] + '</label>\
			<div class="group"></div>\
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

		if (!id) {
			fields.types.tinymce.item_add($('.field.tinymce .group', x.el.forms), '', 'users');
			fields.types.file.item_add($('.field.file .group', x.el.forms), '', 'users');
		}
	},
	edit: function(id)
	{
		var x = this;

		x.add(id);
		x.mode = id;

		var arr = x.arr[id];

		$('#f_login', x.el.forms).val(arr.login);
		$('#f_password', x.el.forms).attr('placeholder', lang['users_input_password_placeholder']);
		$('#name', x.el.forms).val(arr.name);
		$('#mail', x.el.forms).val(arr.mail);
		$('#phone', x.el.forms).val(arr.phone);

		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.forms), arr.desc, 'users');
		fields.types.file.item_add($('.field.file .group', x.el.forms), arr.image, 'users');
	},
	save: function(close)
	{
		var x = this;

		loader.show();

		var data = {
			id: x.mode,
			login: $('#f_login', x.el.forms).val().trim(),
			password: $('#f_password', x.el.forms).val().trim(),
			name: $('#name', x.el.forms).val().trim(),
			mail: $('#mail', x.el.forms).val().trim(),
			phone: $('#phone', x.el.forms).val().trim(),
			desc: fields.types.tinymce.item_save($('.field.tinymce .group', x.el.forms)),
			image: fields.types.file.item_save($('.field.file .group', x.el.forms)),
			access: x.mode == 1 ? 4 : 3,
			parent: '#'
		};

		if (!data.login) {
			alertify.error(lang['users_error_login']);
			loader.hide();
			$('#f_login', x.el.forms).focus();
			return false;
		}
		if (!data.password && !x.mode) {
			alertify.error(lang['users_error_password']);
			loader.hide();
			$('#f_password', x.el.forms).focus();
			return false;
		}
		if (!data.name) {
			alertify.error(lang['users_error_name']);
			loader.hide();
			$('#name', x.el.forms).focus();
			return false;
		}

		var url = '?members/' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json['status'] == 'OK') {
				if (x.mode) {
					$.extend(x.arr[x.mode], data);
					loader.hide();
				} else {
					x.mode = data.id = json.id;
					x.arr[x.mode] = data;
					x.arr['#'].childs.push(x.mode);
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

		var ids = elems.addClass('removed').map(function(){
			return +$(this).attr('id');
		}).get();

		alertify.confirm(vsprintf(lang['users_remove_desc'], [ids.length]), function(e){
			if (e) {
				loader.show();

				var count = 0, length = ids.length;
				$.each(ids, function(i, el){
					var data = {id: el};
					$.post('?members/delete', data, function(json){
						if (json['status'] == 'OK') {
							delete x.arr[el];

							if (++count == length) {
								x.draw();
								x.sorting();
							}
						} else {
							m.report('members/delete', data, JSON.stringify(json));
							loader.hide();
						}
					}, 'json');
				});
			} else {
				elems.removeClass('removed');
			}
		});
	},
	sorting: function()
	{
		var x = this;

		var sort_users = $.map(x.arr['#'].childs, function(el){
			if (el && x.arr[el]) return {id: el, parent: '#'};
		});

		sorting.set('users', sort_users);
	},
	reinit_scrollbars: function(time)
	{
		var x = this;

		setTimeout(function(){
			if (x.scrollbar_form) x.scrollbar_form.update('relative');
			$.each(x.scrollbar_lists, function(i, el){
				el.update('relative');
			});
		}, time || 210);
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		x.reinit_scrollbars(0);
	},
	resize: function()
	{
		var x = this;

		var w = ww - 80;
		var elems = $('.items', x.el.lists);
		var length = elems.length;

		if (x.mode === false) {
			x.el.forms.css({width: 0});
			var width = Math.max(Math.min(Math.floor(w / length), 500), 300);
			var left = Math.min(-width * (length - Math.floor(w / width)), 0);
		} else {
			x.el.forms.css({width: w - 240 * Math.min(2, length)});
			var width = 240;
			var left = Math.min(-width * Math.max(Math.max(length, 2) - 2, 0), 0);
		}

		x.el.lists.css({width: width * length, marginLeft: left});
		elems.css({width: x.width = width - 1});

		x.reinit_scrollbars();
	}
};

common.queue.push(users);