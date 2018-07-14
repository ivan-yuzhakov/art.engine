window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		var app_id = (x.fields.app_id || '').encode();
		var app_secret = (x.fields.app_secret || '').encode();

		html = html.replace('{{app_id}}', app_id);
		html = html.replace('{{app_secret}}', app_secret);
		html = html.replace('{{callback_url}}', 'https://' + location.host + '/ve-admin/?plugins/square/settings/auth');

		return html;
	},
	action: function(parent)
	{
		var x = this;
	},
	save: function(parent)
	{
		var x = this;

		var data = {
			app_id: $('#app_id', parent).val().trim(),
			app_secret: $('#app_secret', parent).val().trim()
		};

		if (data.app_id === x.fields.app_id && data.app_secret === x.fields.app_secret) {
			if (x.fields.auth) data.auth = x.fields.auth;
		}

		return data;
	}
};