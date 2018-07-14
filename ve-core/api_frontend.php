<?php
class Template
{
	public $meta_title = false;
	public $meta_image = false;
	public $meta_desc = false;
	public $meta_keys = false;

	private $sorting = [];
	public $items = [];

	public function get_lang_fields($field, $isJSON = false)
	{
		global $settings, $visitor;

		$lang_current = $visitor->lang;
		$lang_default = $settings['langFrontDefault'];
		$find_current = false;
		$find_default = false;

		$fields = explode("\r\n", $field);

		foreach ($fields as $el) {
			$pos_current = strpos($el, '{' . $lang_current . '}:');
			$pos_default = strpos($el, '{' . $lang_default . '}:');
			if ($pos_current === 0) $find_current = str_replace('{' . $lang_current . '}:', '', $el);
			if ($pos_default === 0) $find_default = str_replace('{' . $lang_default . '}:', '', $el);
		}

		if ($find_current !== false && ($isJSON ? $find_current != '{}' : !empty($find_current))) return $find_current;
		if ($find_default !== false) return $find_default;

		return $field;
	}

	public function get_sorting($section)
	{
		global $db;

		if (!isset($this->sorting[$section])) {
			$sorting = $db->select('sorting', '*', ['section' => $section], __FILE__, __LINE__);
			$sorting = array_column($sorting, 'sorting', 'section');
			$sorting = array_map(function($v){
				$sort = explode(';', $v);
				$sort = array_map(function($s){
					return explode(':', $s);
				}, $sort);

				return $sort;
			}, $sorting);

			$sort = $sorting[$section];

			$sorting = [];
			foreach ($sort as $s) {
				$sorting[$s[0]]['parent'] = $s[1];
				$sorting[$s[1]]['childs'][] = $s[0];
			}

			$this->sorting[$section] = $sorting;
		}

		return $this->sorting[$section];
	}

