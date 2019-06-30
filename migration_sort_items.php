<?php
	require_once('settings.php');
	require_once(DIR_CORE . 'class.Database.php');

	$db = new Database(DB_HOST, DB_NAME, DB_USER, DB_PASS, DB_PREFIX);

	$sort = $db->select('sorting', ['sorting'], ['section' => 'items']);
	$sort = explode(';', $sort[0]['sorting']);

	$items = [];

	foreach ($sort as $s) {
		$s = explode(':', $s);

		if ($s[0] > 0 && ($s[1] > 0 || $s[1] === '#')) {
			if (!isset($items[$s[0]])) $items[$s[0]] = [0, []];
			if (!isset($items[$s[1]])) $items[$s[1]] = [0, []];

			$items[$s[0]][0] = $s[1];
			$items[$s[1]][1][] = $s[0];
		}
	}

	foreach ($items as $i => $v) {
		if ($i === '#') {
			$db->update('settings', ['value' => implode(',', $v[1])], 'variable', 'items_root_sort');
		} else {
			$db->update('items', ['sp' => (int) $v[0], 'sc' => implode(',', $v[1])], 'id', $i);
		}
	}

	echo 'Finish!';
?>