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
			'common.css',
		];
		$styles[] = 'templates/database.css';
		$styles[] = 'templates/items.css';
		$styles[] = 'templates/files.css';
		$styles[] = 'templates/fields.css';
		$styles[] = 'templates/users.css';
		$styles[] = 'templates/plugins.css';
		$styles[] = 'templates/support.css';
		$styles[] = 'templates/settings.css';
		foreach ($styles as $style) {
			echo '<link rel="stylesheet" href="' . $style . '?v=' . VERSION . '">';
		}
	?>
</head>
<body class="box">
	<header class="animate2">
		<div class="logo">
			<img src="/favicon.png">
			<p><?php echo $settings['siteTitle']; ?></p>
		</div>
		<?php if ($visitor->access === 4) { ?>
			<a class="settings" href="#/settings" title="<?php echo $lang['section_settings']; ?>"><?php require_once('templates/settings.svg'); ?><i class="br10 animate2">!</i></a>
		<?php } ?>
		<a class="support" href="#/support" title="<?php echo $lang['section_support']; ?>"><?php require_once('templates/support.svg'); ?><i class="br10 animate2">!</i></a>
		<div class="account">
			<?php echo '<div class="user">' . $visitor->fname . '</div>'; ?>
			<a class="logout" href="index.php?logout" title="<?php echo $lang['section_logout']; ?>">
				<svg class="animate1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M352.672 544h-257.312v-448h257.28v96h63.36v-96c0-35.2-28.768-64-64-64h-256c-35.2 0-64 28.8-64 64v448c0 35.2 28.8 64 64 64h256c35.232 0 64-28.8 64-64v-64h-63.328v64zM608 336l-127.328-124.8v76.8h-288v96h288v76.8l127.328-124.8z"></path></svg>
			</a>
		</div>
	</header>

	<div id="menu">
		<div class="overlay animate2"></div>
		<div class="menu animate2">
			<a class="animate" href="#/database"><?php require_once('templates/database.svg'); ?><p><?php echo $lang['section_database']; ?></p></a>
			<a class="animate" href="#/items"><?php require_once('templates/items.svg'); ?><p><?php echo $lang['section_items']; ?></p></a>
			<a class="animate" href="#/files"><?php require_once('templates/files.svg'); ?><p><?php echo $lang['section_files']; ?></p></a>
			<?php
				$sections = [];

				//$sections[] = ['#/statistics', 'menu_statistics', 'Statistics'];
				//$sections[] = ['#/order', 'menu_order', 'Orders'];
				switch ($visitor->access) {
					case '1':
					case '2':
					case '3':
						// $sections[] = ['#/users', 'menu_users', $lang['section_users']];
						break;
					case '4':
						$sections[] = ['#/fields', 'menu_fields', $lang['section_fields']];
						// $sections[] = ['#/users', 'menu_users', $lang['section_users']];
						break;
				}
				foreach ($sections as $section) {
					$isPlugin = isset($section[3]);
					echo '<a class="animate' . ($isPlugin ? ' hide ' . $section[3] : '') . '" href="' . $section[0] . '">' . $icons[$section[1]] . '<p>' . $section[2] . '</p></a>';
				}
			?>
			<a class="animate" href="#/users"><?php require_once('templates/users.svg'); ?><p><?php echo $lang['section_users']; ?></p></a>
			<a class="animate" href="#/plugins"><?php require_once('templates/plugins.svg'); ?><p><?php echo $lang['section_plugins']; ?></p></a>
		</div>
		<div class="search animate2">
			<input class="br3 box" type="text" value="" placeholder="<?php echo $lang['search_input_placeholder']; ?>">
		</div>
		<div class="result box animate2">
			<div class="database">
				<div class="head"><?php echo $lang['search_database']; ?></div>
				<div class="scroll">
					<div class="viewport"><div class="overview animate1">
						<div class="item" data="{{id}}">
							<div class="image br3" style="background-image:url({{image}});" title="ID {{id}}"></div>
							<div class="info br3">
								<div class="title" title="{{title}}">{{title}}</div>
							</div>
						</div>
					</div></div>
					<div class="scrollbar animate1"><div class="track"><div class="thumb br3 animate1"></div></div></div>
				</div>
			</div>
			<div class="items">
				<div class="head"><?php echo $lang['search_items']; ?></div>
				<div class="scroll">
					<div class="viewport"><div class="overview animate1">
						<div class="item" data="{{id}}">
							<div class="image br3" style="background-image:url({{image}});" title="ID {{id}}"></div>
							<div class="info br3">
								<div class="title" title="{{title}}">{{title}}</div>
								<div class="path">{{path}}</div>
							</div>
						</div>
					</div></div>
					<div class="scrollbar animate1"><div class="track"><div class="thumb br3 animate1"></div></div></div>
				</div>
			</div>
			<div class="files">
				<div class="head"><?php echo $lang['search_files']; ?></div>
				<div class="scroll">
					<div class="viewport"><div class="overview animate1">
						<div class="item" data="{{id}}">
							<div class="image br3" style="background-image:url({{image}});" title="ID {{id}}"></div>
							<div class="info br3">
								<div class="title" title="{{title}}">{{title}}</div>
								<div class="path">{{path}}</div>
							</div>
						</div>
					</div></div>
					<div class="scrollbar animate1"><div class="track"><div class="thumb br3 animate1"></div></div></div>
				</div>
			</div>
		</div>
	</div>

	<div id="content" class="animate2">
		<?php
			require_once('templates/database.php');
			require_once('templates/items.php');
			require_once('templates/files.php');
			require_once('templates/fields.php');
			require_once('templates/users.php');
			require_once('templates/plugins.php');
			require_once('templates/settings.php');
			require_once('templates/support.php');
		?>
		<div id="overlay" class="loader"></div>
	</div>

	<div id="cache"></div>
	<div id="progress" class="animate2"></div>
	<div id="ws" class="loader animate2"><?php echo $lang['global_ws_error']; ?></div>

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
			'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
			//'https://www.google.com/jsapi',
			//<script>google.load('visualization', '1.0', {'packages':['corechart']});</script>
			'plugins/tinymce/tinymce.min.js',
			// https://www.tiny.cloud/get-tiny/custom-builds/
			// plugins - print code image link media table lists autoresize contextmenu paste
			// skins - lightgray
			// theme - modern
			'plugins/jquery-ui.min.js',
			'plugins/jquery.tinyscrollbar.min.js',
			'plugins/colorpicker/colorpicker.min.js',
			'plugins/alertify.min.js',
			'plugins/jquery.Jcrop.min.js',
			'plugins/sprintf.min.js',
			'plugins/moment.js',
			'common.js',
			//'order.js',
			//'statistics.js',
		];
		$scripts[] = 'templates/users.js';
		$scripts[] = 'templates/fields.js';
		$scripts[] = 'templates/settings.js';
		$scripts[] = 'templates/database.js';
		$scripts[] = 'templates/items.js';
		$scripts[] = 'templates/files.js';
		$scripts[] = 'templates/plugins.js';
		$scripts[] = 'templates/support.js';

		foreach ($scripts as $script) {
			echo '<script src="' . $script . '?v=' . VERSION . '"></script>';
		}
	?>
	<script>
		$(common.init);
	</script>
</body>
</html>