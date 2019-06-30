/*
	User permissions:
	3 - Access to all data
	4 - Administrator
*/

var users = {
	arr: {},
	mode: false, // false - form not open, 0 - add, id - edit
	el: {
		parent: $('#users')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);
		x.el.overlay = $('.overlay', x.el.parent);
		x.el.form = $('.form', x.el.parent);

		x.template = {};
		x.template.item = $('.overview', x.el.list).html();
		$('.overview', x.el.list).empty().text('{{item}}');
		x.template.list = x.el.list.html();
		x.el.list.empty();
		x.template.form = x.el.form.html();
		x.el.form.empty();

		x.handlers();

		$.get('?members/get', function(json){
			x.arr = $.isArray(json.members) ? {} : json.members;
			x.sort = json.sorting ? json.sorting.split(',') : [];

			$.each(x.arr, function(i, el){
				var k = $.inArray(i, x.sort) + 1;
				if (!k) x.sort.push(i);
			});

			x.logged = json.logged;
			x.access = x.arr[x.logged].access;

			x.draw();

			callback();
		}, 'json');
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
	},
	handlers: function()
	{
		var x = this;

		x.el.list.on('click', '.header .create', function(){
			x.add();
		}).on('click', '.item .remove', function(){
			var th = $(this).parent();

			x.remove(th);

			return false;
		}).on('click', '.item:not(.ne)', function(){
			var id = +$(this).attr('data');

			x.edit(id);
		});

		x.el.form.on('click', '.header .close', function(){
			x.close()
		}).on('click', '.header .saveclose', function(){
			x.save(true);
		}).on('click', '.header .save', function(){
			x.save();
		}).on('click', '.field.select p', function(){
			$(this).addClass('active').siblings().removeClass('active');
		});
	},
	sortable: function()
	{
		var x = this;

		$('.overview', x.el.list).sortable({
			helper: 'clone',
			items: '.item',
			axis: 'y',
			update: function(e, ui){
				var parent = ui.item.parents('.items');

				x.sort = $('.item', parent).map(function(){
					return $(this).attr('id');
				}).get();

				x.set_sorting();
			}
		});
	},
	draw: function()
	{
		var x = this;

		var child = $.map(x.sort, function(id){
			if (id && x.arr[id]) {
				return m.template(x.template.item, {
					id: id,
					title: x.arr[id].fname + ' ' + x.arr[id].lname,
					ne: x.logged !== 1 && x.logged != id ? 'ne' : '',
					nd: x.logged == id || x.logged !== 1 ? 'nd' : '',
					logged: x.logged == id ? 'logged' : ''
				});
			}
		}).join('');
		var html = m.template(x.template.list, {
			create: x.logged === 1 ? '' : 'hide',
			item: child
		});

		x.el.list.html(html);

		x.scrollbar_list = $('.scroll', x.el.list).map(function(el, i){
			return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
		}).get();
		if (x.logged === 1) x.sortable();

		common.resize();
	},
	add: function()
	{
		var x = this;

		x.mode = 0;

		var html = m.template(x.template.form, {
			title: lang['users_create_user'],
			access: ''
		});

		x.el.form.html(html);

		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.form), '', null, 'users');
		fields.types.file.item_add($('.field.file .group', x.el.form), '', null, 'users');

		x.el.overlay.addClass('show');
		x.el.form.addClass('show');
	},
	edit: function(id)
	{
		var x = this;

		x.mode = id;

		var html = m.template(x.template.form, {
			title: vsprintf(lang['users_edit_user'], [x.arr[id].fname]),
			access: x.mode === 1 || x.logged === id ? 'hide' : ''
		});

		x.el.form.html(html);

		var arr = x.arr[id];

		$('#lostbsrg', x.el.form).val(arr.login);
		$('#pauwtert', x.el.form).attr('placeholder', lang['users_input_password_placeholder']);
		$('#fname', x.el.form).val(arr.fname);
		$('#lname', x.el.form).val(arr.lname);
		$('#email', x.el.form).val(arr.email);
		$('#phone', x.el.form).val(arr.phone);
		$('#address_1', x.el.form).val(arr.address_1);
		$('#address_2', x.el.form).val(arr.address_2);
		$('#company', x.el.form).val(arr.company);
		$('.field.select p[data="' + arr.access + '"]', x.el.form).addClass('active').siblings().removeClass('active');

		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.form), arr.desc, null, 'users');
		fields.types.file.item_add($('.field.file .group', x.el.form), arr.image, null, 'users');

		x.el.overlay.addClass('show');
		x.el.form.addClass('show');
	},
	save: function(close)
	{
		var x = this;

		loader.show();

		var data = {
			id: x.mode,
			login: $('#lostbsrg', x.el.form).val().trim(),
			password: $('#pauwtert', x.el.form).val().trim(),
			fname: $('#fname', x.el.form).val().trim(),
			lname: $('#lname', x.el.form).val().trim(),
			email: $('#email', x.el.form).val().trim(),
			phone: $('#phone', x.el.form).val().trim(),
			address_1: $('#address_1', x.el.form).val().trim(),
			address_2: $('#address_2', x.el.form).val().trim(),
			company: $('#company', x.el.form).val().trim(),
			desc: fields.types.tinymce.item_save($('.field.tinymce .group', x.el.form)),
			image: fields.types.file.item_save($('.field.file .group', x.el.form)),
			access: x.mode === 1 ? 4 : x.logged === x.mode ? x.access : $('.field.select p.active', x.el.form).attr('data')
		};

		if (!data.login) {
			alertify.error(lang['users_error_login']);
			loader.hide();
			$('#lostbsrg', x.el.form).focus();
			return false;
		}
		if (!data.password && !x.mode) {
			alertify.error(lang['users_error_password']);
			loader.hide();
			$('#pauwtert', x.el.form).focus();
			return false;
		}
		if (!data.fname) {
			alertify.error(lang['users_error_fname']);
			loader.hide();
			$('#fname', x.el.form).focus();
			return false;
		}

		var url = '?members/' + (x.mode ? 'edit' : 'add');
		$.post(url, data, function(json){
			if (json.status) {
				if (x.mode) {
					$.extend(x.arr[x.mode], data);
				} else {
					x.mode = data.id = json.id;
					x.arr[x.mode] = data;
					x.sort.push(x.mode);
					x.set_sorting();
				}
				loader.hide();

				if (close) x.close()
				x.draw();
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	close: function()
	{
		var x = this;

		x.mode = false;

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');
	},
	remove: function(el)
	{
		var x = this;

		var id = el.addClass('removed').attr('data');

		alertify.confirm(lang['users_remove_desc'], function(e){
			if (e) {
				x.el.overlay.addClass('show');

				$.post('?members/remove', {id: id}, function(json){
					if (json.status) {
						delete x.arr[id];
						var k = $.inArray(id, x.sort);
						if (k > -1) x.sort.splice(k, 1);

						x.draw();
						x.set_sorting();
					} else {
						m.report('members/remove', {id: id}, JSON.stringify(json));
					}
					x.el.overlay.removeClass('show');
				}, 'json');
			} else {
				el.removeClass('removed');
			}
		});
	},
	set_sorting: function()
	{
		var x = this;

		$.post('?members/set_sort', {sort: x.sort.join(',')}, function(json){}, 'json');
	},
	reinit_scrollbars: function()
	{
		var x = this;

		setTimeout(function(){
			$.each(x.scrollbar_list, function(i, el){
				el.update('relative');
			});
		}, 210);
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		common.resize();
	},
	resize: function()
	{
		var x = this;

		x.reinit_scrollbars();
	}
};

common.queue.push(users);