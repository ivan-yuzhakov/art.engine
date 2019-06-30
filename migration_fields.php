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
				$f['eng'] = $el[0] === '{}' ? [] : $el[0];
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

	$fields = $db->select('fields', '*', []);

	foreach ($fields as $i => $v) {
		if (!empty($v['value']) && ($v['type'] === 'select' || $v['type'] === 'checkbox' || $v['type'] === 'multiple_text')) {
			$value = get($v['value']);

			$db->update('fields', [
				'value' => $value
			], 'id', $v['id']);
		}
	}

	echo 'Finish!';
?>