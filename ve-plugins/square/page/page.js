var plugin_square_page = {
	arr: {},
	mode: false,
	el: {
		parent: $('#plugin_square_page')
	},
	init: function(callback)
	{
		var x = this;

		x.el.list = $('.list', x.el.parent);

		x.el.header = $('.header', x.el.list);
		x.el.wrapper = $('.wrapper', x.el.list);

		x.template = {
			list_header: x.el.header.html(),
			list_wrapper: x.el.wrapper.html(),
			section_payments: $('.section.payments', x.el.wrapper).html(),
			section_customers: $('.section.customers', x.el.wrapper).html(),
			section_items: $('.section.items', x.el.wrapper).html(),
			section_orders: $('.section.orders', x.el.wrapper).html(),
		};
		x.el.header.empty();
		x.el.wrapper.empty();

		x.handlers_list();

		x.active_location = false;
		x.active_section = 'payments';

		callback();
	},
	start: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();

		if (x.active_location === false) {
			loader.show();

			$.get('?plugins/square/page/get_locations', function(json){
				if (json.status === 'DISABLE_PLUGIN') {
					x.error(json);
					loader.hide();
				}
				if (json.status === 'EMPTY_APP_ID') {
					x.error(json);
					loader.hide();
				}
				if (json.status === 'EMPTY_APP_SECRET') {
					x.error(json);
					loader.hide();
				}
				if (json.status === 'AUTH') {
					x.error(json);
					loader.hide();
				}
				if (json.status === 'LOCATIONS_EMPTY') {
					x.error(json);
					loader.hide();
				}
				if (json.status === 'OK') {
					var locations = '<div class="locations"><select class="br3">' + $.map(json.locations, function(el, i){
						x.arr[el.id] = {};
						return '<option value="' + el.id + '">' + el.name + '</option>';
					}) + '</select></div>';

					var template_header = x.template.list_header;
					template_header = template_header.replace('{{locations}}', locations);

					x.el.header.html(template_header);
					x.el.wrapper.html(x.template.list_wrapper);

					x.active_location = json.locations[0].id;

					x.drawList();
				}
			}, 'json');
		} else {
			x.el.wrapper.html(x.template.list_wrapper);
			x.drawList();
		}
	},
	handlers_list: function()
	{
		var x = this;

		x.el.wrapper.on('click', '.sections p', function(){
			x.active_section = $(this).attr('data');
			x.drawList();
		});
		x.el.header.on('change', 'select', function(){
			x.active_location = $(this).val();
			x.drawList();
		});
	},
	loadList: function(callback)
	{
		var x = this;

		var url = '?plugins/square/page/get_list', data = {location: x.active_location, section: x.active_section};

		$.post(url, data, function(json){
			if (json.status === 'DISABLE_PLUGIN') {
				x.error(json);
			}
			if (json.status === 'EMPTY_APP_ID') {
				x.error(json);
			}
			if (json.status === 'EMPTY_APP_SECRET') {
				x.error(json);
			}
			if (json.status === 'AUTH') {
				x.error(json);
			}
			if (json.status === 'EMPTY') {
				x.arr[x.active_location][x.active_section] = {};
				callback(x.arr);
			}
			if (json.status === 'OK') {
				x.arr[x.active_location][x.active_section] = json.list;
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

			$.each(x.arr[x.active_location][x.active_section], function(i, el){
				var template = x.template['section_' + x.active_section];

				if (x.active_section === 'payments') {
					var obj = $.extend(true, {
						tenders: [
							{card_details: {card: {}}}
						]
					}, el);
					template = template.replace('{{id}}', obj.id);
					template = template.replace('{{amount}}', obj.tenders[0].amount_money.amount / 100);
					template = template.replace('{{currency}}', obj.tenders[0].amount_money.currency);
					template = template.replace('{{date}}', obj.created_at);
					template = template.replace('{{type}}', obj.product);
					template = template.replace('{{card}}', obj.tenders[0].card_details.card.card_brand);
					template = template.replace('{{last_4}}', obj.tenders[0].card_details.card.last_4);
				}

				if (x.active_section === 'customers') {
					el.address = el.address ? el.address : {};

					template = template.replace('{{id}}', el.id);
					template = template.replace('{{name}}', el.given_name);
					template = template.replace('{{family_name}}', el.family_name);
					template = template.replace('{{email}}', el.email_address);
					template = template.replace('{{phone}}', el.phone_number);
					template = template.replace('{{note}}', el.note);
					template = template.replace('{{note}}', el.note);
					template = template.replace('{{country}}', el.address.country);
					template = template.replace('{{locality}}', el.address.locality);
					template = template.replace('{{address_line}}', [el.address.address_line_1, el.address.address_line_2].join(', '));
					template = template.replace('{{date}}', el.created_at);
					template = template.replace('{{groups}}', $.map(el.groups, function(elem){
						return '<span data="' + elem.id + '">' + elem.name + '</span>';
					}).join(', '));
				}

				if (x.active_section === 'items') {
					template = template.replace('{{id}}', el.id);
					template = template.replace('{{name}}', el.name);
					template = template.replace('{{type}}', el.type);
					template = template.replace('{{visibility}}', el.visibility);
					template = template.replace('{{available_for_pickup}}', el.available_for_pickup ? 'Yes' : 'No');
					template = template.replace('{{available_online}}', el.available_online ? 'Yes' : 'No');
				}

				if (x.active_section === 'orders') {
					template = template.replace('{{id}}', el.id);
					template = template.replace('{{date}}', el.created_at);
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
			var template_header = x.template.list_header;
			template_header = template_header.replace('{{locations}}', '');

			x.el.header.html(template_header);
			x.el.wrapper.html('<div class="error">' + x.lang.error_disable_plugin + '</div>');
		}

		if (response.status === 'EMPTY_APP_ID') {
			var template_header = x.template.list_header;
			template_header = template_header.replace('{{locations}}', '');

			x.el.header.html(template_header);
			x.el.wrapper.html('<div class="error">' + x.lang.error_app_id_empty + '</div>');
		}

		if (response.status === 'EMPTY_APP_SECRET') {
			var template_header = x.template.list_header;
			template_header = template_header.replace('{{locations}}', '');

			x.el.header.html(template_header);
			x.el.wrapper.html('<div class="error">' + x.lang.error_app_secret_empty + '</div>');
		}

		if (response.status === 'AUTH') {
			var template_header = x.template.list_header;
			template_header = template_header.replace('{{locations}}', '');

			x.el.header.html(template_header);
			x.el.wrapper.html('<div class="error">' + sprintf(x.lang.error_auth, [response.link]) + '</div>');
		}

		if (response.status === 'LOCATIONS_EMPTY') {
			var template_header = x.template.list_header;
			template_header = template_header.replace('{{locations}}', '');

			x.el.header.html(template_header);
			x.el.wrapper.html('<div class="error">' + x.lang.error_locations_empty + '</div>');
		}
	},
	resize: function()
	{
		var x = this;
	}
};