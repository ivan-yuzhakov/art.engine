<?php
if ($section === 'database')
{
	if ($query === 'get_list')
	{
		$config = $db->select('settings', ['value'], ['variable' => 'database'], __FILE__, __LINE__);
		$config = json_decode($config[0]['value'], true);

		$items = $db->select('database', '*', ['del' => 0], __FILE__, __LINE__);
		$items = array_map(function($item){
			return [
				$item['id'],
				(int) $item['image'],
				$item['uid'],
				$item['type'],
				$item['unique'],
				$item['private_title'],
				$item['public_title'],
				$item['fields'],
				$item['date_added'],
				$item['date_change'],
				$item['edited']
			];
		}, $items);

		json([
			'config' => $config,
			'items' => $items
		]);
	}
	if ($query === 'get_itemEditions')
	{
		$id = (int) $_POST['id'];
		$ed = [];
		
		$item = $db->select('database', ['id'], ['id' => $id, 'del' => 0, 'unique' => 0], __FILE__, __LINE__);
		if (!empty($item)) {
			$editions = $db->select('editions', ['id'], ['item' => $id], __FILE__, __LINE__);
			if (!empty($editions)) {
				$editions = array_column($editions, 'id');
				$editions_items = $db->select('editions_items', ['captions'], ['edition' => $editions], __FILE__, __LINE__);
				foreach ($editions_items as $el) {
					$json = json_decode($el['captions'], true);
					foreach ($json as $i => $v) {
						if (!isset($ed[$i])) $ed[$i] = [];
						$ed[$i][] = $v;
					}
				}
				foreach ($ed as $i => $v) {
					$val = array_unique($v);
					$val = array_filter($val);
					$val = array_values($val);
					$ed[$i] = $val;
				}
			}
		}

		json(['edition' => $ed]);
	}

	if ($query === 'get_config')
	{
		$config = $db->select('settings', ['value'], ['variable' => 'database'], __FILE__, __LINE__);
		$config = json_decode($config[0]['value'], true);

		$fields = $db->select('fields', ['id', 'private_title'], [], __FILE__, __LINE__);
		$fields = array_map(function($field){
			return [
				$field['id'],
				$field['private_title']
			];
		}, $fields);

		json([
			'config' => $config,
			'fields' => $fields,
		]);
	}

	if ($query === 'set_config')
	{
		$json = $_POST['data'];

		$db->update('settings', ['value' => $json], 'variable', 'database', __FILE__, __LINE__);

		json(['status' => true]);
	}

	if ($query === 'items_add')
	{
		$data = [
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'image'         => (int) $_POST['image'],
			'type'          => (int) $_POST['type'],
			'unique'        => (int) $_POST['unique'],
			'fields'        => $_POST['fields'],
			'date_added'    => time(),
			'date_change'   => time(),
			'edited'        => 0,
			'del'           => 0
		];

		$core->cache->clearCache('theme_');
		$id = $db->insert('database', $data, __FILE__, __LINE__);

		$config = json_decode($settings['database'], true);

		$template = '';
		if (isset($config['uid']['use']) && $config['uid']['use']) {
			$template = $config['uid']['template'];
			foreach ($template as $i => $v) {
				if ($v === 'mask') {
					$template[$i] = $config['uid']['mask'];
				} else if ($v === 'id') {
					$template[$i] = $id;
				} else {
					$fields = json_decode($_POST['fields'], true)[$settings['langFrontDefault']];
					if (isset($fields[$v]) && !empty($fields[$v])) $template[$i] = implode('-', explode(';', $fields[$v]));
				}
			}
			$template = implode('-', $template);
			$db->update('database', ['uid' => $template], 'id', $id, __FILE__, __LINE__);
		}

		$json['id'] = $id;
		$json['uid'] = $template;
		$json['status'] = !!$id;
		$json['date_added'] = $data['date_added'];
		$json['date_change'] = $data['date_change'];

		json($json);
	}

	if ($query === 'get_item_for_edit')
	{
		$id = (int) $_POST['id'];
		$interval = 5*60;

		$draft = $db->select('drafts', ['id', 'value', 'time'], ['section' => 'database', 'item' => $id], __FILE__, __LINE__);
		$draft = count($draft) ? $draft[0] : false;
		if ($draft) $draft['value'] = json_decode($draft['value']);

		$items = $db->select('database', '*', ['id' => $id, 'del' => 0], __FILE__, __LINE__);
		$items = array_map(function($item){
			return [
				$item['id'],
				$item['image'],
				$item['uid'],
				$item['type'],
				$item['unique'],
				$item['private_title'],
				$item['public_title'],
				$item['fields'],
				$item['date_added'],
				$item['date_change'],
				$item['edited']
			];
		}, $items);
		$status = @$items[0][0] === $id;
		$item = $items[0];

		if ($item[10] > 0) {
			if ($draft) {
				if ($draft['time'] + $interval < time()) $item[10] = 0;
			} else {
				if ($item[10] + $interval < time()) $item[10] = 0;
			}
		}

		if ($item[10] === 0) {
			$db->update('database', ['edited' => time()], 'id', $id, __FILE__, __LINE__);
			$db->update('drafts', ['time' => time()], 'id', $draft['id'], __FILE__, __LINE__);
		}

		json([
			'status' => $status,
			'draft' => $draft,
			'item' => $item
		]);
	}

	if ($query === 'close_item_edit')
	{
		$id = (int) $_POST['id'];

		$db->update('database', ['edited' => 0], 'id', $id, __FILE__, __LINE__);

		json([
			'status' => true
		]);
	}

	if ($query === 'items_edit')
	{
		$id = $_POST['id'];
		$data = [
			'uid'           => $_POST['uid'],
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'image'         => (int) $_POST['image'],
			'type'          => (int) $_POST['type'],
			'unique'        => (int) $_POST['unique'],
			'fields'        => $_POST['fields'],
			'date_change'   => time(),
			'edited'        => time()
		];

		$core->cache->clearCache('theme_');
		$result = $db->update('database', $data, 'id', $id, __FILE__, __LINE__);

		$draft = $db->select('drafts', ['id'], ['section' => 'database', 'item' => $id], __FILE__, __LINE__);
		$draft = count($draft) ? $draft[0] : false;
		if ($draft) $db->delete('drafts', 'id', $draft['id'], __FILE__, __LINE__);

		$json['status'] = !!$result;
		$json['date_change'] = $data['date_change'];

		json($json);
	}

	if ($query === 'item_delete')
	{
		$id = (int) $_POST['id'];
		$items = $db->select('database', ['edited'], ['id' => $id, 'del' => 0], __FILE__, __LINE__);
		$item = $items[0] ?: false;

		if ($item === false) {
			$status = false;
		} else if ($item['edited'] > 0) {
			$status = 'edited';
		} else {
			$status = true;
			$core->cache->clearCache('theme_');
			$db->update('database', ['del' => 1], 'id', $id, __FILE__, __LINE__);

			$draft = $db->select('drafts', ['id'], ['section' => 'database', 'item' => $id], __FILE__, __LINE__);
			$draft = count($draft) ? $draft[0] : false;
			if ($draft) $db->delete('drafts', 'id', $draft['id'], __FILE__, __LINE__);
		}

		json(['status' => $status]);
	}

	if ($query === 'items_delete')
	{
		$ids = $_POST['ids'];
		$items = $db->select('database', ['id', 'edited'], ['id' => $ids, 'del' => 0], __FILE__, __LINE__);

		$edited = [];
		$remove = [];
		foreach ($items as $item) {
			if ($item['edited'] > 0) {
				$edited[] = $item['id'];
			} else {
				$remove[] = $item['id'];
				$core->cache->clearCache('theme_');
				$db->update('database', ['del' => 1], 'id', $item['id'], __FILE__, __LINE__);

				$draft = $db->select('drafts', ['id'], ['section' => 'database', 'item' => $item['id']], __FILE__, __LINE__);
				$draft = count($draft) ? $draft[0] : false;
				if ($draft) $db->delete('drafts', 'id', $draft['id'], __FILE__, __LINE__);
			}
		}

		json(['status' => true, 'edited' => $edited, 'remove' => $remove]);
	}

	if ($query === 'item_draft_create')
	{
		$data = [
			'section' => 'database',
			'item'    => $_POST['item'],
			'value'   => $_POST['value'],
			'time'    => time()
		];
		$id = $db->insert('drafts', $data, __FILE__, __LINE__);

		json(['status' => !!$id, 'id' => $id]);
	}

	if ($query === 'item_draft_edit')
	{
		$data = [
			'item'  => $_POST['item'],
			'value' => $_POST['value'],
			'time'  => time()
		];
		$result = $db->update('drafts', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		json(['status' => $result]);
	}

	if ($query === 'item_draft_remove')
	{
		$result = $db->delete('drafts', 'id', $_POST['id'], __FILE__, __LINE__);

		json(['status' => $result]);
	}

	if ($query === 'pdf_get_list')
	{
		$list = $db->select('database_pdf', '*', [], __FILE__, __LINE__);
		$list = array_map(function($el) use($lang) {
			return [
				$el['id'],
				date($lang['global_format_date'], $el['date_create']),
				$el['template'],
				$el['file'],
			];
		}, $list);
		$list = array_reverse($list);

		json($list);
	}

	if ($query === 'pdf_remove')
	{
		$id = (int) $_POST['id'];

		$file = $db->select('database_pdf', ['file'], ['id' => $id], __FILE__, __LINE__);
		$file = DIR_FILES . 'pdf/' . $file[0]['file'];
		if (file_exists($file)) unlink($file);

		$result = $db->delete('database_pdf', 'id', $id, __FILE__, __LINE__);

		json(['status' => $result]);
	}

	if ($query === 'pdf_template_fields')
	{
		$config = json_decode($settings['database']);

		$template = isset($config->pdf_templates) ? $config->pdf_templates[$get[2]] : false;

		if ($template) {
			$items = [];
			require_once DIR_SITE . $template[1];
		}
		$request = isset($template['request']) ? $template['request'] : [];

		json([
			'status' => true,
			'request' => $request
		]);
	}

	if ($query === 'pdf_create')
	{
		$ids = $_POST['items'];
		$path = (int) $_POST['template'];
		$lang = $_POST['lang'];
		$lang_default = $settings['langFrontDefault'];

		$path = json_decode($settings['database'], true)['pdf_templates'][$path];
		$path_name = $path[0];
		$path = DIR_SITE . $path[1];

		if (!file_exists($path)) {
			echo 'Template does not exist: ' . $path;
			die;
		}

		$fields = $db->select('fields', ['id', 'type', 'value'], [], __FILE__, __LINE__);
		$fields = array_column($fields, null, 'id');
		$fields = array_map(function($field) use($lang, $lang_default) {
			global $helpers;

			$value = $helpers->get_langs($field['value']);
			if (isset($value[$lang])) {
				$value = $value[$lang];
			} else if (isset($title[$lang_default])) {
				$value = $value[$lang_default];
			} else {
				$value = '';
			}

			$field['value'] = $value;

			return $field;
		}, $fields);

		$items = $db->select('database', '*', ['id' => $ids, 'del' => 0], __FILE__, __LINE__);
		$items = array_column($items, null, 'id');
		$items = array_map(function($item) use($lang, $lang_default) {
			global $core;

			$uid = $item['uid'];
			$image = (int) $item['image'];
			$image = '<img src="' . $core->files->getFileUrl($image) . '">';
			$title = $item['public_title'];
			$title = json_decode($title, true);
			if (isset($title[$lang])) {
				$title = $title[$lang];
			} else if (isset($title[$lang_default])) {
				$title = $title[$lang_default];
			} else {
				$title = '';
			}

			$f = $item['fields'];
			$f = json_decode($f, true);
			if (isset($f[$lang])) {
				$f = $f[$lang];
			} else if (isset($f[$lang_default])) {
				$f = $f[$lang_default];
			} else {
				$f = [];
			}

			return ['uid' => $uid, 'title' => $title, 'image' => $image] + $f;
		}, $items);

		$replace_item = function($text, $id, $processing = []) use($items, $fields, $lang, $lang_default) {
			// replace title, uid
			$text = preg_replace_callback('/{{(title|uid|image)}}/', function($matches) use($items, $id) {
				$find = $matches[1];

				return $items[$id][$find];
			}, $text);

			// replace ID fields
			$text = preg_replace_callback('/{{(\d+)}}/', function($matches) use($processing, $fields, $items, $id, $lang, $lang_default) {
				global $core;

				$find = $matches[1];
				$value = $items[$id][$find] ?: '';

				if (isset($processing[$find])) {
					return $processing[$find]($value, @$fields[$find]);
				} else {
					$f_type = @$fields[$find]['type'];
					$f_value = @$fields[$find]['value'];

					switch ($f_type) {
						case 'text':
							
							break;

						case 'multiple_text':
							$value = explode('~;~', $value);
							$value = array_filter($value);
							$value = array_map(function($v){
								$q = explode('~:~', $v);
								return '<span>' . $q[1] . '</span>';
							}, $value);
							$value = implode('', $value);
							break;

						case 'textarea':
							
							break;

						case 'tinymce':
							
							break;

						case 'checkbox':
							$value = explode(';', $value);
							$value = array_filter($value);
							$temp = [];
							foreach ($value as $el) {
								$temp[] = '<span>' . $f_value[$el] . '</span>';
							}
							$value = implode('', $temp);
							break;

						case 'select':
							if (isset($f_value[$value])) {
								$value = '<span>' . $f_value[$value] . '</span>';
							}
							break;

						case 'file':
							$value = '<img src="' . $core->files->getFileUrl($value) . '">';
							break;

						case 'multiple_files':
							$value = explode(',', $value);
							$value = array_filter($value);
							$value = array_map(function($el){
								global $core;

								return '<img src="' . $core->files->getFileUrl($el) . '">';
							}, $value);
							$value = implode('', $value);
							break;

						case 'video':
							$value = explode('~;~', $value);
							$value = array_filter($value);
							$value = array_map(function($el){
								$v = explode(';', $el);

								if ($v[0] === 'youtube') {
									return '<a href="//youtu.be/' . $v[1] . '" target="_blank">youtu.be/' . $v[1] . '</a>';
								}
								if ($v[0] === 'vimeo') {
									return '<a href="//vimeo.com/' . $v[1] . '" target="_blank">vimeo.com/' . $v[1] . '</a>';
								}
							}, $value);
							$value = implode('', $value);
							break;

						case 'date':
							$value = date('j F, Y', (int) $value);
							break;

						case 'calendar':
							$value = explode('~;~', $value);
							$value = array_filter($value);
							$value = array_map(function($el){
								$date = explode(',', $el);
								
								return '<span>' . date('j F, Y', $date[0]) . ', ' . date('g:i A', $date[1]) . ' - ' . date('g:i A', $date[2]) . '</span>';
							}, $value);
							$value = implode('', $value);
							break;

						case 'color':
							
							break;

						case 'users':
							// TODO
							break;

						case 'flag':
							$value = ($value == 1);
							$value = $value ? 'Yes' : 'No';
							break;

						case 'items':
							if (!empty($value)) {
								$value = explode(';', $value);
								$value = array_map(function($id) use($lang, $lang_default) {
									global $db, $helpers;

									$item = $db->select('items', ['public_title'], ['id' => $id], __FILE__, __LINE__);
									$item = $item[0] ?: false;

									if ($item !== false) {
										$title = $helpers->get_langs($item['public_title']);
										if (isset($title[$lang])) {
											$title = $title[$lang];
										} else if (isset($title[$lang_default])) {
											$title = $title[$lang_default];
										} else {
											$title = '';
										}

										return '<span>' . $title . '</span>';
									}
								}, $value);
								$value = array_filter($value);
								$value = array_values($value);
								$value = implode('', $value);
							}
							break;
					}

					return $value;
				}
			}, $text);

			// replace other
			$text = preg_replace_callback('/\{\{([^}]+)\}\}/', function($matches) use($processing, $fields, $items, $id) {
				$find = $matches[1];

				if (isset($processing[$find])) {
					return $processing[$find]($items[$id], $fields);
				} else {
					return '{!' . $find . ' - not processed!}';
				}
			}, $text);

			return $text;
		};

		require_once $path;
		require_once DIR_SITE . 'vendor/autoload.php';

		$config = array_merge([
			'title' => 'PDF.pdf',
			'html' => [],
			'fonts_dir' => DIR_THEME . 'fonts',
			'fonts' => [],
			'default_font_size' => 12,
			'default_font' => 'sans',
			'headers' => false,
			'footers' => false,
			'processing' => []
		], $template);

		$defaultConfig = (new Mpdf\Config\ConfigVariables())->getDefaults();
		$fontDirs = $defaultConfig['fontDir'];
		$defaultFontConfig = (new Mpdf\Config\FontVariables())->getDefaults();
		$fontData = $defaultFontConfig['fontdata'];

		$mpdf = new \Mpdf\Mpdf([
			'fontDir' => array_merge($fontDirs, [$config['fonts_dir']]),
			'fontdata' => $fontData + $config['fonts'],
			'default_font' => $config['default_font'],
			'setAutoTopMargin' => $config['headers'] === false ? false : 'stretch',
			'setAutoTopMargin' => $config['footers'] === false ? false : 'stretch'
		]);

		foreach ($config['html'] as $text) {
			$text = preg_replace_callback('/\{\{([^}]+)\}\}/', function($matches) use($config, $fields, $items) {
				$find = $matches[1];

				if (isset($config['processing'][$find])) {
					return $config['processing'][$find]($items, $fields);
				} else {
					return '{{' . $find . ' - not processed}}';
				}
			}, $text);

			if ($config['headers'] !== false) $mpdf->SetHTMLHeader($config['headers']);
			if ($config['footers'] !== false) $mpdf->SetHTMLFooter($config['footers']);

			$mpdf->AddPage();
			$mpdf->WriteHTML($text);
		}

		// Add to DB
		$id = $db->insert('database_pdf', [
			'date_create' => time(),
			'template' => $path_name,
			'file' => '0',
		], __FILE__, __LINE__);
		$filename = $id . '_' . $config['title'];
		$db->update('database_pdf', [
			'file' => $filename,
		], 'id', $id, __FILE__, __LINE__);

		$mpdf->Output(DIR_FILES . 'pdf/' . $filename, 'F');

		json(['status' => true]);
	}

	if ($query === 'get_itemsById') // for field type base
	{
		$ids = $_POST['ids'];

		$config = json_decode($settings['database'], true);

		$fields = ['id', 'fields'];
		if (in_array('uid', $config['display'])) $fields[] = 'uid';
		if (in_array('title', $config['display'])) $fields[] = 'private_title';
		if (in_array('date_added', $config['display'])) $fields[] = 'date_added';
		$items = $db->select('database', $fields, ['id' => $ids, 'del' => 0], __FILE__, __LINE__);
		$items = array_map(function($item) use ($config) {
			global $settings;

			$item['fields'] = json_decode($item['fields'], true)[$settings['langFrontDefault']];
			$item['fields'] = array_filter($item['fields'], function($key) use ($config) {
				return in_array($key, $config['display']);
			}, ARRAY_FILTER_USE_KEY);
			$item['title'] = $item['private_title'];
			unset($item['private_title']);

			return $item;
		}, $items);

		json([
			'base' => ['fields' => $config['display']],
			'items' => $items
		]);
	}

	if ($query === 'get_itemsByBase') // for field type base
	{
		$config = json_decode($settings['database'], true);

		$fields = ['id', 'fields'];
		if (in_array('uid', $config['display'])) $fields[] = 'uid';
		if (in_array('image', $config['display'])) $fields[] = 'image';
		if (in_array('title', $config['display'])) $fields[] = 'private_title';
		if (in_array('date_added', $config['display'])) $fields[] = 'date_added';
		$items = $db->select('database', $fields, ['del' => 0], __FILE__, __LINE__);
		$items = array_map(function($item) use ($config) {
			global $settings;

			$item['fields'] = json_decode($item['fields'], true)[$settings['langFrontDefault']];
			$item['fields'] = array_filter($item['fields'], function($key) use ($config) {
				return in_array($key, $config['display']);
			}, ARRAY_FILTER_USE_KEY);
			$item['title'] = $item['private_title'];
			unset($item['private_title']);

			return $item;
		}, $items);

		json([
			'base' => ['fields' => $config['display']],
			'items' => $items
		]);
	}

	if ($query === 'edition_get_editions')
	{
		$id = (int) $_POST['id'];

		$items = $db->select('editions', '*', ['item' => $id], __FILE__, __LINE__);

		json([
			'items' => $items
		]);
	}
	if ($query === 'edition_create_edition')
	{
		$title = $_POST['title'];
		$count = (int) $_POST['count'];
		$type = (int) $_POST['type'];
		$status = (int) $_POST['status'];
		$password = (int) $_POST['password'];
		$item = (int) $_POST['item'];
		$captions = $_POST['captions'];

		$id = $db->insert('editions', [
			'item' => $item,
			'title' => $title
		], __FILE__, __LINE__);

		function generate(){
			global $db;

			$chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
			$numChars = strlen($chars);
			$pass = '';

			for ($i = 0; $i < 6; $i++) {
				$pass .= substr($chars, rand(1, $numChars) - 1, 1);
			}

			$items = $db->select('editions_items', ['id'], ['password' => $pass], __FILE__, __LINE__);

			if (empty($items)) {
				return $pass;
			} else {
				return generate();
			}
		}

		for ($i = 1; $i <= $count; $i++) {
			$pass = '';
			if ($password === 1) $pass = generate();

			$db->insert('editions_items', [
				'edition' => $id,
				'n' => $i,
				'type' => $type,
				'status' => $status,
				'fields' => '',
				'captions' => $captions,
				'password' => $pass,
				'note' => '',
			], __FILE__, __LINE__);
		}

		json([
			'id' => $id
		]);
	}
	if ($query === 'edition_edit_edition')
	{
		$id = (int) $_POST['id'];
		$title = $_POST['title'];
		$captions = json_decode($_POST['captions'], true);

		$db->update('editions', [
			'title' => $title
		], 'id', $id, __FILE__, __LINE__);

		$items = $db->select('editions_items', ['id', 'captions'], ['edition' => $id], __FILE__, __LINE__);
		foreach ($items as $item) {
			$c = $item['captions'];
			if (empty($c)) $c = '{}';
			$c = json_decode($c, true);
			foreach ($captions as $id => $val) {
				if (!isset($c[$id])) $c[$id] = $val;
			}
			$db->update('editions_items', [
				'captions' => json_encode($c),
			], 'id', $item['id'], __FILE__, __LINE__);
		}

		json([
			'status' => true,
			
		]);
	}
	if ($query === 'edition_remove_edition')
	{
		$id = (int) $_POST['id'];

		$db->delete('editions', 'id', $id, __FILE__, __LINE__);
		$db->delete('editions_items', 'edition', $id, __FILE__, __LINE__);

		json([
			'status' => true
		]);
	}
	if ($query === 'edition_get_items')
	{
		$id = (int) $_POST['id'];

		$items = $db->select('editions_items', '*', ['edition' => $id], __FILE__, __LINE__);

		$items = array_map(function($item){
			return [
				$item['id'],
				$item['n'],
				$item['type'],
				$item['status'],
				$item['fields'],
				$item['captions'],
				$item['password'],
				$item['note']
			];
		}, $items);
		usort($items, function($a, $b){
			$a = $a[1];
			$b = $b[1];

			if ($a == $b) return 0;
			return ($a < $b) ? -1 : 1;
		});

		json([
			'items' => $items
		]);
	}
	if ($query === 'edition_set_item_status')
	{
		$id = (int) $_POST['id'];
		$status = (int) $_POST['status'];

		$db->update('editions_items', ['status' => $status], 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}
	if ($query === 'edition_set_item_fields')
	{
		$id = (int) $_POST['id'];
		$fields = $_POST['fields'];

		$db->update('editions_items', ['fields' => $fields], 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}
	if ($query === 'edition_set_item_note')
	{
		$id = (int) $_POST['id'];
		$note = $_POST['note'];

		$db->update('editions_items', ['note' => $note], 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}
	if ($query === 'edition_set_item_captions')
	{
		$id = (int) $_POST['id'];
		$captions = $_POST['captions'];

		$db->update('editions_items', ['captions' => $captions], 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}
	if ($query === 'edition_find_fields')
	{
		$id = (int) $_POST['id'];
		$str = $_POST['str'];
		$data = $_POST['data'];

		$items = [];
		$sql = [];
		foreach ($str as $s) {
			$sql[] = 'LOWER(`fields`) LIKE "%' . mb_strtolower($s, 'UTF-8') . '%"';
		}
		$result = $db->query('SELECT `fields` FROM `prefix_editions_items` WHERE (' . implode(' AND ', $sql) . ' AND `id` != ' . $id . ')', __FILE__, __LINE__);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$items[] = $row;
			}
		}
		$items = array_column($items, 'fields', null);
		foreach ($items as $i => $f) {
			$items[$i] = $f = json_decode($f, true);
			$valid = true;
			foreach ($str as $s) {
				if (!isset($f[$data])) {
					$valid = false;
					break;
				}
				$pos = stripos($f[$data], $s);
				if ($pos === false) {
					$valid = false;
					break;
				}
			}
			if ($valid === false) $items[$i] = false;
		}
		$items = array_filter($items);
		$items = array_values($items);
		$items = array_column($items, $data, null);
		$items = array_unique($items);

		json(['status' => true, 'items' => $items]);
	}
}
?>