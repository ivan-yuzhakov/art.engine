<?php
if ($section === 'items')
{
	function str_random(){
		$chars = '0123456789';
		$numChars = strlen($chars);
		$string = '';

		for ($i = 0; $i < 20; $i++) {
			$string .= substr($chars, rand(1, $numChars) - 1, 1);
		}

		return $string;
	}
	function alias_req($str, $id = false){
		global $db, $helpers;

		$alias = $helpers->get_translit($str);

		if (empty($alias)) return alias_req(str_random(), $id);

		$items = $db->select('items', ['id'], ['alias' => $alias], __FILE__, __LINE__);

		if (empty($items) || (count($items) === 1 && $items[0]['id'] === $id)) {
			return $alias;
		} else {
			return alias_req(str_random(), $id);
		}
	}
	function get_sort($str){
		$sort = explode(',', $str);
		$sort = array_filter($sort);
		$sort = array_map(function($s){
			return (int) $s;
		}, $sort);

		return $sort;
	}

	if ($query === 'get_list_items')
	{
		$items = $db->select('items', ['id', 'show', 'private_title', 'sp', 'sc'], [], __FILE__, __LINE__);

		$items = array_map(function($item){
			$data = [
				$item['id'],
				$item['private_title'],
				$item['sp'],
				get_sort($item['sc'])
			];
			if ($item['show'] === 0) $data[] = 0;

			return $data;
		}, $items);

		json(['items' => $items, 'root' => get_sort($settings['sort_items_root'])]);
	}

	if ($query === 'get_item')
	{ // not used items.js admin
		$items = $db->select('items', '*', ['id' => $_POST['id']], __FILE__, __LINE__);

		$item = isset($items[0]) ? $items[0] : false;

		$json = [
			'status' => $item ? 'OK' : 'FAIL',
			'item' => $item
		];

		json($json);
	}

	if ($query === 'get_item_for_edit')
	{
		$id = (int) $_POST['id'];
		$interval = 5*60;

		$draft = $db->select('drafts', ['id', 'value', 'time'], ['section' => 'items', 'item' => $id], __FILE__, __LINE__);
		$draft = count($draft) ? $draft[0] : false;
		if ($draft) $draft['value'] = json_decode($draft['value']);

		$items = $db->select('items', '*', ['id' => $id], __FILE__, __LINE__);
		$status = @$items[0]['id'] === $id;
		$item = $items[0];

		if ($item['edited'] > 0) {
			if ($draft) {
				if ($draft['time'] + $interval < time()) $item['edited'] = 0;
			} else {
				if ($item['edited'] + $interval < time()) $item['edited'] = 0;
			}
		}

		if ($item['edited'] === 0) {
			$db->update('items', ['edited' => time()], 'id', $id, __FILE__, __LINE__);
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

		$db->update('items', ['edited' => 0], 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}

	if ($query === 'item_draft_create')
	{
		$data = [
			'section' => 'items',
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

	if ($query === 'get_item_url')
	{
		$id = (int) $_POST['id'];

		function get_parent(&$parents, $id, $p = null){
			global $db;

			if ($p === null) {
				$parent = $db->select('items', ['sp'], ['id' => $id], __FILE__, __LINE__);
				$parent = $parent[0]['sp'];
			} else {
				$parent = $p;
			}

			if ($parent !== 0) {
				$items = $db->select('items', ['alias', 'sp'], ['id' => $parent], __FILE__, __LINE__);
				$parents[] = $items[0]['alias'];

				get_parent($parents, $parent, $items[0]['sp']);
			}
		};
		$parents = [];
		get_parent($parents, $id);
		$parents = array_reverse($parents);

		json([
			'status' => true,
			'parents' => $parents
		]);
	}

	if ($query === 'edit_item_status')
	{
		$core->cache->clearCache('theme_');

		$result = $db->update('items', [
			'show' => $_POST['show'],
			'date_change' => time(),
		], 'id', $_POST['ids'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'clone_items')
	{
		$core->cache->clearCache('theme_');

		function check_alias($alias){
			global $db;

			$items = $db->select('items', ['id'], ['alias' => $alias . '_'], __FILE__, __LINE__);

			if (empty($items)) {
				return $alias . '_';
			} else {
				return check_alias($alias . '_');
			}
		};

		$items = $db->select('items', '*', ['id' => $_POST['ids']], __FILE__, __LINE__);

		$items = array_map(function($item){
			global $db, $visitor;

			$id = $item['id'];

			unset($item['id']);
			$item['show'] = 0;
			$item['user'] = $visitor->id;
			$item['views'] = 0;
			$item['alias'] = check_alias($item['alias']);
			$item['date_added'] = time();
			$item['date_change'] = time();
			$item['edited'] = 0;
			$item['sc'] = '';

			$id_insert = $db->insert('items', $item, __FILE__, __LINE__);

			return [
				'insert' => $id_insert,
				'id' => $id
			];
		}, $items);
		$items = array_column($items, 'insert', 'id');

		$sorting = [];
		foreach ($_POST['ids'] as $id) {
			if (isset($items[$id])) $sorting[] = $items[$id];
		}
		$sorting = implode(',', $sorting);

		$parent = (int) $_POST['parent'];
		if ($parent === 0) {
			$db->query('UPDATE `prefix_settings` SET `value` = CONCAT("' . $sorting . ',", `value`) WHERE `variable` = "sort_items_root"', __FILE__, __LINE__);
		} else {
			$db->query('UPDATE `prefix_items` SET `sc` = CONCAT("' . $sorting . '", ",", `sc`) WHERE `id` = ' . $parent, __FILE__, __LINE__);
		}

		json(['status' => true]);
	}

	if ($query === 'alias_item')
	{// not used items.js admin
		$alias = alias_req($_POST['alias'], (int) $_POST['id']);

		json(['alias' => $alias]);
	}

	if ($query === 'add_item')
	{
		$core->cache->clearCache('theme_');

		$alias = alias_req($_POST['alias']);
		$parent = (int) $_POST['parent'];

		$data = [
			'user'          => (isset($visitor->id) ? $visitor->id : -1),
			'show'          => 0,
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'alias'         => $alias,
			'meta_title'    => $_POST['meta_title'],
			'meta_desc'     => $_POST['meta_desc'],
			'meta_keys'     => $_POST['meta_keys'],
			'desc'          => $_POST['desc'],
			'image'         => $_POST['image'],
			'fields'        => $_POST['fields'],
			'group'         => $_POST['group'],
			'sp'            => $parent,
			'sc'            => '',
			'date_added'    => time(),
			'date_change'   => time(),
			'edited'        => 0
		];

		$json['id'] = $db->insert('items', $data, __FILE__, __LINE__);
		$json['alias'] = $alias;
		$json['status'] = $json['id'] > 0;

		if ($parent === 0) {
			$db->query('UPDATE `prefix_settings` SET `value` = CONCAT("' . $json['id'] . ',", `value`) WHERE `variable` = "sort_items_root"', __FILE__, __LINE__);
		} else {
			$db->query('UPDATE `prefix_items` SET `sc` = CONCAT("' . $json['id'] . ',", `sc`) WHERE `id` = ' . $parent, __FILE__, __LINE__);
		}

		json($json);
	}

	if ($query === 'edit_item')
	{
		$core->cache->clearCache('theme_');

		$id = (int) $_POST['id'];
		$alias = alias_req($_POST['alias'], $id);

		$data = [
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'alias'         => $alias,
			'meta_title'    => $_POST['meta_title'],
			'meta_desc'     => $_POST['meta_desc'],
			'meta_keys'     => $_POST['meta_keys'],
			'desc'          => $_POST['desc'],
			'image'         => $_POST['image'],
			'fields'        => $_POST['fields'],
			'group'         => $_POST['group'],
			'date_change'   => time(),
			'edited'        => time()
		];

		$db->update('items', $data, 'id', $id, __FILE__, __LINE__);

		$draft = $db->select('drafts', ['id'], ['section' => 'items', 'item' => $id], __FILE__, __LINE__);
		$draft = count($draft) ? $draft[0] : false;
		if ($draft) $db->delete('drafts', 'id', $draft['id'], __FILE__, __LINE__);

		json(['status' => true, 'alias' => $alias]);
	}

	if ($query === 'remove_items')
	{
		$ids = $_POST['ids'];
		$parent = (int) $_POST['parent'];
		$all = [];
		$valid = true;
		$interval = 5*60;

		function get_childs(&$all, $ids){
			global $db;

			foreach ($ids as $id) {
				$items = $db->select('items', ['id', 'sc', 'edited'], ['id' => $id], __FILE__, __LINE__);
				$item = $items[0] ?: false;
				if ($item) {
					$item['sc'] = get_sort($item['sc']);
					$all[] = $item;
					get_childs($all, $item['sc']);
				}
			}
		};
		get_childs($all, $ids);

		foreach ($all as $el) {
			if ($el['edited'] + $interval > time()) $valid = false;
		}

		if ($valid) {
			$els = array_column($all, 'id');

			$db->delete('items', 'id', $els, __FILE__, __LINE__);

			$draft = $db->select('drafts', ['id'], ['section' => 'items', 'item' => $els], __FILE__, __LINE__);
			$draft = array_column($draft, 'id');
			if (!empty($draft)) $db->delete('drafts', 'id', $draft, __FILE__, __LINE__);

			if ($parent === 0) {
				$sort = get_sort($settings['sort_items_root']);
				foreach ($els as $id) {
					$key = array_search($id, $sort);
					if ($key !== false) $sort[$key] = false;
				}
				$sort = array_filter($sort);
				$sort = array_values($sort);
				$s = implode(',', $sort);
				$db->query('UPDATE `prefix_settings` SET `value` = "' . $s . '" WHERE `variable` = "sort_items_root"', __FILE__, __LINE__);
			} else {
				$items = $db->select('items', ['sc'], ['id' => $parent], __FILE__, __LINE__);
				$item = $items[0] ?: false;
				if ($item) {
					$sort = get_sort($item['sc']);
					foreach ($els as $id) {
						$key = array_search($id, $sort);
						if ($key !== false) $sort[$key] = false;
					}
					$sort = array_filter($sort);
					$sort = array_values($sort);
					$s = implode(',', $sort);
				}
				$db->query('UPDATE `prefix_items` SET `sc` = "' . $s . '" WHERE `id` = ' . $parent, __FILE__, __LINE__);
			}

			$core->cache->clearCache('theme_');

			$json['status'] = true;
			$json['parent_id'] = $parent;
			$json['parent_sort'] = $sort;
			$json['removed'] = $els;
		} else {
			$json['status'] = 'edited';
		}

		json($json);
	}

	if ($query === 'edit_sorting')
	{
		$sort = $_POST['items'];

		foreach ($sort as $s) {
			$id = (int) $s[0];
			if ($id === 0) {
				$db->update('settings', ['value' => $s[2]], 'variable', 'sort_items_root', __FILE__, __LINE__);
			} else {
				$data = [];
				if ($s[1] === 'parent') {
					$data['sp'] = (int) $s[2];
				} else {
					$data['sc'] = $s[2];
				}
				$db->update('items', $data, 'id', $id, __FILE__, __LINE__);
			}
		}

		$core->cache->clearCache('theme_');

		json(['status' => true]);
	}

	if ($query === 'publishing_facebook_group')
	{
		require_once(DIR_CORE . 'library/Facebook/autoload.php');

		$fb = new Facebook\Facebook([
			'app_id' => $settings['facebookAppID'],
			'app_secret' => $settings['facebookAppSecret'],
			'default_graph_version' => 'v2.5',
		]);

		$group_id = $settings['facebookGroupId'];
		$token = $settings['facebookToken'];
		$data = [
			'link' => $_POST['link'],
			'message' => $_POST['message'],
			//'source' => $fb->fileToUpload(DIR_FILES . $_POST['image']),
		];

		try {
			$response = $fb->post('/' . $group_id . '/feed', $data, $token);
			$graphNode = $response->getGraphNode();
			$json['status'] = 'OK';
			$json['id'] = $graphNode['id'];
		} catch(Facebook\Exceptions\FacebookResponseException $e) {
			$json['status'] = 'FAIL';
			$json['error'] = 'Graph returned an error: ' . $e->getMessage();
		} catch(Facebook\Exceptions\FacebookSDKException $e) {
			$json['status'] = 'FAIL';
			$json['error'] = 'Facebook SDK returned an error: ' . $e->getMessage();
		}

		json($json);
	}

	if ($query === 'publishing_facebook_pages')
	{
		require_once(DIR_CORE . 'library/Facebook/autoload.php');

		$fb = new Facebook\Facebook([
			'app_id' => $settings['facebookAppID'],
			'app_secret' => $settings['facebookAppSecret'],
			'default_graph_version' => 'v2.5',
		]);

		$page_id = $_POST['page'];
		$token = $_POST['token'];
		$data = [
			'link' => $_POST['link'],
			'message' => $_POST['message'],
			//'source' => $fb->fileToUpload(DIR_FILES . $_POST['image']),
		];

		try {
			$response = $fb->post('/' . $page_id . '/feed', $data, $token);
			$graphNode = $response->getGraphNode();
			$json['status'] = 'OK';
			$json['id'] = $graphNode['id'];
		} catch(Facebook\Exceptions\FacebookResponseException $e) {
			$json['status'] = 'FAIL';
			$json['error'] = 'Graph returned an error: ' . $e->getMessage();
		} catch(Facebook\Exceptions\FacebookSDKException $e) {
			$json['status'] = 'FAIL';
			$json['error'] = 'Facebook SDK returned an error: ' . $e->getMessage();
		}

		json($json);
	}
}
?>