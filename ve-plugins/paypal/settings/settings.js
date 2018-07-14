window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		var template = m.template(html, {
			client_id: (x.fields.client_id || '').encode(),
			client_secret: (x.fields.client_secret || '').encode(),
			client_id_sandbox: (x.fields.client_id_sandbox || '').encode(),
			client_secret_sandbox: (x.fields.client_secret_sandbox || '').encode(),
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
			client_id: $('#client_id', parent).val().trim(),
			client_secret: $('#client_secret', parent).val().trim(),
			client_id_sandbox: $('#client_id_sandbox', parent).val().trim(),
			client_secret_sandbox: $('#client_secret_sandbox', parent).val().trim(),
			test_mode: $('.switch .ui-switch', parent).hasClass('active')
		};

		if (data.client_id === x.fields.client_id && data.client_secret === x.fields.client_secret && data.client_id_sandbox === x.fields.client_id_sandbox && data.client_secret_sandbox === x.fields.client_secret_sandbox && data.test_mode === x.fields.test_mode) {
			if (x.fields.auth) data.auth = x.fields.auth;
		}

		return data;
	}
};