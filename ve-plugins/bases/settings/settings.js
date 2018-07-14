window.plugins.plugin_setting = {
	lang: {},
	fields: {},
	draw: function(html)
	{
		var x = this;

		x.pdf = '<div class="i">\
			<div class="box title">\
				<input class="br3 box animate1" type="text" value="{{title}}" placeholder="' + x.lang.pdf_template_title + '">\
			</div>\
			<div class="box path">\
				<input class="br3 box animate1" type="text" value="{{path}}" placeholder="' + x.lang.pdf_template_path + '">\
			</div>\
			<div class="clr"></div>\
		</div>';
		if (!x.fields.pdf_templates) x.fields.pdf_templates = [];

		var template = m.template(html, {
			templates: $.map(x.fields.pdf_templates, function(el, i){
				return m.template(x.pdf, {
					title: el[0],
					path: el[1]
				});
			}).join('')
		});

		return template;
	},
	action: function(parent)
	{
		var x = this;

		parent.on('click', '.add', function(){
			$('.group', parent).append(m.template(x.pdf, {
				title: '',
				path: ''
			}));
		});

		if (!x.fields.pdf_templates.length) $('.add', parent).trigger('click');
	},
	save: function(parent)
	{
		var x = this;

		var pdf_templates = [];

		$('.i', parent).each(function(){
			var th = $(this);
			var title = $('input', th).eq(0).val().trim();
			var path = $('input', th).eq(1).val().trim();

			if (title && path) pdf_templates.push([title, path]);
		});

		return {
			pdf_templates: pdf_templates
		};
	}
};