/*
	User permissions:
	0 - Site user without login
	1 - Site user with login
	2 - ?
	3 - Access to all data
	4 - Administrator
*/

var users = {
	arr: {groups: {}, users: {}},
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

		x.template = {
			a_groups: $('.overview', x.el.list).eq(0).html(),
			a_users: $('.overview', x.el.list).eq(1).html(),
			s_groups: $('.overview', x.el.list).eq(2).html(),
			s_users: $('.overview', x.el.list).eq(3).html(),
			form: x.el.form.html()
		};
		$('.overview', x.el.list).empty();
		x.el.form.empty();

		x.scrollbar_list = $('.scroll', x.el.list).map(function(el, i){
			return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
		}).get();

		x.handlers();
		x.load(function(){
			callback();
		});
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
			x.parent = $(this).parents('.items').attr('parent');
			if (x.parent === 'a_groups' || x.parent === 's_groups') x.groups_add();
			if (x.parent === 'a_users' || x.parent === 's_users') x.users_add();
		}).on('click', '.g .remove', function(){
			var th = $(this).parent();

			x.groups_remove(th);

			return false;
		}).on('click', '.g:not(.n)', function(){
			var id = +$(this).attr('data');

			x.groups_edit(id);
		}).on('click', '.i .remove', function(){
			var th = $(this).parent();

			x.users_remove(th);

			return false;
		}).on('click', '.i:not(.ne)', function(){
			var id = +$(this).attr('data');

			x.users_edit(id);
		});

		x.el.form.on('click', '.header .close', function(){
			x.users_close()
		}).on('click', '.header .saveclose', function(){
			x.users_save(true);
		}).on('click', '.header .save', function(){
			x.users_save();
		}).on('click', '.field.checkbox .group p', function(){
			$(this).toggleClass('active');
		});
	},
	sortable: function()
	{
		var x = this;

		$('.overview', x.el.list).sortable({
			helper: 'clone',
			items: '.i',
			axis: 'y',
			update: function(e, ui){
				x.set_sorting('users');
			}
		});
		$('.overview', x.el.list).sortable({
			helper: 'clone',
			items: '.g',
			axis: 'y',
			update: function(e, ui){
				x.set_sorting('groups');
			}
		});
	},
	load: function(cb)
	{
		var x = this;

		$.get('?members/get_list', function(json){
			x.arr = {
				groups: $.isArray(json.groups) ? {} : json.groups,
				users: $.isArray(json.users) ? {} : json.users
			}
			x.sort = {
				groups: json.g_sorting ? json.g_sorting.split(',') : [],
				users: json.u_sorting ? json.u_sorting.split(',') : []
			}
			x.logged = json.logged;
			x.access = x.arr.users[x.logged].access;

			$.each(x.arr.users, function(i, el){
				var k = $.inArray(i, x.sort.users) + 1;
				if (!k) x.sort.users.push(i);
			});
			$.each(x.arr.groups, function(i, el){
				var k = $.inArray(i, x.sort.groups) + 1;
				if (!k) x.sort.groups.push(i);
			});

			x.draw();

			cb();
		}, 'json');
	},
	draw: function()
	{
		var x = this;

		var a_u = [];
		var s_u = [];
		var a_g = [];
		var s_g = [];

		$.each(x.sort.users, function(i, id){
			if (id && x.arr.users[id]) {
				var html = m.template(x.template[x.arr.users[id].access === 1 ? 's_users' : 'a_users'], {
					id: id,
					title: x.arr.users[id].fname + ' ' + x.arr.users[id].lname,
					ne: x.logged !== 1 && x.logged != id ? 'ne' : '',
					nd: x.logged == id || x.logged !== 1 ? 'nd' : '',
					logged: x.logged == id ? 'logged' : ''
				});
				(x.arr.users[id].access === 1 ? s_u : a_u).push(html);
			}
		});
		$.each(x.sort.groups, function(i, id){
			if (id && x.arr.groups[id]) {
				var html = m.template(x.template[x.arr.groups[id].type === 1 ? 'a_groups' : 's_groups'], {
					id: id,
					title: x.arr.groups[id].title,
					n: x.logged !== 1 ? 'n' : ''
				});
				(x.arr.groups[id].type === 1 ? a_g : s_g).push(html);
			}
		});

		$('.overview', x.el.list).eq(0).html(a_g.join('') || '<div class="empty br3">' + lang['global_empty'] + '</div>');
		$('.overview', x.el.list).eq(1).html(a_u.join('') || '<div class="empty br3">' + lang['global_empty'] + '</div>');
		$('.overview', x.el.list).eq(2).html(s_g.join('') || '<div class="empty br3">' + lang['global_empty'] + '</div>');
		$('.overview', x.el.list).eq(3).html(s_u.join('') || '<div class="empty br3">' + lang['global_empty'] + '</div>');

		if (x.logged === 1) x.sortable();
		common.resize();
	},
	groups_add: function()
	{
		var x = this;

		var title = x.parent === 'a_groups' ? lang['users_f_g_title_a'] : lang['users_f_g_title_s']

		alertify.prompt(title, function(e, str){
			if (!e) return false;

			x.el.overlay.addClass('show');

			var data = {title: str, type: +!(users.parent === 'a_groups')+1};
			$.post('?members/groups_add', data, function(json){
				if (json.status) {
					var id = json.id;
					x.arr.groups[id] = $.extend({id: id}, data);

					x.sort.groups.push(id);
					x.draw();
					x.set_sorting('groups');

					x.el.overlay.removeClass('show');
				}
			}, 'json');
		}, lang['users_f_g_default']);
	},
	groups_edit: function(id)
	{
		var x = this;

		alertify.prompt(lang['users_f_g_title_edit'], function(e, str){
			if (!e) return false;

			x.el.overlay.addClass('show');

			var data = {id: id, title: str};
			$.post('?members/groups_edit', data, function(json){
				if (json.status) {
					x.arr.groups[id].title = str;

					x.draw();

					x.el.overlay.removeClass('show');
				}
			}, 'json');
		}, x.arr.groups[id].title);
	},
	groups_remove: function(el)
	{
		var x = this;

		var id = el.addClass('removed').attr('data');

		alertify.confirm(lang['users_f_g_title_remove'], function(e){
			if (e) {
				x.el.overlay.addClass('show');

				$.post('?members/groups_remove', {id: id}, function(json){
					if (json.status) {
						delete x.arr.groups[id];
						el.remove();

						x.set_sorting('groups');
						x.draw();

						x.el.overlay.removeClass('show');
					}
				}, 'json');
			} else {
				el.removeClass('removed');
			}
		});
	},
	users_add: function()
	{
		var x = this;

		x.mode = 0;

		var html = m.template(x.template.form, {
			title: x.parent === 'a_users' ? lang['users_create_user_a'] : lang['users_create_user_s'],
			groups: $.map(x.sort.groups, function(id){
				if (id && x.arr.groups[id] && x.arr.groups[id].type === (x.parent === 'a_users' ? 1 : 2))
					return '<p data="' + id + '" class="br3 animate1">' + x.arr.groups[id].title + '</p>';
			}).join('')
		});

		x.el.form.html(html);

		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.form), '', null, 'users');
		fields.types.file.item_add($('.field.file .group', x.el.form), '', null, 'users');

		x.el.overlay.addClass('show');
		x.el.form.addClass('show');
	},
	users_edit: function(id)
	{
		var x = this;

		x.mode = id;

		var arr = x.arr.users[id];

		var html = m.template(x.template.form, {
			title: vsprintf(lang['users_edit_user'], [x.arr.users[id].fname]),
			groups: $.map(x.sort.groups, function(id){
				if (id && x.arr.groups[id] && x.arr.groups[id].type === (x.parent === 'a_users' ? 1 : 2)) {
					var g = arr.groups ? arr.groups.split(',') : [];
					var k = $.inArray(id, g) + 1;
					return '<p data="' + id + '" class="br3 animate1 ' + (k ? 'active' : '') + '">' + x.arr.groups[id].title + '</p>';
				}
			}).join('')
		});

		x.el.form.html(html);

		$('#lostbsrg', x.el.form).val(arr.login);
		$('#pauwtert', x.el.form).attr('placeholder', lang['users_input_password_placeholder']);
		$('#fname', x.el.form).val(arr.fname);
		$('#lname', x.el.form).val(arr.lname);
		$('#email', x.el.form).val(arr.email);
		$('#phone', x.el.form).val(arr.phone);
		$('#address_1', x.el.form).val(arr.address_1);
		$('#address_2', x.el.form).val(arr.address_2);
		$('#company', x.el.form).val(arr.company);

		fields.types.tinymce.item_add($('.field.tinymce .group', x.el.form), arr.desc, null, 'users');
		fields.types.file.item_add($('.field.file .group', x.el.form), arr.image, null, 'users');

		x.el.overlay.addClass('show');
		x.el.form.addClass('show');
	},
	users_save: function(close)
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
			access: x.mode === 1 ? 4 : x.logged === x.mode ? x.access : x.parent === 'a_users' ? 3 : 1,
			groups: $('.field.checkbox .group p.active', x.el.form).map(function(){return $(this).attr('data')}).get().join(',')
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
					$.extend(x.arr.users[x.mode], data);
					x.draw();
				} else {
					x.mode = data.id = json.id;
					x.arr.users[x.mode] = data;
					x.sort.users.push(x.mode);
					x.draw();
					x.set_sorting('users');
				}
				loader.hide();

				if (close) x.users_close();
			} else {
				m.report(url, data, JSON.stringify(json));
				loader.hide();
			}
		}, 'json');
	},
	users_close: function()
	{
		var x = this;

		x.mode = false;

		x.el.overlay.removeClass('show');
		x.el.form.removeClass('show');
	},
	users_remove: function(el)
	{
		var x = this;

		var id = el.addClass('removed').attr('data');

		alertify.confirm(lang['users_remove_desc'], function(e){
			if (e) {
				x.el.overlay.addClass('show');

				$.post('?members/remove', {id: id}, function(json){
					if (json.status) {
						delete x.arr.users[id];
						el.remove();

						x.set_sorting('users');
						x.draw();
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
	set_sorting: function(s)
	{
		var x = this;

		x.sort[s] = $('.' + (s === 'users' ? 'i' : 'g'), x.el.list).map(function(){
			return +$(this).attr('data');
		}).get();

		$.post('?members/set_sort', {sort: x.sort[s].join(','), s: s}, function(json){}, 'json');
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