	public function get_items($parent, $show_disabled = false)
	{
		global $db;

		$id = is_array($parent) ? $parent['id'] : $parent;
		if ($id !== '#') $id = (int) $id;

		if ($id === 0) return [];

		$sorting = $this->get_sorting('items');
		$childs = isset($sorting[$id]) && isset($sorting[$id]['childs']) ? $sorting[$id]['childs'] : [];

		if (empty($childs)) return [];

		$type = [];
		$args = [];

		$sql = [];
		foreach ($childs as $i => $id) {
			$sql[] = '`id`=?';
			$type[] = 'i';
			$args[] = &$childs[$i];
		}
		$sql = ' WHERE (' . implode(' OR ', $sql) . ')' . ($show_disabled ? '' : ' AND `show`=1');

		$stmt = $db->prepare('SELECT * FROM `prefix_items`' . $sql, $type, $args, __FILE__, __LINE__);

		$result = $stmt->get_result();
		$stmt->close();

		$arr = [];
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$item = $this->get_item_parse($row);
				$arr[$item['id']] = $item;
			}
		}

		$items = [];
		foreach ($childs as $i => $id) {
			if (isset($arr[$id])) $items[] = $arr[$id];
		}

		return $items;
	}

	public function get_itemById($id, $show_disabled = false)
	{
		global $db;

		$id = (int) $id;

		if ($id === 0) return false;

		$data = ['id' => $id, 'show' => 1];
		if ($show_disabled) unset($data['show']);

		$items = $db->select('items', '*', $data, __FILE__, __LINE__);

		$item = empty($items) ? false : $items[0];

		return $this->get_item_parse($item);
	}

	public function get_itemByAlias($alias, $show_disabled = false)
	{
		global $db;

		if (empty($alias)) return false;

		$data = ['alias' => $alias, 'show' => 1];
		if ($show_disabled) unset($data['show']);

		$items = $db->select('items', '*', $data, __FILE__, __LINE__);

		$item = empty($items) ? false : $items[0];

		return $this->get_item_parse($item);
	}

	public function get_itemParent($item = false)
	{
		if ($item === false) return $item;

		$sorting = $this->get_sorting('items');
		$id = (int) $sorting[$item['id']]['parent'];
		$parent = $this->get_itemById($id, true);

		return $parent;
	}

	public function get_itemPrev($item = false)
	{
		if ($item === false) return $item;

		$sorting = $this->get_sorting('items');

		$id_item = $item['id'];
		$id_parent = $sorting[$id_item]['parent'];

		$childs = $sorting[$id_parent]['childs'];
		$index = array_search($id_item, $childs);
		$prev = $this->get_itemById(@$childs[$index - 1], true);

		return $prev;
	}

	public function get_itemNext($item = false)
	{
		if (!$item) return false;

		$sorting = $this->get_sorting('items');

		$id_item = $item['id'];
		$id_parent = $sorting[$id_item]['parent'];

		$childs = $sorting[$id_parent]['childs'];
		$index = array_search($id_item, $childs);
		$next = $this->get_itemById(@$childs[$index + 1], true);

		return $next;
	}

	public function get_item_parse($item)
	{
		if ($item === false) return $item;

		$id = $item['id'];

		if (!isset($this->items[$id])) {
			$item['public_title'] = $this->get_lang_fields($item['public_title']);
			$item['meta_title'] = $this->get_lang_fields($item['meta_title']);
			$item['meta_desc'] = $this->get_lang_fields($item['meta_desc']);
			$item['meta_keys'] = $this->get_lang_fields($item['meta_keys']);
			$item['desc'] = $this->get_lang_fields($item['desc']);
			$item['image'] = $this->get_lang_fields($item['image']);
			$item['fields'] = $this->get_lang_fields($item['fields'], true);

			$item['desc'] = str_replace('~^~', '"', htmlspecialchars_decode($item['desc']));

			$item['fields'] = empty($item['fields']) ? '{}' : $item['fields'];
			$item['fields'] = json_decode($item['fields'], true);
			if (is_array($item['fields'])) {
				foreach ($item['fields'] as $index => $value) {
					$item['fields'][$index] = str_replace('~^~', '"', htmlspecialchars_decode($value));
				}
			}

			$this->items[$id] = $item;
		}

		return $this->items[$id];
	}

	public function get_files($ids = [])
	{
		global $db;

		if (!is_array($ids) || empty($ids)) return [];

		$type = [];
		$args = [];

		$sql = [];
		foreach ($ids as $i => $id) {
			$sql[] = '`id`=?';
			$type[] = 'i';
			$args[] = &$ids[$i];
		}
		$sql = ' WHERE (' . implode(' OR ', $sql) . ')';

		$stmt = $db->prepare('SELECT * FROM `prefix_files`' . $sql, $type, $args, __FILE__, __LINE__);

		$result = $stmt->get_result();
		$stmt->close();

		$arr = [];
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[$row['id']] = $row;
			}
		}

		$items = [];
		foreach ($ids as $i => $id) {
			if (isset($arr[$id])) $items[] = $arr[$id];
		}

		return $items;
	}

	// Instagram
	private $instagram = false;

	private function instagram_start($access_token)
	{
		global $settings;

		if ($this->instagram === false) {
			require_once(DIR_CORE . 'library/class.instagram.php');
			$this->instagram = new Instagram($access_token);
		}
	}

	public function instagram_getFeed($username = false, $count = 10, $cache_minutes = 1440)
	{
		global $core, $settings;

		$access_token = $settings['instagramAccessToken'];

		if (empty($username)) return 'User name is empty';
		if (empty($access_token)) return 'Instagram Access Token is empty';

		$this->instagram_start($access_token);

		$key = 'instagram_user_' . $username;
		$cache = $core->cache->getCache($key);
		if ($cache) {
			$user_id = $cache;
		} else {
			$user_id = $this->instagram->get_user($username);
			$core->cache->setCache($key, $user_id, $cache_minutes * 60);
		}

		if (empty($user_id)) return 'User undefined';

		$key = 'instagram_feed_' . $username;
		$cache = $core->cache->getCache($key);
		if ($cache) {
			$feed = $cache;
		} else {
			$feed = $this->instagram->get_feed($user_id, $count);
			$core->cache->setCache($key, $feed, $cache_minutes * 60);
		}

		return $feed;
	}

	public function set_view($item = false)
	{
		global $db;

		if (!$item) return false;

		$db->query('UPDATE `prefix_items` SET `views` = `views` + 1 WHERE `id` = "' . ((int) $item['id']) . '"', __FILE__, __LINE__);
	}

	public function set_meta($item = false)
	{
		if (!$item) return false;

		$this->meta_title = empty($item['meta_title']) ? $item['public_title'] : $item['meta_title'];
		$this->meta_image = $item['image'];
		$this->meta_desc = $item['meta_desc'];
		$this->meta_keys = $item['meta_keys'];
	}

	public function get_plugins()
	{
		global $db;

		$plugins = $db->select('plugins', '*', ['status' => 1], __FILE__, __LINE__);

		return $plugins;
	}
};

