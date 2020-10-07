window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		var template = html;

		return template;
	},
	action: function(parent)
	{
		var x = this;

		$.get('?plugins/instagram/settings/check', function(json){
			if (json.status) {
				$('.status', parent).text('Instagram connected!');
			} else {
				$('.status', parent).addClass('error').html('<a href="' + json.url + '" target="_blank">Instagram is not connected! Click here...</a>').on('click', function(){
					parent.parents('.form').find('.close').trigger('click');
				});
			}
		}, 'json');
	},
	save: function(parent)
	{
		var x = this;

		return x.fields;
	}
};