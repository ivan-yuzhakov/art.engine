<?php
if ($section === 'search')
{
	if ($query === 'search')
	{
		$val = $_POST['val'];
		$items = [];
		$files = [];
		$database = [];

		// items
		$f = '%' . mb_strtolower($val, 'UTF-8') . '%';
		$sql = ' WHERE (LOWER(CONCAT(`id`, `private_title`, `public_title`, `alias`, `desc`, `fields`)) LIKE ?)';
		$args = [$f];
		$arr = $db->prepare('SELECT `id`,`image` FROM `prefix_items`' . $sql, $args, __FILE__, __LINE__);

		foreach ($arr as $v) {
			$v['image'] = $helpers->get_langs($v['image']);
			$v['image'] = (int) ($v['image'][$settings['langFrontDefault']] ?: 0);

			$items[] = $v;
		}

		$items = array_map(function($item){
			global $core;

			$data = [$item['id']];

			$file = $core->files->get_file($item['image']);

			if ($file !== false) {
				$image = $core->files->getFileUrl($item['image'], 200, 200);
				$image = str_replace(URL_SITE, '/', $image);
				$data[] = $image;
			}

			return $data;
		}, $items);

		// files
		$f = '%' . mb_strtolower($val, 'UTF-8') . '%';
		$sql = ' WHERE (LOWER(CONCAT(`id`, `title`, `desc`)) LIKE ?)';
		$args = [$f];
		$files = $db->prepare('SELECT `id` FROM `prefix_files`' . $sql, $args, __FILE__, __LINE__);

		$files = array_map(function($item){
			global $core;

			$image = $core->files->getFileUrl($item['id'], 200, 200);
			$image = str_replace(URL_SITE, '/', $image);

			return [
				$item['id'],
				$image
			];
		}, $files);

		// database
		$f = '%' . mb_strtolower($val, 'UTF-8') . '%';
		$sql = ' WHERE (LOWER(CONCAT(`id`, `uid`, `private_title`, `public_title`, `fields`)) LIKE ?) AND (`del` = 0)';
		$args = [$f];
		$arr = $db->prepare('SELECT `id` FROM `prefix_database`' . $sql, $args, __FILE__, __LINE__);

		$database = array_column($arr, 'id');
		$database = array_reverse($database);

		json([
			'val' => $val,
			'items' => $items,
			'files' => $files,
			'database' => $database
		]);
	}
}
?>