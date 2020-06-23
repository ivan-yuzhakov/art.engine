window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		var template = m.template(html, {
			public_key: (x.fields.public_key || '').encode(),
			private_key: (x.fields.private_key || '').encode(),
			sandbox_public_key: (x.fields.sandbox_public_key || '').encode(),
			sandbox_private_key: (x.fields.sandbox_private_key || '').encode(),
			test_mode: ui.switch.html()
		});

		return template;
	},
	action: function(parent)
	{
		var x = this;

		var sw = $('.switch .ui-switch', parent);
		var status = typeof x.fields.test_mode === 'boolean' ? x.fields.test_mode : true

		ui.switch.init(sw, {
			status: status,
			text: x.lang['test_mode']
		});
	},
	save: function(parent)
	{
		var x = this;

		var data = {
			public_key: $('#public_key', parent).val().trim(),
			private_key: $('#private_key', parent).val().trim(),
			sandbox_public_key: $('#sandbox_public_key', parent).val().trim(),
			sandbox_private_key: $('#sandbox_private_key', parent).val().trim(),
			test_mode: $('.switch .ui-switch', parent).hasClass('active')
		};

		if (data.public_key === x.fields.public_key && data.private_key === x.fields.private_key && data.sandbox_public_key === x.fields.sandbox_public_key && data.sandbox_private_key === x.fields.sandbox_private_key && data.test_mode === x.fields.test_mode) {
			if (x.fields.auth) data.auth = x.fields.auth;
		}

		return data;
	}
};