$cl_template = new Template();

$g_users = $db->select('members', '*', [], __FILE__, __LINE__);
$g_users = array_column($g_users, null, 'id');
$g_users = array_map(function($val){
	$val['name'] = str_replace('^', '"', htmlspecialchars_decode($val['name']));
	$val['desc'] = str_replace('^', '"', htmlspecialchars_decode($val['desc']));
	unset($val['password']);

	return $val;
}, $g_users);

$g_fields = $db->select('fields', '*', [], __FILE__, __LINE__);
$g_fields = array_column($g_fields, null, 'id');
$g_fields = array_map(function($el){
	global $cl_template;

	if ($el['type'] == 'multiple_text' || $el['type'] == 'checkbox' || $el['type'] == 'select') {
		$value = $cl_template->get_lang_fields($el['value'], true);
		$value = empty($value) ? '{}' : $value;
		$value = json_decode($value, true);
		foreach ($value as $index => $val) {
			$value[$index] = str_replace('~^~', '"', htmlspecialchars_decode($val));
		}
		$el['value'] = $value;
	}
	return $el;
}, $g_fields);

// PLUGINS START
$plugins = $cl_template->get_plugins();
foreach ($plugins as $plugin) {
	$path = DIR_PLUGINS . $plugin['alias'] . '/frontend/api.php';
	if (file_exists($path)) require_once($path);
}
// PLUGINS END

function get_items($parent, $show_disabled = false)
{
	global $cl_template;

	return $cl_template->get_items($parent, $show_disabled);
};

function get_itemById($id, $show_disabled = false)
{
	global $cl_template;

	return $cl_template->get_itemById($id, $show_disabled);
};

function get_itemByAlias($alias, $show_disabled = false)
{
	global $cl_template;

	return $cl_template->get_itemByAlias($alias, $show_disabled);
};

function get_itemParent($item = false)
{
	global $cl_template;

	return $cl_template->get_itemParent($item);
};

function get_itemPrev($item = false)
{
	global $cl_template;

	return $cl_template->get_itemPrev($item);
};

function get_itemNext($item = false)
{
	global $cl_template;

	return $cl_template->get_itemNext($item);
};

