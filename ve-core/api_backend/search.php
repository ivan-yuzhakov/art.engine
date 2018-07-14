<?php
if ($section === 'search')
{
	if ($query === 'search')
	{
		$val = $_POST['val'];
		$items = [];
		$files = [];

		// items
		$f = '%' . mb_strtolower($val, 'UTF-8') . '%';
		$sql = ' WHERE (LOWER(CONCAT(`id`, `private_title`, `public_title`, `alias`, `desc`, `fields`)) LIKE ?)';
		$type = ['s'];
		$args = [&$f];
		$stmt = $db->prepare('SELECT `id`,`image` FROM `prefix_items`' . $sql, $type, $args, __FILE__, __LINE__);
		$result = $stmt->get_result();
		$stmt->close();

		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$row['image'] = $helpers->get_langs($row['image']);
				$row['image'] = (int) ($row['image'][$settings['langFrontDefault']] ?: 0);

				$items[] = $row;
			}
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
		$type = ['s'];
		$args = [&$f];
		$stmt = $db->prepare('SELECT `id` FROM `prefix_files`' . $sql, $type, $args, __FILE__, __LINE__);
		$result = $stmt->get_result();
		$stmt->close();

		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$files[] = $row;
			}
		}

		$files = array_map(function($item){
			global $core;

			$image = $core->files->getFileUrl($item['id'], 200, 200);
			$image = str_replace(URL_SITE, '/', $image);

			return [
				$item['id'],
				$image
			];
		}, $files);

		json([
			'val' => $val,
			'items' => $items,
			'files' => $files
		]);
	}
}
?>