<?php
class Plugin_bases_page
{
	public function get_list()
	{
		global $db;

		$bases = $db->select('bases', '*', [], __FILE__, __LINE__);
		$bases = array_map(function($base){
			return [
				$base['id'],
				$base['title'],
				$base['fields'],
				$base['date_added'],
				$base['date_change']
			];
		}, $bases);

		$items = $db->select('bases_items', '*', [], __FILE__, __LINE__);
		$items = array_map(function($item){
			return [
				$item['id'],
				$item['base'],
				$item['uid'],
				$item['private_title'],
				$item['public_title'],
				$item['fields'],
				$item['date_added'],
				$item['date_change']
			];
		}, $items);

		json([
			'bases' => $bases,
			'items' => $items
		]);
	}

	public function bases_add()
	{
		global $db, $core;

		$data = [
			'title'       => $_POST['title'],
			'fields'      => $_POST['fields'],
			'date_added'  => time(),
			'date_change' => time(),
		];

		$core->cache->clearCache('theme_');
		$id = $db->insert('bases', $data, __FILE__, __LINE__);

		$json['id'] = $id;
		$json['status'] = $id > 0 ? 'OK' : 'FAIL';
		$json['date_added'] = $data['date_added'];
		$json['date_change'] = $data['date_change'];

		json($json);
	}