function get_value($arr, $key, $default_value = '')
{
	global $g_fields;

	$arr = (array) $arr;
	$type_fields = array_key_exists($key, $g_fields) ? $g_fields[$key]['type'] : 'none';
	$value = (array_key_exists($key, $arr) && !empty($arr[$key]) ? $arr[$key] : $default_value);

	switch ($type_fields) {
		case 'text':
			
			break;

		case 'multiple_text':
			$value = explode('~;~', $value);
			$value = array_filter($value);
			$temp = [];
			foreach ($value as $el) {
				$q = explode('~:~', $el);
				$f = $g_fields[$key]['value'][$q[0]];
				$temp[] = [
					'id' => $q[0],
					'value' => $q[1],
					'name' => $f
				];
			}
			$value = $temp;
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
				$f = $g_fields[$key]['value'][$el];
				$temp[] = [
					'id' => $el,
					'name' => $f
				];
			}
			$value = $temp;
			break;

		case 'select':
			$value = empty($value) ? false : $value;
			if ($value) {
				$f = $g_fields[$key]['value'][$value];
				$value = [
					'id' => $value,
					'name' => $f
				];
			}
			break;

		case 'file':
			$file = get_file($value);
			if (!$file || empty($value)) $value = 0;
			break;

		case 'multiple_files':
			$value = explode(',', $value);
			$value = array_filter($value);
			$value = array_map(function($el){
				$file = get_file($el);
				if ($file) return $el;
			}, $value);
			$value = array_filter($value);
			$value = array_values($value);
			break;

		case 'video':
			$value = explode('~;~', $value);
			$value = array_filter($value);
			$value = array_map(function($el){
				$v = explode(';', $el);

				$thumb = false;
				$link = false;

				if ($v[0] == 'youtube') {
					$thumb = 'http://img.youtube.com/vi/' . $v[1] . '/0.jpg';
					$link = '//www.youtube.com/embed/' . $v[1] . '?rel=0';
				}
				if ($v[0] == 'vimeo') {
					// https://vimeo.com/api/v2/video/54178821.json
					$url = 'https://vimeo.com/api/v2/video/' . $v[1] . '.json';
					$thumb = json_decode(file_get_contents($url), true)[0]['thumbnail_large'];
					$link = '//player.vimeo.com/video/' . $v[1] . '?loop=1';
				}

				if ($thumb && $link) return [
					'video_service' => $v[0],
					'video_id' => $v[1],
					'thumb' => $thumb,
					'link' => $link
				];
			}, $value);
			break;

		case 'date':
			$value = (int) $value;
			break;

		case 'calendar':
			$value = explode('~;~', $value);
			$value = array_filter($value);
			$value = array_map(function($el){
				$date = explode(',', $el);
				$date = array_map(function($time){
					return (int) $time;
				}, $date);
				return $date;
			}, $value);
			break;

		case 'color':
			
			break;

		case 'users':
			
			break;

		case 'flag':
			$value = ($value == 1);
			break;

		case 'items':
			if (empty($value)) {
				$value = [];
			} else {
				$value = explode(';', $value);
				$value = array_map(function($id){
					$item = get_itemById($id);
					if ($item !== false) return (int) $id;
				}, $value);
				$value = array_filter($value);
				$value = array_values($value);
			}
			break;

		case 'base':
			if (empty($value)) {
				$value = [];
			} else {
				$value = explode(';', $value);
				$value = array_map(function($id){
					return (int) $id;
				}, $value);
				$value = array_filter($value);
				$value = array_values($value);
			}
			break;
	}

	return $value;
};

function get_file($id = 0)
{
	global $core;

	return $core->files->get_file($id);
};

function get_files($ids = [])
{
	global $cl_template;

	return $cl_template->get_files($ids);
};

function get_fileUrl($id = 0, $w = 0, $h = 0, $use_crop = 0, $watermark = false)
{
	global $core;

	return $core->files->getFileUrl($id, $w, $h, $use_crop, $watermark);
};

function getFileUrlDownload($id = 0)
{
	$id = (int) $id;

	return URL_SITE . 'file_download/' . $id;
};

function set_view($item = false)
{
	global $cl_template;

	$cl_template->set_view($item);
};

function set_meta($item = false)
{
	global $cl_template;

	$cl_template->set_meta($item);
};

function instagram_getFeed($username = false, $count = 10, $cache_minutes = 1440)
{
	global $cl_template;

	return $cl_template->instagram_getFeed($username, $count, $cache_minutes);
};

