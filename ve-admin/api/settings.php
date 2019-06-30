<?php
if ($section === 'settings')
{
	if ($query === 'get_list')
	{
		$settings = $db->select('settings', '*', [], __FILE__, __LINE__);

		$settings = array_column($settings, 'value', 'variable');

		json($settings);
	}

	if ($query === 'edit_settings')
	{
		$core->cache->clearCache('theme_');

		foreach ($_POST as $k => $v) {
			$db->update('settings', ['value' => $v], 'variable', $k, __FILE__, __LINE__);
		}

		json(['status' => 'OK']);
	}

	if ($query === 'clear_cache_template')
	{
		$core->cache->clearCache('all');

		json(['status' => 'OK']);
	}

	if ($query === 'create_backup')
	{
		$time = time();

		// check mysqldump
		exec('mysqldump --version', $output, $status);
		if ($status !== 0) json(['status' => 'FAIL_MDUMP', 'error' => 'Not available "mysqldump"']);

		if (!file_exists(DIR_SITE . 'backup')) mkdir(DIR_SITE . 'backup');

		// backup db
		$file = DIR_SITE . 'backup/' . $time . '.sql';
		exec('mysqldump --host=' . DB_HOST . ' --user=' . DB_USER . ' --password=' . DB_PASS . ' ' . DB_NAME . ' > ' . $file, $output, $status);

		if ($status !== 0 || !file_exists($file) || !file_get_contents($file)) json(['status' => 'FAIL', 'error' => 'Dump database not created']);

		// backup gzip
		try {
			$tar = DIR_SITE . 'backup/' . $time . '.tar';

			$phar = new PharData($tar);

			$dirs = ['ve-theme'];

			foreach ($dirs as $dir) {
				$dir_source = DIR_SITE . $dir;

				$dirIterator = new RecursiveDirectoryIterator($dir_source, RecursiveDirectoryIterator::SKIP_DOTS);
				$iterator    = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::SELF_FIRST);

				foreach ($iterator as $object) {
					($object->isDir()) ? $phar->addEmptyDir('/' . $dir . '/' . $iterator->getSubPathName()) : $phar->addFile($object, '/' . $dir . '/' . $iterator->getSubPathName());
				}
			}

			$phar->addFile($file, '/' . DB_NAME . '.sql');

			$phar->compress(Phar::GZ, '.tar.gz');

			$new_name = DIR_SITE . 'backup/backup_' . $time . '_UTC_' . date('d.m.Y_G.i.s', $time) . '.tar.gz';
			rename(DIR_SITE . 'backup/' . $time . '.tar.gz', $new_name);

			unset($phar);
			unlink($tar);
			unlink($file);

			if (!file_exists($new_name)) {
				$json = ['status' => 'FAIL', 'error' => 'Error backup file not created'];
			}
		} catch (Exception $e) {
			$json = ['status' => 'FAIL', 'error' => 'Error backup gzip: ' . $e];
		}

		json(['status' => 'OK']);
	}

	if ($query === 'image_clear_cache')
	{
		$core->files->clearCache('all');

		json(['status' => 'OK']);
	}

	if ($query === 'image_reset_size')
	{
		$core->files->resetImageSize();

		json(['status' => 'OK']);
	}

	if ($query === 'facebook_auth')
	{
		require_once(DIR_CORE . 'library/Facebook/autoload.php');

		$app_id = $_POST['app_id'];
		$app_secret = $_POST['app_secret'];

		$fb = new Facebook\Facebook([
			'app_id' => $app_id,
			'app_secret' => $app_secret,
			'default_graph_version' => 'v2.5',
		]);

		$helper = $fb->getRedirectLoginHelper();
		$callback = URL_SITE . 've-admin/?settings/facebook_auth_callback';
		$permissions = ['publish_actions', 'manage_pages', 'publish_pages'];
		$link = $helper->getLoginUrl($callback, $permissions);

		json(['status' => 'OK', 'link' => $link]);
	}

	if ($query === 'facebook_auth_callback')
	{
		require_once(DIR_CORE . 'library/Facebook/autoload.php');

		$fb = new Facebook\Facebook([
			'app_id' => $settings['facebookAppID'],
			'app_secret' => $settings['facebookAppSecret'],
			'default_graph_version' => 'v2.5',
		]);

		$helper = $fb->getRedirectLoginHelper();

		try {
			$accessToken = $helper->getAccessToken();
		} catch(Facebook\Exceptions\FacebookResponseException $e) {
			echo 'Graph returned an error: ' . $e->getMessage();
			exit;
		} catch(Facebook\Exceptions\FacebookSDKException $e) {
			echo 'Facebook SDK returned an error: ' . $e->getMessage();
			exit;
		}

		if (!isset($accessToken)) {
			if ($helper->getError()) {
				header('HTTP/1.0 401 Unauthorized');
				echo "Error: " . $helper->getError() . "\n";
				echo "Error Code: " . $helper->getErrorCode() . "\n";
				echo "Error Reason: " . $helper->getErrorReason() . "\n";
				echo "Error Description: " . $helper->getErrorDescription() . "\n";
			} else {
				header('HTTP/1.0 400 Bad Request');
				echo 'Bad request';
			}
			exit;
		}

		$db->update('settings', ['value' => $accessToken->getValue()], 'variable', 'facebookToken', __FILE__, __LINE__);

		// get user pages
		$request = $fb->get('/me/accounts', $accessToken->getValue());
		$pages = $request->getDecodedBody()['data'];
		$pages = array_map(function($page){
			return [
				'token' => $page['access_token'],
				'title' => $page['name'],
				'id' => $page['id']
			];
		}, $pages);
		$pages = json_encode($pages);

		$db->update('settings', ['value' => $pages], 'variable', 'facebookPages', __FILE__, __LINE__);

		// close window
		echo '<script>window.close();</script>';
		exit();
	}
}
?>