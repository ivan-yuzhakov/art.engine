<?php
if ($section === 'fields')
{
	if ($query === 'get')
	{
		$fields = $db->select('fields', '*', [], __FILE__, __LINE__);
		$fields = array_column($fields, null, 'id');

		$groups = $db->select('fields_groups', '*', [], __FILE__, __LINE__);
		$groups = array_column($groups, null, 'id');

		json([
			'fields' => $fields,
			'groups' => $groups
		]);
	}

	if ($query === 'add')
	{
		$data = [
			'used'          => $_POST['used'],
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'type'          => $_POST['type'],
			'value'         => $_POST['value']
		];

		$json['id'] = $db->insert('fields', $data, __FILE__, __LINE__);
		$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'edit')
	{
		$data = [
			'used'          => $_POST['used'],
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'type'          => $_POST['type'],
			'value'         => $_POST['value']
		];

		$result = $db->update('fields', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'delete')
	{
		$result = $db->delete('fields', 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 't_items_get_items')
	{
		$parents = json_decode($_POST['json'], true)['parents'];

		$sorting = $db->select('sorting', ['sorting'], ['section' => 'items'], __FILE__, __LINE__);
		$sorting = explode(';', $sorting[0]['sorting']);
		$sorting = array_map(function($sort){
			return explode(':', $sort);
		}, $sorting);
		$sorting = array_column($sorting, 1, 0);

		$ids = [];

		function get_childs(&$ids, $sorting, $parent, $childs){
			foreach ($sorting as $i => $p) {
				if ($p == $parent) {
					$ids[] = $i;
					if ($childs) get_childs($ids, $sorting, $i, $childs);
				}
			}
		};

		foreach ($parents as $v) {
			get_childs($ids, $sorting, $v[0], $v[1]);
		}

		$items = $db->select('items', ['id', 'private_title'], ['id' => $ids], __FILE__, __LINE__);
		$items = array_column($items, 'private_title', 'id');
		$ids = array_flip($ids);
		$temp = array_replace($ids, $items);
		$items = [];

		foreach ($temp as $id => $v) {
			$items[] = [(int) $id, $v];
		}

		json(['items' => $items]);
	}
}
?>