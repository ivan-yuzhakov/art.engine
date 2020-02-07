var support = {
	// mode: false,
	// plugins_loaded: {},
	el: {
		parent: $('#support')
	},
	init: function(callback)
	{
		var x = this;

		x.el.sections = $('.sections', x.el.parent);
		x.el.help = $('.help', x.el.sections);
		x.el.faq = $('.faq', x.el.sections);
		x.el.modal = $('.modal', x.el.parent);

		x.template = {
			help: '<div class="i br3 {{active}}" data="{{id}}">{{title}}</div>',
			faq: '<div class="i br3"><p class="q">{{q}}</p><p class="a">{{a}}</p></div>',
			modal: x.el.modal.html()
		};
		x.el.modal.empty();

		x.handlers();
		x.help.load();
		x.load_faq();

		callback();
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		x.timer = setInterval(function(){
			if (hash[0] === 'support') {
				$('.overlay', x.el.help).removeClass('hide');
				x.help.load();
			} else {
				clearInterval(x.timer); x.timer = null;
			}
		}, 10000);
	},
	handlers: function()
	{
		var x = this;

		x.el.help.on('click', '.add', function(){
			x.help.create_open();
		}).on('click', '.i', function(){
			var th = $(this).removeClass('active');
			var id = th.attr('data');

			x.help.open_ticket(id);
		});

		x.el.faq.on('click', '.i', function(){
			$('.a', this).toggle();
		});

		x.el.modal.on('click', '.create_ticket', function(){
			x.help.create_save();
		}).on('click', '.close', function(){
			x.el.modal.removeClass('show open');

			clearInterval(x.help.timer_open); x.help.timer_open = null;
		}).on('keyup', '.bottom input', function(e){
			if (e.keyCode === 13) x.help.send_message();
		});
	},
	help:
	{
		arr: {},
		load: function(){
			var x = this;

			$.get('?support/help_get_list', function(json){
				var html = $.map(json, function(el){
					x.arr[el[0]] = el[1];

					return m.template(support.template.help, {
						id: el[0],
						title: el[1],
						active: el[2] ? 'active' : ''
					});
				}).join('');
				html = html || '<div class="empty br3">' + lang['global_empty'] + '</div>';

				$('.content', support.el.help).html(html);
				$('.overlay', support.el.help).addClass('hide');
			}, 'json');
		},
		create_open: function(){
			var template = m.template(support.template.modal, {
				popup_style: 'width:50%;',
				title: lang['support_help_add'],
				actions: '<div class="br3 create_ticket">' + lang['global_create'] + '</div><div class="br3 close">' + lang['global_close'] + '</div>',
				content: '<div class="container">\
					<div class="field text">\
						<div class="head"><p>' + lang['support_help_ticket_name'] + '</p></div>\
						<div class="group">\
							<input id="ticket_name" class="br3 box animate1" type="text" value="">\
						</div>\
					</div>\
				</div>\
				<div class="container">\
					<div class="field textarea">\
						<div class="head"><p>' + lang['support_help_ticket_desc'] + '</p></div>\
						<div class="group">\
							<textarea id="ticket_desc" class="br3 box animate1" rows="5"></textarea>\
						</div>\
					</div>\
				</div>',
				bottom: ''
			});

			support.el.modal.html(template).addClass('show open').find('#ticket_name').focus();
		},
		create_save: function(){
			var x = this;

			var el = {
				name: $('#ticket_name'),
				desc: $('#ticket_desc')
			};
			var val = {
				name: el.name.val().trim(),
				desc: el.desc.val().trim(),
				host: location.origin
			};
			var valid = true;

			if (val.name) {
				el.name.parent().removeClass('error');
			} else {
				el.name.parent().addClass('error');
				valid = false;
			}
			if (val.desc) {
				el.desc.parent().removeClass('error');
			} else {
				el.desc.parent().addClass('error');
				valid = false;
			}

			if (valid) {
				support.el.modal.removeClass('open');

				$.post('?support/help_create_ticket', val, function(json){
					if (json.status) {
						x.arr[json.id] = val.name;

						$('.overlay', support.el.help).removeClass('hide');

						x.load();
						x.open_ticket(json.id);
					}
				}, 'json');
			}
		},
		open_ticket: function(id){
			var x = this;

			x.ticket = id;
			support.el.modal.addClass('show');

			$.post('?support/help_open_ticket', {id: id}, function(json){
				if (json.status) {
					var nm = false;
					var template = m.template(support.template.modal, {
						popup_style: 'width:50%;padding-bottom:80px;',
						title: x.arr[id],
						actions: '<div class="br3 close">' + lang['global_close'] + '</div>',
						content: $.map(json.items, function(el){
							var readed = '';
							if (!nm) {
								if (el.readed === 0) {
									readed = '<div class="new_message">' + lang['support_help_new_message'] + '</div>';
									nm = true;
								}
							}

							return readed + '<div class="i">\
								<div class="info">' + el.user + ', ' + moment(el.date*1000).format('MM/DD/Y H:mm') + '</div>\
								<div class="desc">' + el.desc + '</div>\
							</div>';
						}).join(''),
						bottom: '<div class="bottom">\
							<input class="br3 box animate1" type="text">\
							<div class="submit br3">' + lang['support_help_submit'] + '</div>\
						</div>'
					});

					support.el.modal.html(template).addClass('open');

					var new_message = $('.new_message', support.el.modal);
					var scroll = new_message.length ? new_message.position().top - 11 : 9999999;
					$('.wrapper', support.el.modal).scrollTop(scroll);
					if (scroll === 9999999) x.scroll_max = $('.wrapper', support.el.modal).scrollTop();
					$('input', support.el.modal).focus();

					x.timer_open = setInterval(function(){
						$.post('?support/help_get_new_message', {id: id}, function(json){
							if (json.status) {
								var scroll = $('.wrapper', support.el.modal).scrollTop();

								$('.wrapper', support.el.modal).append($.map(json.items, function(el){
									return '<div class="i">\
										<div class="info">' + el.user + ', ' + moment(el.date*1000).format('MM/DD/Y H:mm') + '</div>\
										<div class="desc">' + el.desc + '</div>\
									</div>';
								}).join(''));

								if (json.items.length) {
									if (x.scroll_max <= scroll) {
										$('.wrapper', support.el.modal).scrollTop(9999999);
										x.scroll_max = $('.wrapper', support.el.modal).scrollTop();
									} else {
										// show notify about new message
									}
								}
							}
						}, 'json');
					}, 5000);
				}
			}, 'json');
		},
		send_message: function(){
			var x = this;

			var input = $('input', support.el.modal);
			var val = input.val().trim();

			if (val) {
				input.val('');
				var i = $('<div class="i">\
					<div class="info">' + users.arr.users[users.logged].fname + ', ' + moment().format('MM/DD/Y H:mm') + '</div>\
					<div class="desc">' + val + '</div>\
				</div>');
				$('.wrapper', support.el.modal).append(i).scrollTop(9999999);
				x.scroll_max = $('.wrapper', support.el.modal).scrollTop();

				$.post('?support/help_send_message', {ticket: x.ticket, message: val}, function(json){
					// check sending
				}, 'json');
			}
		}
	},
	load_faq: function()
	{
		var x = this;

		$.get('?support/faq_get_list', function(json){
			var html = $.map(json.list, function(el){
				return m.template(x.template.faq, {
					q: el[0],
					a: el[1]
				});
			});

			$('.content', x.el.faq).html(html.join(''));
			$('.overlay', x.el.faq).addClass('hide');
		}, 'json');
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

common.queue.push(support);