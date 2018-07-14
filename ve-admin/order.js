var order = {
	arr: {},
	parent: $('<div id="order" class="content" />'),
	elOrders: $('<div class="list">'),
	elAdd: $('<div id="add">'),
	mode: 0,
	init: function(callback)
	{
		var x = this;

		$.getJSON('?orders/get', function(json){
			x.arr = $.isArray(json) ? {} : json;

			callback();
		});
	},
	start: function()
	{
		var x = this;
		if (x.started) {x.reset(); return false;}
		x.started = true;

		content.prepend(x.parent);
		var arr1 = [0, 1, 2, 3, 4, 5, 6, 7];
		var arr2 = [0, 2, 10, 20, 20, 30, 10, 100];
		var paper = Raphael(x.elOrders.get(0), 960, 500);
		paper.linechart(0, 0, 960, 500, arr1, arr2, {
			nostroke: false,
			axis: '0 0 1 1',
			symbol: 'circle',
			smooth: true,
			gutter: 40
		}).hoverColumn(function(){
			this.tags = paper.set();
			for (var i = 0, ii = this.y.length; i < ii; i++) {
				this.tags.push(paper.tag(this.x, this.y[i], this.values[i], 160, 10).insertBefore(this).attr([{ fill: "#fff" }, { fill: this.symbols[i].attr("fill") }]));
			}
		}, function(){
			this.tags && this.tags.remove();
		}).symbols.attr({r: 5});

		$.each(x.arr, function(i, el){
			if (el) x.append(i);
		});
		x.handlers();
	},
	handlers: function(){
		var x = this;
		x.parent.append(x.elOrders, x.elAdd).on('click', '.edit', x.edit).on('click', '.remove', x.remove);
		x.elAdd.on('click', '.select', function(){
			$(this).addClass('active').siblings().removeClass('active');
		}).on('click', '.ok', x.save).on('click', '.cancel', x.reset);
		x.reset();
	},
	edit: function(){
		items.start();
		var item = $(this).parent();
		var id = parseInt(item.attr('id'));
		order.mode = id;
		var arr = order.arr[id];
		var date = new Date(arr.date);
		date = date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes();

		order.elOrders.hide();
		order.elAdd.show().html('\
			<div class="field">\
				<label >ID</label>\
				<div class="group">\
					<input id="id" class="br5 box" type="text" value="' + id + '" disabled>\
				</div>\
			</div>\
			<div class="field">\
				<label for="date">Date</label>\
				<div class="group">\
					<input id="date" class="br5 box" type="text" value="' + date + '" disabled>\
				</div>\
			</div>\
			<div class="field">\
				<label for="name">Name</label>\
				<div class="group">\
					<input id="name" class="br5 box" type="text" value="' + arr.name + '">\
				</div>\
			</div>\
			<div class="field">\
				<label for="phone">Telephone</label>\
				<div class="group">\
					<input id="phone" class="br5 box" type="text" value="' + arr.phone + '">\
				</div>\
			</div>\
			<div class="field">\
				<label for="mail">E-mail</label>\
				<div class="group">\
					<input id="mail" class="br5 box" type="text" value="' + arr.mail + '">\
				</div>\
			</div>\
			<div class="field">\
				<label for="comment">Comments</label>\
				<div class="group">\
					<textarea id="comment" class="br5 box" rows="5">' + arr.comment + '</textarea>\
				</div>\
			</div>\
			<div class="field">\
				<label>Status</label>\
				<div class="group">\
					<div class="cell br5 select">1</div>\
					<div class="cell br5 select">2</div>\
					<div class="cell br5 select">3</div>\
				</div>\
			</div>\
			<div class="field">\
				<label>Items</label>\
				<div class="group">\
					' + $.map(arr.items.split(';'), function(el, i){
						var q = el.split(':');
						var item = items.arr[q[0]];
						var iAttr = $.parseJSON(item.attr.replace(/&quot;/g,'"'));

						var url = [item.alias];
						var collection = items.tree.get_node(q[0]).parent;
						url.unshift(items.arr[collection].alias);
						var brand = items.tree.get_node(collection).parent;
						url.unshift(items.arr[brand].alias);
						var category = items.tree.get_node(brand).parent;
						url.unshift(items.arr[category].alias);

						return '<a class="cell br5" href="/' + url.join('/') + '/" target="_blank">' + iAttr[2] + ', count ' + q[1] + '</a>';
					}).join('') + '\
				</div>\
			</div>\
			<div class="button"><div class="cancel">Cancel</div><div class="ok">OK</div></div>\
		').find('.select').eq(arr.status).addClass('active');
	},
	save: function(){
		loader.show();
		var data = {
			name: $('#name', order.elAdd).val().trim().replace(/"/g, ''),
			phone: $('#phone', order.elAdd).val().trim().replace(/"/g, ''),
			mail: $('#mail', order.elAdd).val().trim().replace(/"/g, ''),
			comment: $('#comment', order.elAdd).val().trim().replace(/"/g, '^'),
			status: $('.select.active', order.elAdd).index()
		};
		$.extend(order.arr[order.mode], data);

		$.post('?orders/edit', order.arr[order.mode], function(json){
			$('.item#' + order.mode, order.elOrders).find('.title').text('Order #' + order.mode + ', ' + data.name);
			order.reset();
		}, 'json');
	},
	remove: function(){
		var item = $(this).parent().addClass('removed');
		var id = item.attr('id');
		alertify.confirm('Delete order?', function(e){
			if (e) {
				loader.show();
				$.post('?orders/delete', {id: id}, function(json){
					delete order.arr[id];
					item.remove();
					loader.hide();
				}, 'json');
			} else {
				item.removeClass('removed');
			}
		});
	},
	append: function(id){
		var x = this;
		var arr = x.arr[id];
		x.elOrders.append('<div id="' + id + '" class="item"><div class="action remove"></div><div class="action edit"></div><div class="title">Order #' + arr.id + ', ' + arr.name + '</div></div>');
	},
	reset: function(){
		order.parent.show().siblings().hide();
		order.elOrders.show();
		order.elAdd.hide();
	},
	resize: function(){}
};

common.queue.push(order);