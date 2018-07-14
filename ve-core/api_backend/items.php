<?php
if ($section === 'items')
{
	if ($query === 'get_last_update')
	{
		$items = $db->select('settings', ['variable', 'value'], [
			'variable' => ['lastUpdateItems', 'lastUpdateItemsSorting']
		], __FILE__, __LINE__);

		$items = array_column($items, 'value', 'variable');

		json($items);
	}

	if ($query === 'get_list_items')
	{
		$items = $db->select('items', ['id', 'show', 'private_title'], [], __FILE__, __LINE__);

		$items = array_map(function($item){
			$data = [
				$item['id'],
				$item['private_title']
			];
			if ($item['show'] === 0) $data[] = 0;

			return $data;
		}, $items);

		json($items);
	}

	if ($query === 'get_list_sorting')
	{
		$items = $db->select('sorting', ['sorting'], ['section' => 'items'], __FILE__, __LINE__);

		$items = $items[0];

		json($items);
	}

	if ($query === 'get_item')
	{
		$items = $db->select('items', '*', ['id' => $_POST['id']], __FILE__, __LINE__);

		$item = isset($items[0]) ? $items[0] : false;

		$json = [
			'status' => $item ? 'OK' : 'FAIL',
			'item' => $item
		];

		json($json);
	}

	if ($query === 'get_item_url')
	{
		$sorting = $db->select('sorting', ['sorting'], ['section' => 'items'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		$sorting = array_map(function($sort){
			return explode(':', $sort);
		}, $sorting);
		$sorting = array_column($sorting, 1, 0);

		function get_parent(&$parents, $id, $sorting){
			global $db;

			$parent = $sorting[$id];

			if ($parent !== '#') {
				$items = $db->select('items', ['alias'], ['id' => $parent], __FILE__, __LINE__);
				$parents[] = $items[0]['alias'];

				get_parent($parents, $parent, $sorting);
			}
		};
		$parents = [];
		get_parent($parents, $_POST['id'], $sorting);
		$parents = array_reverse($parents);

		$json = [
			'status' => 'OK',
			'parents' => $parents
		];

		json($json);
	}

	if ($query === 'edit_item_status')
	{
		$core->cache->clearCache('theme_');

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);

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

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItemsSorting', __FILE__, __LINE__);

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

			$id_insert = $db->insert('items', $item, __FILE__, __LINE__);

			return [
				'insert' => $id_insert,
				'id' => $id
			];
		}, $items);
		$items = array_column($items, 'insert', 'id');

		$sorting = [];
		foreach ($_POST['ids'] as $id) {
			if (isset($items[$id])) $sorting[] = $items[$id] . ':' . $_POST['parent'];
		}
		$sorting = implode(';', $sorting);

		$db->query('UPDATE `prefix_sorting` SET `sorting` = CONCAT("' . $sorting . '", ";", `sorting`) WHERE `section` = "items"', __FILE__, __LINE__);

		$json['status'] = 'OK';

		json($json);
	}

	if ($query === 'alias_item')
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
		function alias_req($str, $id){
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
		$alias = alias_req($_POST['alias'], (int) $_POST['id']);

		json(['status' => 'OK', 'alias' => $alias]);
	}

	if ($query === 'add_item')
	{
		$core->cache->clearCache('theme_');

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItemsSorting', __FILE__, __LINE__);

		$data = [
			'user'          => (isset($visitor->id) ? $visitor->id : -1),
			'show'          => 0,
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'alias'         => $_POST['alias'],
			'meta_title'    => $_POST['meta_title'],
			'meta_desc'     => $_POST['meta_desc'],
			'meta_keys'     => $_POST['meta_keys'],
			'desc'          => $_POST['desc'],
			'image'         => $_POST['image'],
			'fields'        => $_POST['fields'],
			'group'         => $_POST['group'],
			'date_added'    => time(),
			'date_change'   => time(),
		];

		$json['id'] = $db->insert('items', $data, __FILE__, __LINE__);
		$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

		$db->query('UPDATE `prefix_sorting` SET `sorting` = CONCAT("' . $json['id'] . ':' . $_POST['parent'] . '", ";", `sorting`) WHERE `section` = "items"', __FILE__, __LINE__);

		json($json);
	}

	if ($query === 'edit_item')
	{
		$core->cache->clearCache('theme_');

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);

		$data = [
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'alias'         => $_POST['alias'],
			'meta_title'    => $_POST['meta_title'],
			'meta_desc'     => $_POST['meta_desc'],
			'meta_keys'     => $_POST['meta_keys'],
			'desc'          => $_POST['desc'],
			'image'         => $_POST['image'],
			'fields'        => $_POST['fields'],
			'group'         => $_POST['group'],
			'date_change'   => time(),
		];

		$result = $db->update('items', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'remove_items')
	{
		$core->cache->clearCache('theme_');

		$sorting = $db->select('sorting', ['sorting'], ['section' => 'items'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		$sorting = array_map(function($sort){
			return explode(':', $sort);
		}, $sorting);
		$sorting = array_column($sorting, 1, 0);

		function get_childs($ids, $sorting){
			$new_ids = [];

			if (!empty($ids)) {
				foreach ($sorting as $id => $parent) {
					$k = array_search($parent, $ids);

					if ($k !== false) $new_ids[] = $id;
				}

				$new_ids = array_merge($new_ids, get_childs($new_ids, $sorting));
			}

			return $new_ids;
		};
		$ids = array_merge($_POST['ids'], get_childs($_POST['ids'], $sorting));

		foreach ($ids as $id) {
			unset($sorting[$id]);
		}
		array_walk($sorting, function(&$v, $k){
			$v = $k . ':' . $v;
		});

		$db->update('sorting', [
			'sorting' => implode(';', $sorting)
		], 'section', 'items', __FILE__, __LINE__);

		$result = $db->delete('items', 'id', $ids, __FILE__, __LINE__);

		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItems', __FILE__, __LINE__);
		$db->update('settings', [
			'value' => time()
		], 'variable', 'lastUpdateItemsSorting', __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
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