function head($styles = [])
{
	global $cl_template, $urls, $settings, $visitor, $core;

	$m_title = empty($cl_template->meta_title) ? $settings['siteTitle'] : $cl_template->meta_title . ' ‒ ' . $settings['siteTitle']; $m_title = str_replace('&shy;', '', $m_title);
	$m_image = empty($cl_template->meta_image) ? $settings['siteImage'] : $cl_template->meta_image;
	$m_desc = empty($cl_template->meta_desc) ? $settings['siteDescription'] : $cl_template->meta_desc;
	$m_keys = empty($cl_template->meta_keys) ? $settings['siteKeywords'] : $cl_template->meta_keys;

	$m_title = htmlspecialchars($m_title);
	$m_desc = htmlspecialchars($m_desc);
	$m_keys = htmlspecialchars($m_keys);

	echo '<meta charset="utf-8">
	<link rel="shortcut icon" href="' . URL_SITE . 'favicon.ico" type="image/vnd.microsoft.icon">
	<title>' . $m_title . '</title>
	<meta name="description" content="' . $m_desc . '">
	<meta name="keywords" content="' . $m_keys . '">
	<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

	<meta property="og:title" content="' . $m_title . '">
	<meta property="og:url" content="' . URL_SITE . implode('/', $urls) . '">
	<meta property="og:image" content="' . get_fileUrl($m_image) . '">
	<meta property="og:description" content="' . $m_desc . '">

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="' . $settings['twitterSite'] . '" />
	<meta name="twitter:creator" content="' . $settings['twitterSite'] . '" />
	<meta name="twitter:title" content="' . $m_title . '" />
	<meta name="twitter:url" content="' . URL_SITE . implode('/', $urls) . '" />
	<meta name="twitter:image" content="' . get_fileUrl($m_image, 200, 200) . '" />
	<meta name="twitter:description" content="' . $m_desc . '" />';
	// https://dev.twitter.com/cards
	// https://cards-dev.twitter.com/validator

	foreach ($styles as $style)
		echo '<link rel="stylesheet" href="' . $core->minify->file('css', $style) . '">';

	// Google Analytics
	$ga_use = (int) $settings['googleAnalyticsUse'];
	$ga_tracking = $settings['googleAnalyticsTracking'];
	if ($ga_use === 1 && !empty($ga_tracking) && !$visitor->is_admin)
		echo "<script>(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create','$ga_tracking',{allowAnchor:true});ga('send','pageview');</script>";
};

function foot($files = [])
{
	global $core;

	foreach ($files as $file)
		echo '<script src="' . $core->minify->file('js', $file) . '"></script>';
};

function get_langs($separator = ' | ', $container_start = '<div class="langs">', $container_end = '</div>')
{
	global $settings, $visitor;

	echo $container_start;

	$links = [];
	$langs = json_decode($settings['langFront'], true);
	foreach ($langs as $alias => $title) {
		$url = URL_SITE . 'lang/' . $alias;
		$active = $alias == $visitor->lang ? ' active' : '';
		$links[] = '<a href="' . $url . '" class="lang_' . $alias . $active . '">' . $title . '</a>';
	}
	echo implode($separator, $links);

	echo $container_end;
};

function translit($string, $direction = true){
	$rus = [
		"ж" => "zh", "ё" => "yo", "й" => "i'", "ю" => "yu",
		"ь" => "'", "ч" => "ch", "щ" => "sh'", "ц" => "c",
		"у" => "u", "к" => "k", "е" => "e", "н" => "n",
		"г" => "g", "ш" => "sh", "з" => "z", "х" => "h",
		"ъ" => "''", "ф" => "f", "ы" => "y", "в" => "v",
		"а" => "a", "п" => "p", "р" => "r", "о" => "o",
		"л" => "l", "д" => "d", "э" => "yе", "я" => "jа",
		"с" => "s", "м" => "m", "и" => "i", "т" => "t",
		"б" => "b", "Ё" => "yo", "Й" => "I", "Ю" => "YU",
		"Ч" => "CH", "Ь" => "'", "Щ" => "SH'", "Ц" => "C",
		"У" => "U", "К" => "K", "Е" => "E", "Н" => "N",
		"Г" => "G", "Ш" => "SH", "З" => "Z", "Х" => "H",
		"Ъ" => "''", "Ф" => "F", "Ы" => "Y", "В" => "V",
		"А" => "A", "П" => "P", "Р" => "R", "О" => "O",
		"Л" => "L", "Д" => "D", "Ж" => "Zh", "Э" => "Ye",
		"Я" => "Ja", "С" => "S", "М" => "M", "И" => "I",
		"Т" => "T", "Б" => "B"
	];
	$eng = [
		"SH'" => "Щ", "sh'" => "щ", "zh" => "ж", "Zh" => "Ж",
		"yo" => "ё", "Yu" => "Ю", "Ju" => "Ю", "ju" => "ю",
		"yu" => "ю", "sh" => "ш", "yе" => "э", "jа" => "я",
		"yа" => "я", "Sh" => "Ш", "CH" => "Ч", "ch" => "ч",
		"Yo" => "Ё", "Ya" => "Я", "Ja" => "Я", "Ye" => "Э",
		"i'" => "й", "i" => "и", "'" => "ь", "c" => "ц",
		"u" => "у", "k" => "к", "e" => "е", "n" => "н",
		"g" => "г", "z" => "з", "h" => "х", "''" => "ъ",
		"f" => "ф", "y" => "ы", "v" => "в", "a" => "а",
		"p" => "п", "r" => "р", "o" => "о", "l" => "л",
		"d" => "д", "s" => "с", "m" => "м", "t" => "т",
		"b" => "б", "I" => "Й", "'" => "Ь", "C" => "Ц",
		"U" => "У", "K" => "К", "E" => "Е", "N" => "Н",
		"G" => "Г", "Z" => "З", "H" => "Х", "''" => "Ъ",
		"F" => "Ф", "Y" => "Ы", "V" => "В", "A" => "А",
		"P" => "П", "R" => "Р", "O" => "О", "L" => "Л",
		"D" => "Д", "S" => "С", "M" => "М", "I" => "И",
		"T" => "Т", "B" => "Б"
	];
	return strtr($string, ($direction ? $rus : $eng));
};

