<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title><?php echo $settings['siteTitle']; ?> ‒ CP</title>

	<?php
		$styles = [
			'plugins/colorpicker/colorpicker.min.css',
			'plugins/jquery.tinyscrollbar.css',
			'plugins/alertify.css',
			'plugins/jquery.Jcrop.min.css',
			'index.css',
		];
		$styles[] = 'templates/search/search.css';
		$styles[] = 'templates/items/items.css';
		$styles[] = 'templates/files/files.css';
		$styles[] = 'templates/settings/settings.css';
		$styles[] = 'templates/plugins/plugins.css';
		foreach ($styles as $style) {
			echo '<link rel="stylesheet" href="' . $style . '?v=' . VERSION . '">';
		}
	?>
</head>
<body>
	<div id="menu">
		<a class="animate" href="#/search"><?php require_once('templates/search/search.svg'); ?><p><?php echo $lang['section_search']; ?></p></a>
		<a class="animate" href="#/items"><?php require_once('templates/items/items.svg'); ?><p><?php echo $lang['section_items']; ?></p></a>
		<a class="animate" href="#/files"><?php require_once('templates/files/files.svg'); ?><p><?php echo $lang['section_files']; ?></p></a>
		<?php
			$sections = [];

			//$sections[] = ['#/statistics', 'menu_statistics', 'Statistics'];
			//$sections[] = ['#/order', 'menu_order', 'Orders'];
			switch ($visitor->access) {
				case '1':
				case '2':
				case '3':
					$sections[] = ['#/users', 'menu_users', $lang['section_users']];
					break;
				case '4':
					$sections[] = ['#/fields', 'menu_fields', $lang['section_fields']];
					$sections[] = ['#/users', 'menu_users', $lang['section_users']];
					break;
			}
			foreach ($sections as $section) {
				$isPlugin = isset($section[3]);
				echo '<a class="animate' . ($isPlugin ? ' hide ' . $section[3] : '') . '" href="' . $section[0] . '">' . $icons[$section[1]] . '<p>' . $section[2] . '</p></a>';
			}
		?>
		<a class="animate" href="#/plugins"><?php require_once('templates/plugins/plugins.svg'); ?><p><?php echo $lang['section_plugins']; ?></p></a>
		<?php if ($visitor->access === 4) { ?>
			<a class="animate settings" href="#/settings"><?php require_once('templates/settings/settings.svg'); ?><p><?php echo $lang['section_settings']; ?></p><i class="br10 animate2">!</i></a>
		<?php } ?>
		<a class="animate" href="index.php?logout"><?php require_once('templates/logout/logout.svg'); ?><p><?php echo $lang['section_logout']; ?></p></a>
	</div>

	<div id="content">
		<?php
			require_once('templates/search/search.php');
			require_once('templates/items/items.php');
			require_once('templates/files/files.php');
			require_once('templates/plugins/plugins.php');
			require_once('templates/settings/settings.php');
		?>
		<div id="overlay" class="loader"></div>
	</div>

	<div id="cache"></div>
	<div id="progress" class="animate"></div>

	<script>
		var siteurl = '<?php echo URL_SITE; ?>';
		var maxfilesize = <?php echo $core->files->files_size; ?>;
		var fileformats = ['<?php echo implode("','", $core->files->files_formats); ?>'];
		var icons = {<?php
			$arr = [];
			foreach ($icons as $key => $icon) {
				$arr[] = $key . ":'" . $icon . "'";
			}
			echo implode(',', $arr);
		?>};
		var lang = {<?php
			$arr = [];
			foreach ($lang as $key => $icon) {
				$arr[] = $key . ":'" . $icon . "'";
			}
			echo implode(',', $arr);
		?>};
	</script>
	<?php
		$scripts = [
			'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
			'https://cdn.tinymce.com/4/tinymce.min.js',
			//'https://www.google.com/jsapi',
			//<script>google.load('visualization', '1.0', {'packages':['corechart']});</script>
			'plugins/jquery-ui.min.js',
			'plugins/jquery.tinyscrollbar.min.js',
			'plugins/colorpicker/colorpicker.min.js',
			'plugins/alertify.min.js',
			'plugins/jquery.Jcrop.min.js',
			'plugins/sprintf.min.js',
			'common.js',
			'fields.js',
			'users.js',
			//'order.js',
			//'statistics.js',
		];
		$scripts[] = 'templates/search/search.js';
		$scripts[] = 'templates/items/items.js';
		$scripts[] = 'templates/files/files.js';
		$scripts[] = 'templates/plugins/plugins.js';
		$scripts[] = 'templates/settings/settings.js';

		foreach ($scripts as $script) {
			echo '<script src="' . $script . '?v=' . VERSION . '"></script>';
		}
	?>
	<script>
		$(common.init);
	</script>
</body>
</html>