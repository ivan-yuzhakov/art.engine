window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		// var mailSender = (x.fields.mailSender || '').encode();
		// var mailMandrillKey = (x.fields.mailMandrillKey || '').encode();

		// html = html.replace('{{mailSender}}', mailSender);
		// html = html.replace('{{mailMandrillKey}}', mailMandrillKey);

		return html;
	},
	action: function(parent)
	{
		var x = this;

		// var data = $('.group', parent).attr('data');
		// $('.cell[data="' + data + '"]', parent).addClass('active');

		// if (data === 'mandrill') {
			// $('label', parent).show();
		// } else {
			// $('label', parent).hide();
		// }

		// parent.on('click', '.cell', function(){
			// var th = $(this);
			// var data = th.attr('data');

			// th.addClass('active').siblings().removeClass('active');

			// if (data === 'mandrill') {
				// $('label', parent).show();
			// } else {
				// $('label', parent).hide();
			// }
		// });
	},
	save: function(parent)
	{
		var x = this;

		// var data = {
			// mailSender: $('.cell.active', parent).attr('data'),
			// mailMandrillKey: $('#mailMandrillKey', parent).val().trim()
		// };

		// return data;
		return {};
	}
};