function send_mail($sender, $to, $subject, $message, $from_mail = MAIL_DEVELOPER_BACKEND, $from_name = 'Admin')
{
	global $helpers;

	return $helpers->mail($sender, $to, $subject, $message, $from_mail, $from_name);
};

function relative_date($time)
{
	$today = strtotime(date('M j, Y'));
	$reldays = ($time - $today) / 86400;
	if ($reldays >= 0 && $reldays < 1) {
		return 'Today';
	} else if ($reldays >= 1 && $reldays < 2) {
		return 'Tomorrow';
	} else if ($reldays >= -1 && $reldays < 0) {
		return 'Yesterday';
	}
	if (abs($reldays) < 7) {
		if ($reldays > 0) {
			$reldays = floor($reldays);
			return 'In ' . $reldays . ' day' . ($reldays != 1 ? 's' : '');
		} else {
			$reldays = abs(floor($reldays));
			return $reldays . ' day' . ($reldays != 1 ? 's' : '') . ' ago';
		}
	}
	if (abs($reldays) < 182) {
		return date('l, j F',$time ? $time : time());
	} else {
		return date('l, j F, Y',$time ? $time : time());
	}
};

function get_image_matrix($image_scr){
	$image = imagecreatefrompng($image_scr);
	list($w, $h) = getimagesize($image_scr);

	$code = [];

	for ($h_i = 0; $h_i < $h; $h_i++) {
		for ($w_i = 0; $w_i < $w; $w_i++) {
			$code[] = [$w_i, $h_i];
		}
	}

	foreach ($code as $i => $el) {
		$rgb = imagecolorat($image, $el[0], $el[1]);

		$r = ($rgb >> 16) & 0xFF; $r = dechex($r); $r = str_pad($r, 2, "0", STR_PAD_LEFT);
		$g = ($rgb >> 8) & 0xFF; $g = dechex($g); $g = str_pad($g, 2, "0", STR_PAD_LEFT);
		$b = $rgb & 0xFF; $b = dechex($b); $b = str_pad($b, 2, "0", STR_PAD_LEFT);

		$code[$i][] = '#' . $r . $g . $b;
	}

	foreach ($code as $i => $el) {
		if ($el[2] === '#ffffff') unset($code[$i]);
	}

	imageDestroy($image);

	$code = array_values($code);

	return [
		'w' => $w,
		'h' => $h,
		'points' => $code
	];
};

// get_itemParent($item = false)
// instagram_getFeed($username = false, $count = 10, $cache_minutes = 1440)
// send_mail($sender, $to, $subject, $message, $from_mail = MAIL_DEVELOPER_BACKEND, $from_name = 'Admin')
/*
get_fileUrl($id, $w, $h, $crop, [
	// watermark
	'image' => false, // path to image
	'padding' => 0,
	'width' => 1,
	'height' => 1,
	'opacity' => 1,
	'x_align' => 'center',
	'y_align' => 'center'
])
*/
?>