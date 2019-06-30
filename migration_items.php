<?php
	require_once('settings.php');
	require_once(DIR_CORE . 'class.Database.php');

	$db = new Database(DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PREFIX);

	function get($str)
	{
		$f = [];
		$str = explode("\r\n", $str);

		foreach ($str as $el) {
			$el = explode('}:', $el);

			if (count($el) === 1) {
				$json = @json_decode($el[0], true);
				if ($json === null) {
					$f['eng'] = $el[0];
				} else {
					$f['eng'] = $json;
				}
			} else {
				$el[0] = str_replace('{', '', $el[0]);
				$json = @json_decode($el[1], true);
				if ($json === null) {
					$f[$el[0]] = $el[1];
				} else {
					$f[$el[0]] = $json;
				}
			}
		}

		return json_encode($f);
	}

	$items = $db->select('items', '*', []);

	foreach ($items as $i => $v) {
		$public_title = get($v['public_title']);
		$meta_title = get($v['meta_title']);
		$meta_desc = get($v['meta_desc']);
		$meta_keys = get($v['meta_keys']);
		$desc = get($v['desc']);
		$image = get($v['image']);
		$fields = get($v['fields']);

		$db->update('items', [
			'public_title' => $public_title,
			'meta_title' => $meta_title,
			'meta_desc' => $meta_desc,
			'meta_keys' => $meta_keys,
			'desc' => $desc,
			'image' => $image,
			'fields' => $fields
		], 'id', $v['id']);
	}

	echo 'Finish!';
?>