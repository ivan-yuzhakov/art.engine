var plugin_subscribes_extentions = {
	lang: {},
	fields: {},
	items_onCompleteForm: function(){
		var x = this;

		var p = $('<p class="animate1 br3">').text('E-mail').on('click', function(){
			var subject = $('#items .form #public_title').val().trim();
			var link = $('#items .form #link').val();

			if (!link) {
				alertify.error(lang['items_form_sharing_error_link']);
				return false;
			}

			var message = '<a href="' + link + '">Link</a>';
			location.hash = '/plugins/subscribes';
			setTimeout(function(){
				plugin_subscribes_page.create_mail([], subject, message);
			}, 400);
		});
		$('#items .form .extra .sharing').prepend(p);
	}
};