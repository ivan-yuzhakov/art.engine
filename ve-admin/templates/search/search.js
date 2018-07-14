var search = {
	el: {
		parent: $('#search')
	},
	init: function(callback)
	{
		var x = this;

		x.el.input = $('input', x.el.parent);
		x.el.result = $('.result', x.el.parent);

		x.template = {
			items: '',
			files: ''
		};
		x.template.items = $('.items .overview', x.el.result).html();
		$('.items .overview', x.el.result).empty();
		x.template.files = $('.files .overview', x.el.result).html();
		$('.files .overview', x.el.result).empty();

		x.scrollbars = $('.scroll', x.el.result).map(function(){
			return $(this).tinyscrollbar().data('plugin_tinyscrollbar');
		});

		x.handlers();

		callback();
	},
	start: function()
	{
		var x = this;

		x.el.parent.show();

		setTimeout(function(){
			x.el.input.focus();
			x.updateScroll();
		}, 50);
	},
	handlers: function()
	{
		var x = this;

		x.el.parent.on('keyup', 'input', function(){
			x.val = $(this).val().trim();

			x.el.result.toggleClass('show', x.val.length > 1);

			if (x.val.length > 1) x.submit();
		}).on('click', '.items .item', function(){
			var th = $(this);
			var id = +th.attr('data');

			if (id) {
				location.hash = '/items';
				items.openPathToItem(id);
			}
		}).on('click', '.files .item', function(){
			var th = $(this);
			var id = +th.attr('data');

			if (id) {
				location.hash = '/files';
				files.openPathToFile(id);
			}
		});//todo
	},
	submit: function(val)
	{
		var x = this;

		$.post('?search/search', {val: x.val}, function(json){
			if (x.val !== json.val) return false;

			if (json.items.length) {
				items.loadList(function(arr){
					var html = [];

					$.each(json.items, function(i, el){
						var parents = [];

						var get_parents = function(id){
							parents.unshift(id);
							if (id !== '#') {
								var parent = arr[id].parent;
								get_parents(parent);
							}
						};
						get_parents(el[0]);

						var template = m.template(x.template.items, {
							id: el[0],
							title: arr[el[0]].private_title,
							image: el[1] || '',
							path: $.map(parents, function(id){
								return arr[id].private_title;
							}).join(' / ')
						});

						html.push(template);
					});

					$('.items .overview', x.el.result).html(html.join(''));
					x.updateScroll();
				});
			} else {
				$('.items .overview', x.el.result).html('<div class="item empty br3">' + lang['search_empty'] + '</div>');
			}

			if (json.files.length) {
				files.loadList(function(arr){
					var html = [];

					$.each(json.files, function(i, el){
						var parents = [];

						var get_parents = function(id){
							parents.unshift(id);
							if (id !== '#') {
								var parent = arr.groups[id].parent;
								get_parents(parent);
							}
						};
						get_parents(arr.files[el[0]].parent);

						var template = m.template(x.template.files, {
							id: el[0],
							title: arr.files[el[0]].title,
							image: el[1],
							path: $.map(parents, function(id){
								return arr.groups[id].title;
							}).join(' / ') + ' / ' + arr.files[el[0]].title
						});

						html.push(template);
					});

					$('.files .overview', x.el.result).html(html.join(''));
					x.updateScroll();
				});
			} else {
				$('.files .overview', x.el.result).html('<div class="item empty br3">' + lang['search_empty'] + '</div>');
			}

			x.updateScroll();
		}, 'json');
	},
	updateScroll: function()
	{
		var x = this;

		$.each(x.scrollbars, function(i, el){
			el.update('relative');
		});
	},
	resize: function()
	{
		var x = this;
	}
};

common.queue.push(search);