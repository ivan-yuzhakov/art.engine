<?php
if ($section === 'plugins')
{
	if ($query === 'get_list')
	{
		$plugins = $db->select('plugins', ['id', 'status', 'show', 'alias'], [], __FILE__, __LINE__);

		foreach ($plugins as $i => $plugin) {
			$path = DIR_PLUGINS . $plugin['alias'];

			if (file_exists($path)) {
				$lang = [];

				require_once($path . '/language/eng.php');
				if ($admin_lang !== 'eng' && file_exists($path . '/language/' . $admin_lang . '.php')) {
					require_once($path . '/language/' . $admin_lang . '.php');
				}

				$plugin['image'] = file_get_contents($path . '/image.svg');
				$plugin['title'] = $lang['plugin_title'];
				$plugin['desc'] = $lang['plugin_desc'];
				$plugin['status'] = (bool) $plugin['status'];
				$plugin['show'] = (bool) $plugin['show'];

				$plugins[$i] = $plugin;
			} else {
				$plugins[$i] = false;
			}
		}

		$plugins = array_filter($plugins);
		$plugins = array_values($plugins);

		json($plugins);
	}

	if ($query === 'get_plugin_settings')
	{
		$plugins = $db->select('plugins', '*', ['id' => (int) $_POST['id']], __FILE__, __LINE__);

		$plugin = empty($plugins) ? false : $plugins[0];

		$path = DIR_PLUGINS . $plugin['alias'];

		if (!file_exists($path)) $plugin = false;

		if ($plugin !== false) {
			$lang = [];
			require_once($path . '/language/eng.php');
			if ($admin_lang !== 'eng' && file_exists($path . '/language/' . $admin_lang . '.php')) {
				require_once($path . '/language/' . $admin_lang . '.php');
			}
			$lang = $lang['settings'];

			ob_start();
			require_once($path . '/settings/settings.php');
			$html = ob_get_clean();

			$json = [
				'status' => 'OK',
				'plugin' => $plugin,
				'lang' => $lang,
				'html' => $html,
				'js' => URL_PLUGINS . $plugin['alias'] . '/settings/settings.js?v=' . VERSION,
				'css' => URL_PLUGINS . $plugin['alias'] . '/settings/settings.css?v=' . VERSION,
			];
		} else {
			$json = ['status' => 'FAIL'];
		}

		json($json);
	}

	if ($query === 'get_plugins_extentions')
	{
		$plugins = $db->select('plugins', ['alias', 'fields'], ['status' => 1], __FILE__, __LINE__);

		foreach ($plugins as $i => $plugin) {
			$path = DIR_PLUGINS . $plugin['alias'];

			if (!file_exists($path)) {
				$plugins[$i] = false;
				continue;
			}
			if (!file_exists($path . '/extentions/extentions.js')) {
				$plugins[$i] = false;
				continue;
			}

			$lang = [];
			require_once($path . '/language/eng.php');
			if ($admin_lang !== 'eng' && file_exists($path . '/language/' . $admin_lang . '.php')) {
				require_once($path . '/language/' . $admin_lang . '.php');
			}
			$lang = $lang['extentions'];

			$plugins[$i] = [
				'alias' => $plugin['alias'],
				'lang' => $lang,
				'fields' => json_decode($plugin['fields'], true),
				'js' => URL_PLUGINS . $plugin['alias'] . '/extentions/extentions.js?v=' . VERSION,
				'css' => URL_PLUGINS . $plugin['alias'] . '/extentions/extentions.css?v=' . VERSION
			];
		}
		$plugins = array_filter($plugins);

		$json = [
			'status' => 'OK',
			'plugins' => $plugins
		];

		json($json);
	}

	if ($query === 'edit_status')
	{
		$result = $db->update('plugins', ['status' => (int) $_POST['status']], 'id', (int) $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'edit_show')
	{
		$result = $db->update('plugins', ['show' => (int) $_POST['show']], 'id', (int) $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'edit_fields')
	{
		$result = $db->update('plugins', ['fields' => $_POST['fields']], 'id', (int) $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'get_plugin_page')
	{
		$plugins = $db->select('plugins', '*', ['alias' => $_POST['alias']], __FILE__, __LINE__);

		$plugin = empty($plugins) ? false : $plugins[0];

		$path = DIR_PLUGINS . $plugin['alias'];

		if (!file_exists($path)) $plugin = false;

		if ($plugin !== false) {
			$lang = [];
			require_once($path . '/language/eng.php');
			if ($admin_lang !== 'eng' && file_exists($path . '/language/' . $admin_lang . '.php')) {
				require_once($path . '/language/' . $admin_lang . '.php');
			}
			$lang = $lang['page'];

			ob_start();
			require_once($path . '/page/page.php');
			$html = ob_get_clean();

			$json = [
				'status' => 'OK',
				'plugin' => $plugin,
				'lang' => $lang,
				'html' => $html,
				'js' => URL_PLUGINS . $plugin['alias'] . '/page/page.js?v=' . VERSION,
				'css' => URL_PLUGINS . $plugin['alias'] . '/page/page.css?v=' . VERSION
			];
		} else {
			$json = ['status' => 'FAIL'];
		}

		json($json);
	}

	if ($query === 'plugins_get_list')
	{
		// check mysqldump
		exec('mysqldump --version', $output, $status);
		if ($status !== 0) json(['status' => 'MYSQLDUMP_ERROR']);

		if (!class_exists('PharData')) json(['status' => 'PHARDATA_ERROR']);

		$server = $settings['updateServerCore'];

		require_once(DIR_CORE . 'library/Unirest.php');

		try {
			$response = Unirest\Request::post($server, [], [
				'section' => 'plugins',
				'query' => 'get_list',
				'version' => VERSION,
				'lang' => isset($_COOKIE['ADMIN_LANG']) ? $_COOKIE['ADMIN_LANG'] : 'eng'
			]);

			$json = (array) $response->body;
		} catch (Exception $e) {
			$json = ['status' => 'UNKNOWN_HOST'];
		}

		json($json);
	}

	// Plugin API
	$plugins = $db->select('plugins', '*', ['alias' => $query], __FILE__, __LINE__);

	$plugin = empty($plugins) ? false : $plugins[0];

	$path = DIR_PLUGINS . $plugin['alias'];

	if (!file_exists($path)) $plugin = false;

	if ($plugin !== false) {
		$query = $get[3];
		require_once($path . '/' . $get[2] . '/api.php');
	} else {
		$json = ['status' => 'FAIL'];
		json($json);
	}
}
?>