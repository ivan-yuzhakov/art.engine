<?php
if ($section === 'files')
{
	if ($query === 'get_last_update')
	{
		$items = $db->select('settings', ['variable', 'value'], [
			'variable' => ['lastUpdateFiles', 'lastUpdateFilesSorting']
		], __FILE__, __LINE__);

		$items = array_column($items, 'value', 'variable');

		json($items);
	}

	if ($query === 'get_list_items')
	{
		$files = $db->select('files', ['id', 'filename', 'title'], [], __FILE__, __LINE__);
		$files = array_map(function($file){
			return [
				$file['id'],
				$file['title'],
				pathinfo($file['filename'], PATHINFO_EXTENSION)
			];
		}, $files);

		$groups = $db->select('files_groups', ['id', 'title'], [], __FILE__, __LINE__);
		$groups = array_map(function($group){
			return [
				$group['id'],
				$group['title']
			];
		}, $groups);

		json([
			'files' => $files,
			'groups' => $groups
		]);
	}

	if ($query === 'get_list_sorting')
	{
		$files = $db->select('sorting', ['sorting'], ['section' => 'files'], __FILE__, __LINE__);
		$files = $files[0]['sorting'];

		$groups = $db->select('sorting', ['sorting'], ['section' => 'files_groups'], __FILE__, __LINE__);
		$groups = $groups[0]['sorting'];

		json(['files' => $files, 'groups' => $groups]);
	}

	if ($query === 'file_upload')
	{
		$json = $core->files->upload($_FILES);

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);

		json($json);
	}

	if ($query === 'file_upload_sorting')
	{
		$ids = $_POST['ids'];
		$parent = $_POST['parent'];

		$sorting = [];
		foreach ($ids as $id) {
			$sorting[] = $id . ':' . $parent;
		}

		if (!empty($sorting)) {
			$db->query('UPDATE `prefix_sorting` SET `sorting` = CONCAT("' . implode(';', $sorting) . '", ";", `sorting`) WHERE `section` = "files"', __FILE__, __LINE__);

			$db->update('settings', [
				'value' => time()
			], 'variable', 'lastUpdateFilesSorting', __FILE__, __LINE__);
		}

		json(['status' => 'OK']);
	}

	if ($query === 'get_file')
	{
		$file = $db->select('files', '*', ['id' => $_POST['id']], __FILE__, __LINE__);

		$file = isset($file[0]) ? $file[0] : false;

		$json = [
			'status' => $file ? 'OK' : 'FAIL',
			'file' => $file
		];

		json($json);
	}

	if ($query === 'edit_file')
	{
		$id = (int) $_POST['id'];

		$data = [
			'desc'  => $_POST['desc'],
			'title' => $_POST['title']
		];
		if (isset($_POST['crop'])) $data['crop'] = $_POST['crop'];

		$file = $db->select('files', ['filename'], ['id' => $id], __FILE__, __LINE__);
		$filename = $file[0]['filename'];
		$core->files->clearCache(pathinfo($filename, PATHINFO_FILENAME) . '_');

		$result = $db->update('files', $data, 'id', $id, __FILE__, __LINE__);

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		if ($result) $core->cache->clearCache('theme_');

		json($json);
	}

	if ($query === 'file_delete')
	{
		$ids = $_POST['ids'];
		$parent = $_POST['parent'];

		$files = $db->select('files', ['id', 'filename'], ['id' => $ids], __FILE__, __LINE__);
		$files = array_column($files, 'filename', 'id');

		foreach ($ids as $id) {
			$filename = isset($files[$id]) ? $files[$id] : false;

			if (!$filename) continue;

			@unlink(DIR_FILES . $filename);
			$core->files->clearCache(pathinfo($filename, PATHINFO_FILENAME) . '_');
		}

		$result = $db->delete('files', 'id', $ids, __FILE__, __LINE__);

		// sorting
		$sorting = $db->select('sorting', ['sorting'], ['section' => 'files'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		foreach ($sorting as $i => $s) {
			$v = explode(':', $s);
			if (in_array($v[0], $ids)) $sorting[$i] = false;
		}
		$sorting = array_filter($sorting);
		$sorting = implode(';', $sorting);
		$status = $db->update('sorting', ['sorting' => $sorting], 'section', 'files', __FILE__, __LINE__);

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFilesSorting', __FILE__, __LINE__);

		$json['status'] = $result && $status ? 'OK' : 'FAIL';

		if ($result) $core->cache->clearCache('theme_');

		json($json);
	}

	// groups
	if ($query === 'groups_add')
	{
		$data = [
			'user'  => $visitor->id,
			'title' => $_POST['title']
		];

		$json['id'] = $db->insert('files_groups', $data, __FILE__, __LINE__);
		$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

		if ($json['status'] === 'OK') {
			$sorting = $json['id'] . ':' . $_POST['parent'];
			$db->query('UPDATE `prefix_sorting` SET `sorting` = CONCAT(`sorting`, ";", "' . $sorting . '") WHERE `section` = "files_groups"', __FILE__, __LINE__);

			$db->update('settings', [
				'value' => time()
			], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);
			$db->update('settings', [
				'value' => time()
			], 'variable', 'lastUpdateFilesSorting', __FILE__, __LINE__);
		}

		json($json);
	}

	if ($query === 'groups_edit')
	{
		$data = [
			'title' => $_POST['title']
		];

		$status = $db->update('files_groups', $data, 'id', $_POST['id'], __FILE__, __LINE__);
		$json['status'] = $status ? 'OK' : 'FAIL';

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);

		json($json);
	}

	if ($query === 'groups_delete')
	{
		$ids = $_POST['ids'];
		$parent = $_POST['parent'];

		$result = $db->delete('files_groups', 'id', $ids, __FILE__, __LINE__);

		// sorting
		$sorting = $db->select('sorting', ['sorting'], ['section' => 'files_groups'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		foreach ($sorting as $i => $s) {
			$v = explode(':', $s);
			if (in_array($v[0], $ids)) $sorting[$i] = false;
		}
		$sorting = array_filter($sorting);
		$sorting = implode(';', $sorting);
		$status = $db->update('sorting', ['sorting' => $sorting], 'section', 'files_groups', __FILE__, __LINE__);

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFiles', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateFilesSorting', __FILE__, __LINE__);

		$json['status'] = $result && $status ? 'OK' : 'FAIL';

		json($json);
	}
}
?>