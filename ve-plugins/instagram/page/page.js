var plugin_paypal_page = {
	arr: {},
	mode: false,
	el: {
		parent: $('#plugin_paypal_page')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);

		x.el.header = $('.header', x.el.list);
		x.el.wrapper = $('.wrapper', x.el.list);

		x.template = {
			list_wrapper: x.el.wrapper.html(),
			section_payments: $('.section.payments', x.el.wrapper).html(),
		};
		x.el.wrapper.empty();

		x.handlers_list();

		x.active_section = 'payments';

		callback();
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		x.el.wrapper.html(x.template.list_wrapper);
		x.drawList();
	},
	handlers_list: function()
	{
		var x = this;

		x.el.wrapper.on('click', '.sections p', function(){
			x.active_section = $(this).attr('data');
			x.drawList();
		});
	},
	loadList: function(callback)
	{
		var x = this;

		var url = '?plugins/paypal/page/get_list', data = {section: x.active_section};

		$.post(url, data, function(json){
			if (json.status === 'DISABLE_PLUGIN') {
				x.error(json);
			}
			if (json.status === 'EMPTY_CLIENT_ID') {
				x.error(json);
			}
			if (json.status === 'EMPTY_CLIENT_SECRET') {
				x.error(json);
			}
			if (json.status === 'AUTH_FAIL') {
				x.error(json);
			}
			if (json.status === 'EMPTY') {
				x.arr[x.active_section] = {};
				callback(x.arr);
			}
			if (json.status === 'OK') {
				x.arr[x.active_section] = json.list;
				callback(x.arr);
			}
		}, 'json');
	},
	drawList: function()
	{
		var x = this;

		loader.show();

		x.loadList(function(){
			var html = [];

			$.each(x.arr[x.active_section], function(i, el){
				var template = '';

				if (x.active_section === 'payments') {
					var template = m.template(x.template['section_' + x.active_section], {
						id: el.id,
						amount: el.transactions[0].amount.total,
						currency: el.transactions[0].amount.currency,
						date: new Date(el.create_time),
						person: el.payer.payer_info.first_name + ' ' + el.payer.payer_info.last_name + ' (' + el.payer.payer_info.country_code + ')'
					});
				}

				html.push(template);
			});

			$('.section.' + x.active_section, x.el.wrapper).html(html.join('') || '<div class="empty br3">Empty...</div>');

			$('.section').removeClass('active').filter('.' + x.active_section).addClass('active');
			$('.sections p').removeClass('active').filter('[data="' + x.active_section + '"]').addClass('active');

			loader.hide();
		});
	},
	error: function(response)
	{
		var x = this;

		if (response.status === 'DISABLE_PLUGIN') {
			x.el.wrapper.html('<div class="error">' + x.lang.error_disable_plugin + '</div>');
		}

		if (response.status === 'EMPTY_CLIENT_ID') {
			x.el.wrapper.html('<div class="error">' + x.lang.error_client_id_empty + '</div>');
		}

		if (response.status === 'EMPTY_CLIENT_SECRET') {
			x.el.wrapper.html('<div class="error">' + x.lang.error_client_secret_empty + '</div>');
		}

		if (response.status === 'AUTH_FAIL') {
			x.el.wrapper.html('<div class="error">' + x.lang.error_auth_fail + '</div>');
		}

		loader.hide();
	},
	resize: function()
	{
		var x = this;
	}
};