	public function bases_edit()
	{
		global $db, $core;

		$data = [
			'title'       => $_POST['title'],
			'fields'      => $_POST['fields'],
			'date_change' => time(),
		];

		$core->cache->clearCache('theme_');
		$result = $db->update('bases', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	public function bases_delete()
	{
		global $db, $core;

		$core->cache->clearCache('theme_');
		$result1 = $db->delete('bases', 'id', $_POST['id'], __FILE__, __LINE__);
		$result2 = $db->delete('bases_items', 'base', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result1 && $result2 ? 'OK' : 'FAIL';

		json($json);
	}

	private function get_base($id)
	{
		global $db;

		$bases = $db->select('bases', '*', ['id' => $id], __FILE__, __LINE__);

		$base = $bases[0];
		$base['fields'] = json_decode($base['fields'], true);

		return $base;
	}

	public function items_add()
	{
		global $db, $core, $settings;

		$data = [
			'base'          => $_POST['base'],
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'fields'        => $_POST['fields'],
			'date_added'    => time(),
			'date_change'   => time(),
		];

		$core->cache->clearCache('theme_');
		$id = $db->insert('bases_items', $data, __FILE__, __LINE__);

		$base = $this->get_base($_POST['base']);
		$template = '';
		if (isset($base['fields']['uid']['use']) && $base['fields']['uid']['use']) {
			$template = $base['fields']['uid']['template'];
			foreach ($template as $i => $v) {
				if ($v === 'mask') {
					$template[$i] = $base['fields']['uid']['mask'];
				} else if ($v === 'id') {
					$template[$i] = $id;
				} else {
					$fields = json_decode($_POST['fields'], true)[$settings['langFrontDefault']];
					if (isset($fields[$v]) && !empty($fields[$v])) $template[$i] = implode('-', explode(';', $fields[$v]));
				}
			}
			$template = implode('-', $template);
			$db->update('bases_items', ['uid' => $template], 'id', $id, __FILE__, __LINE__);
		}

		$json['id'] = $id;
		$json['uid'] = $template;
		$json['status'] = $id ? 'OK' : 'FAIL';
		$json['date_added'] = $data['date_added'];
		$json['date_change'] = $data['date_change'];

		json($json);
	}

	public function items_edit()
	{
		global $db, $core;

		$data = [
			'uid'           => $_POST['uid'],
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'fields'        => $_POST['fields'],
			'date_change'   => time(),
		];

		$core->cache->clearCache('theme_');
		$result = $db->update('bases_items', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $json['status'] = $result ? 'OK' : 'FAIL';
		$json['date_change'] = $data['date_change'];

		json($json);
	}

	public function items_delete()
	{
		global $db, $core;

		$core->cache->clearCache('theme_');
		$result = $db->delete('bases_items', 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	public function items_pdf_templates()
	{
		global $db;

		$bases = $db->select('plugins', ['fields'], ['alias' => 'bases'], __FILE__, __LINE__);
		$bases = json_decode($bases[0]['fields']);

		$templates = isset($bases->pdf_templates) ? $bases->pdf_templates : [];
		$templates = array_map(function($el){
			$items = [];

			require_once DIR_SITE . $el[1];

			$el[2] = isset($template['request']) ? $template['request'] : [];

			return $el;
		}, $templates);

		json([
			'status' => 'OK',
			'templates' => $templates
		]);
	}

	public function items_pdf()
	{
		global $db, $helpers, $settings;

		$ids = explode(',', $_GET['id']);
		$path = (int) $_GET['path'];
		$lang = $_GET['lang'];
		$lang_default = $settings['langFrontDefault'];

		$plugin = $db->select('plugins', ['fields'], ['alias' => 'bases'], __FILE__, __LINE__);
		$plugin = json_decode($plugin[0]['fields'], true)['pdf_templates'];

		$path = DIR_SITE . $plugin[$path][1];

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

		$items = $db->select('bases_items', '*', ['id' => $ids], __FILE__, __LINE__);
		$items = array_column($items, null, 'id');
		$items = array_map(function($item) use($lang, $lang_default) {
			$uid = $item['uid'];
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

			return ['uid' => $uid, 'title' => $title] + $f;
		}, $items);

		$replace_item = function($text, $id, $processing = []) use($items, $fields, $lang, $lang_default) {
			// replace title, uid
			$text = preg_replace_callback('/{{(title|uid)}}/', function($matches) use($items, $id) {
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
		require_once DIR_SITE . 've-plugins/bases/pdf/mpdf/index.php';

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

		$mpdf->Output($config['title'], 'I');
	}

	public function get_itemsById()
	{ // for field type base
		global $db;

		$base = (int) $_POST['base'];
		$ids = $_POST['ids'];

		$base = $db->select('bases', ['fields'], ['id' => $base], __FILE__, __LINE__);
		$base = $base[0];
		$base['fields'] = json_decode($base['fields'], true)['table'];

		$fields = ['id', 'fields'];
		if (in_array('uid', $base['fields'])) $fields[] = 'uid';
		if (in_array('title', $base['fields'])) $fields[] = 'private_title';
		if (in_array('date_added', $base['fields'])) $fields[] = 'date_added';
		$items = $db->select('bases_items', $fields, ['id' => $ids], __FILE__, __LINE__);
		$items = array_map(function($item) use ($base) {
			global $settings;

			$item['fields'] = json_decode($item['fields'], true)[$settings['langFrontDefault']];
			$item['fields'] = array_filter($item['fields'], function($key) use ($base) {
				return in_array($key, $base['fields']);
			}, ARRAY_FILTER_USE_KEY);
			$item['title'] = $item['private_title'];
			unset($item['private_title']);

			return $item;
		}, $items);

		json([
			'base' => $base,
			'items' => $items
		]);
	}

	public function get_itemsByBase()
	{ // for field type base
		global $db;

		$id = (int) $_POST['base'];

		$base = $db->select('bases', ['title', 'fields'], ['id' => $id], __FILE__, __LINE__);
		$base = $base[0];
		$base['fields'] = json_decode($base['fields'], true)['table'];

		$fields = ['id', 'fields'];
		if (in_array('uid', $base['fields'])) $fields[] = 'uid';
		if (in_array('title', $base['fields'])) $fields[] = 'private_title';
		if (in_array('date_added', $base['fields'])) $fields[] = 'date_added';
		$items = $db->select('bases_items', $fields, ['base' => $id], __FILE__, __LINE__);
		$items = array_map(function($item) use ($base) {
			global $settings;

			$item['fields'] = json_decode($item['fields'], true)[$settings['langFrontDefault']];
			$item['fields'] = array_filter($item['fields'], function($key) use ($base) {
				return in_array($key, $base['fields']);
			}, ARRAY_FILTER_USE_KEY);
			$item['title'] = $item['private_title'];
			unset($item['private_title']);

			return $item;
		}, $items);

		json([
			'base' => $base,
			'items' => $items
		]);
	}

	public function get_cifs()
	{ // for create items from selected
		global $db;

		$sorting = $db->select('sorting', ['sorting'], ['section' => 'items'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		$sorting = array_map(function($v){
			return explode(':', $v);
		}, $sorting);
		$sorting = array_column($sorting, 1, 0);

		$items = $db->select('items', ['id', 'private_title'], [], __FILE__, __LINE__);
		$items = array_map(function($item) use($sorting) {
			$id = $item['id'];
			$title = $item['private_title'];
			$parent = $sorting[$id] === '#' ? '#' : (int) $sorting[$id];
			$childs = [];
			foreach ($sorting as $i => $v) {
				if ($v == $id) $childs[] = $i;
			}

			return [$id, $title, $parent, $childs];
		}, $items);

		// add root
		$childs = [];
		foreach ($sorting as $i => $v) {
			if ($v === '#') $childs[] = $i;
		}
		$items[] = ['#','','',$childs];

		json(['items' => $items]);
	}

	public function set_cifs()
	{ // for create items from selected
		global $db, $core;

		$ids = $_POST['ids'];
		$parent = $_POST['id'];

		$bases = $db->select('bases_items', ['id', 'uid', 'private_title', 'public_title', 'fields'], ['id' => $ids], __FILE__, __LINE__);
		$bases = array_column($bases, null, 'id');
		$bases = array_map(function($base){
			$public_title = json_decode($base['public_title'], true);
			$public_title_new = [];
			foreach ($public_title as $lang => $val) {
				$public_title_new[] = '{' . $lang . '}:' . $val;
			}
			$base['public_title'] = implode("\r\n", $public_title_new);

			$fields = json_decode($base['fields'], true);
			$fields_new = [];
			foreach ($fields as $lang => $val) {
				$fields_new[] = '{' . $lang . '}:' . json_encode($val);
			}
			$base['fields'] = implode("\r\n", $fields_new);

			return $base;
		}, $bases);

		function str_random(){
			$chars = '0123456789';
			$numChars = strlen($chars);
			$string = '';

			for ($i = 0; $i < 20; $i++) {
				$string .= substr($chars, rand(1, $numChars) - 1, 1);
			}

			return $string;
		}
		function alias_req($str){
			global $db, $helpers;

			$alias = $helpers->get_translit($str);

			if (empty($alias)) return alias_req(str_random());

			$items = $db->select('items', ['id'], ['alias' => $alias], __FILE__, __LINE__);

			if (empty($items)) {
				return $alias;
			} else {
				return alias_req(str_random());
			}
		}

		$sorting = [];

		foreach ($ids as $id) {
			$base = $bases[$id];
			// TODO UID

			$data = [
				'user'          => (isset($visitor->id) ? $visitor->id : -1),
				'show'          => 0,
				'views'         => 0,
				'private_title' => $base['private_title'],
				'public_title'  => $base['public_title'],
				'alias'         => alias_req($base['private_title']),
				'meta_title'    => '',
				'meta_desc'     => '',
				'meta_keys'     => '',
				'desc'          => '',
				'image'         => '',
				'fields'        => $base['fields'],
				'group'         => 0,
				'date_added'    => time(),
				'date_change'   => time(),
			];

			$id = $db->insert('items', $data, __FILE__, __LINE__);

			$sorting[] = $id . ':' . $parent;
		}

		$db->query('UPDATE `prefix_sorting` SET `sorting` = CONCAT("' . implode(';', $sorting) . '", ";", `sorting`) WHERE `section` = "items"', __FILE__, __LINE__);

		$core->cache->clearCache('theme_');

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItemsSorting', __FILE__, __LINE__);

		json(['status' => true]);
	}
}

$plugin_bases_page = new Plugin_bases_page($plugin);

if ($query === 'get_list') $plugin_bases_page->get_list();
if ($query === 'bases_add') $plugin_bases_page->bases_add();
if ($query === 'bases_edit') $plugin_bases_page->bases_edit();
if ($query === 'bases_delete') $plugin_bases_page->bases_delete();
if ($query === 'items_add') $plugin_bases_page->items_add();
if ($query === 'items_edit') $plugin_bases_page->items_edit();
if ($query === 'items_delete') $plugin_bases_page->items_delete();
if ($query === 'items_pdf_templates') $plugin_bases_page->items_pdf_templates();
if ($query === 'items_pdf') $plugin_bases_page->items_pdf();
if ($query === 'get_itemsById') $plugin_bases_page->get_itemsById();
if ($query === 'get_itemsByBase') $plugin_bases_page->get_itemsByBase();
if ($query === 'get_cifs') $plugin_bases_page->get_cifs();
if ($query === 'set_cifs') $plugin_bases_page->set_cifs();
?>