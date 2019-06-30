<?php
if ($section === 'updates')
{
	if ($query === 'check_update')
	{
		// check mysqldump
		exec('mysqldump --version', $output, $status);
		if ($status !== 0) json(['status' => 'MYSQLDUMP_ERROR']);

		if (!class_exists('PharData')) json(['status' => 'PHARDATA_ERROR']);

		$server = $settings['updateServerCore'];

		if (empty($server)) {
			json(['status' => 'UNKNOWN_HOST']);
		} else {
			require_once(DIR_CORE . 'library/Unirest.php');

			try {
				$response = Unirest\Request::post($server, [], [
					'section' => 'core',
					'query' => 'check_update',
					'version' => VERSION
				]);

				$json = (array) $response->body;
				$json['version_current'] = VERSION;
			} catch (Exception $e) {
				$json = ['status' => 'UNKNOWN_HOST'];
			}

			json($json);
		}
	}

	if ($query === 'load_update')
	{
		$server = $settings['updateServerCore'];

		require_once(DIR_CORE . 'library/Unirest.php');

		$response = Unirest\Request::post($server, [], [
			'section' => 'core',
			'query' => 'load_update',
			'version' => VERSION
		]);

		$json = (array) $response->body;

		if (isset($json['status']) && ($json['status'] === 'NEW_VERSION' || $json['status'] === 'MANUAL_UPDATE')) {
			if (!file_exists(DIR_SITE . 'updates')) mkdir(DIR_SITE . 'updates');

			$file = file_get_contents($server . $json['file']);
			$newfile = DIR_SITE . 'updates/update.tar.gz';

			$fp = fopen($newfile, 'w');
			fwrite($fp, $file);
			fclose($fp);

			// extract update
			try {
				$phar = new PharData($newfile);
				$phar->extractTo(DIR_SITE . 'updates/update', null, true);

				unset($phar);
				unlink($newfile);

				$json = ['status' => 'OK'];
			} catch (Exception $e) {
				$json = ['status' => 'FAIL', 'error' => 'Error extract update: ' . $e];
			}
		}

		json($json);
	}

	if ($query === 'backup')
	{
		$db->update('settings', ['value' => 1], 'variable', 'maintenanceMode', __FILE__, __LINE__);

		// backup db
		$file = DIR_SITE . 'updates/' . VERSION . '.sql';
		exec('mysqldump --host=' . DB_HOST . ' --user=' . DB_USER . ' --password=' . DB_PASS . ' ' . DB_NAME . ' > ' . $file, $output, $status);

		if ($status !== 0 || !file_exists($file) || !file_get_contents($file)) {
			$db->update('settings', ['value' => 0], 'variable', 'maintenanceMode', __FILE__, __LINE__);
			json(['status' => 'FAIL', 'error' => 'Dump database not created']);
		}

		// create list of update files
		$list = [];
		$DI = new RecursiveDirectoryIterator(DIR_SITE . 'updates/update/core', RecursiveDirectoryIterator::SKIP_DOTS);
		$II = new RecursiveIteratorIterator($DI, RecursiveIteratorIterator::SELF_FIRST);
		foreach ($II as $object) {
			if (!$object->isDir()) $list[] = $II->getSubPathName();
		}

		// add to list deleted files and folder
		$manifest = file_get_contents(DIR_SITE . 'updates/update/manifest.json');
		$manifest = json_decode($manifest);
		foreach ($manifest->deleted as $obj) {
			if (is_dir(DIR_SITE . $obj)) {
				$DI = new RecursiveDirectoryIterator(DIR_SITE . $obj, RecursiveDirectoryIterator::SKIP_DOTS);
				$II = new RecursiveIteratorIterator($DI, RecursiveIteratorIterator::SELF_FIRST);
				foreach ($II as $object) {
					if (!$object->isDir()) $list[] = $obj . '/' . $II->getSubPathName();
				}
			} else {
				$list[] = $obj;
			}
		}

		// backup gzip
		try {
			$tar = DIR_SITE . 'updates/backup.tar';

			$phar = new PharData($tar);

			foreach ($list as $f) {
				if (file_exists(DIR_SITE . $f)) $phar->addFile(DIR_SITE . $f, '/' . $f);
			}
			$phar->addFile($file, '/' . VERSION . '.sql');

			$phar->compress(Phar::GZ, '.tar.gz');

			rename(DIR_SITE . 'updates/backup.tar.gz', DIR_SITE . 'updates/backup_core_' . VERSION . '.tar.gz');

			unset($phar);
			unlink($tar);
			unlink($file);

			if (file_exists(DIR_SITE . 'updates/backup_core_' . VERSION . '.tar.gz')) {
				$json = ['status' => 'OK'];
			} else {
				$json = ['status' => 'FAIL', 'error' => 'Error backup file not created'];
			}
		} catch (Exception $e) {
			$json = ['status' => 'FAIL', 'error' => 'Error backup gzip: ' . $e];
		}

		json($json);
	}

	if ($query === 'update_files')
	{
		// delete files and folder
		$manifest = file_get_contents(DIR_SITE . 'updates/update/manifest.json');
		$manifest = json_decode($manifest);
		foreach ($manifest->deleted as $obj) {
			$obj = DIR_SITE . $obj;

			if (is_dir($obj)) {
				$helpers->dir_remove($obj);
			} else {
				if (file_exists($obj)) unlink($obj);
			}
		}

		// create list of update files
		$list = [];
		$DI = new RecursiveDirectoryIterator(DIR_SITE . 'updates/update/core', RecursiveDirectoryIterator::SKIP_DOTS);
		$II = new RecursiveIteratorIterator($DI, RecursiveIteratorIterator::SELF_FIRST);
		foreach ($II as $object) {
			if (!$object->isDir()) $list[] = $II->getSubPathName();
		}

		foreach ($list as $f) {
			$oldname = DIR_SITE . 'updates/update/core/' . $f;
			$newname = DIR_SITE . $f;
			rename($oldname, $newname);
		}

		json(['status' => 'OK']);
	}

	if ($query === 'update_db')
	{
		$file = DIR_SITE . 'updates/update/update.sql';
		exec('mysql --host=' . DB_HOST . ' --user=' . DB_USER . ' --password=' . DB_PASS . ' ' . DB_NAME . ' < ' . $file, $output, $status);

		if ($status !== 0) {
			json(['status' => 'FAIL', 'error' => 'Error import update.sql']);
		}

		json(['status' => 'OK']);
	}

	if ($query === 'update_core')
	{
		try {
			$manifest = file_get_contents(DIR_SITE . 'updates/update/manifest.json');
			$manifest = json_decode($manifest);

			require_once(DIR_SITE . 'updates/update/update.php');

			$helpers->dir_remove(DIR_SITE . 'updates/update');

			$core->cache->clearCache('all');

			$db->update('settings', ['value' => 0], 'variable', 'maintenanceMode', __FILE__, __LINE__);

			$file = file_get_contents(DIR_SITE . 'settings.php');
			$file = str_replace(VERSION, $manifest->version, $file);
			$fp = fopen(DIR_SITE . 'settings.php', 'w');
			fwrite($fp, $file);
			fclose($fp);

			$json = ['status' => 'OK'];
		} catch (Exception $e) {
			$json = ['status' => 'FAIL', 'error' => 'Error update.php: ' . $e];
		}

		json($json);
	}
}
?>