var statistics = {
	arr: {},
	el: {
		parent: $('<div id="statistics" class="content" />')
	},
	init: function(callback)
	{
		var x = this;

		//$.getJSON('?settings/get', function(json){
			callback();
		//});
	},
	start: function()
	{
		var x = this;
		if (x.started) {x.reset(); return false;}
		x.started = true;

		x.el.parent.html('\
			<div class="head">\
				<div class="actions fright">\
					<div class="update">Update</div>\
				</div>\
				<div class="head_title">Google Analytics</div>\
			</div>\
			<div class="scroll">\
				<div class="viewport"><div class="overview"></div></div>\
				<div class="scrollbar animate"><div class="track"><div class="thumb"></div></div></div>\
			</div>\
			<div class="loader"></div>\
		').appendTo(content);

		x.scrollbar = x.el.parent.find('.scroll').tinyscrollbar().data('plugin_tinyscrollbar');
		x.el.overview = x.el.parent.find('.overview');
		x.el.loader = x.el.parent.find('.loader');

		x.draw();

		x.handlers();
	},
	handlers: function()
	{
		var x = this;

		x.el.parent.on('click', '.update', function(){
			x.draw();
		});

		x.reset();
	},
	draw: function()
	{
		var x = this;

		x.el.loader.show();
		$.getJSON('?statistics/get', function(json){
			//console.log(json);
			if (json.status == 1) { // OK
				x.el.overview.empty();

				// https://google-developers.appspot.com/chart/
				if (json.country) {
					var elem = $('<div class="box chart" />').appendTo(x.el.overview);

					var table = [['Counter', 'Visits']];
					$.each(json.country, function(i, el){
						table.push([i, el]);
					});
					var data = google.visualization.arrayToDataTable(table);
					var options = {
						'title': 'Visits by countries',
						backgroundColor: 'none',
						pieHole: 0.4
					};

					var chart = new google.visualization.PieChart(elem.get(0));
					chart.draw(data, options);
				}
				if (json.source) {
					var elem = $('<div class="box chart" />').appendTo(x.el.overview);

					var table = [['Source', 'Visits']];
					$.each(json.source, function(i, el){
						table.push([i, el]);
					});
					var data = google.visualization.arrayToDataTable(table);
					var options = {
						'title': 'Visits by sources',
						backgroundColor: 'none',
						pieHole: 0.4
					};

					var chart = new google.visualization.PieChart(elem.get(0));
					chart.draw(data, options);
				}
				if (json.popular) {
					var elem = $('<div class="box chart" />').appendTo(x.el.overview);

					var table = [['URL', 'Pageviews']];
					$.each(json.popular, function(i, el){
						table.push([i, el]);
					});
					var data = google.visualization.arrayToDataTable(table);
					var options = {
						'title': 'Most popular page',
						backgroundColor: 'none',
						legend: {position: 'none'}
					};

					var chart = new google.visualization.BarChart(elem.get(0));
					chart.draw(data, options);
				}
				if (json.time) {
					var elem = $('<div class="box chart" />').appendTo(x.el.overview);

					var table = [['Time', 'Visits']];
					$.each(json.time, function(i, el){
						table.push([i, el]);
					});
					var data = google.visualization.arrayToDataTable(table);
					var options = {
						'title': 'Visits by month',
						backgroundColor: 'none',
						legend: {position: 'none'}
					};

					var chart = new google.visualization.LineChart(elem.get(0));
					chart.draw(data, options);
				}

				x.el.overview.append('<div class="clr"></div>');
			}
			if (json.status == 2) { // Error settings
				x.el.overview.html('<div class="empty">Statistics are unavailable<br>Check Google Analytics settings</div>');
			}
			if (json.status == 3) { // Error connect
				x.el.overview.html('<div class="empty">Incorrect login / password<br>Check Google Analytics settings</div>');
			}
			if (json.status == 4) { // Error id
				x.el.overview.html('<div class="empty">Incorrect Google Analytics Id<br>Check Google Analytics settings</div>');
			}

			x.scrollbar.update('relative');
			x.el.loader.hide();
		})
		//x.el.overview.html('<div class="empty">Unknown error<br>Administrator has been notified error</div>');
		//m.report('statistics/get', {}, response.responseText, true);
		//x.el.loader.hide();
		// https://accounts.google.com/DisplayUnlockCaptcha
		// https://support.google.com/accounts/answer/185833
	},
	reset: function()
	{
		var x = this;

		x.el.parent.show().siblings().hide();
	},
	resize: function()
	{
		var x = this;
		// update size charts
	}
};

common.queue.push(statistics);