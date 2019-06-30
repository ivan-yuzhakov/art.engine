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
			'private_title' => $_POST['private_title'],
			'public_title'  => $_POST['public_title'],
			'type'          => $_POST['type'],
			'value'         => $_POST['value']
		];

		$result = $db->update('fields', $data, 'id', $_POST['id'], __FILE__, __LINE__);

		$json['status'] = $result ? 'OK' : 'FAIL';

		json($json);
	}

	if ($query === 'fields_remove')
	{
		$id = (int) $_POST['id'];

		$db->delete('fields', 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}

	if ($query === 'groups_remove')
	{
		$id = (int) $_POST['id'];

		$db->delete('fields_groups', 'id', $id, __FILE__, __LINE__);

		json(['status' => true]);
	}

	if ($query === 't_items_get_items')
	{
		$parents = json_decode($_POST['json'], true)['parents'];

		$ids = [];

		function get_childs(&$ids, $parent, $nested){
			global $db;

			$items = $db->select('items', ['sc'], ['id' => $parent], __FILE__, __LINE__);
			if (empty($items)) return false;
			$childs = explode(',', $items[0]['sc']);
			$childs = array_filter($childs);
			$childs = array_map(function($s){
				return (int) $s;
			}, $childs);

			foreach ($childs as $id) {
				$ids[] = $id;
				if ($nested) get_childs($ids, $id, $nested);
			}
		};

		foreach ($parents as $v) {
			get_childs($ids, $v[0], $v[1]);
		}

		$items = [];
		if (!empty($ids)) {
			$items = $db->select('items', ['id', 'private_title'], ['id' => $ids], __FILE__, __LINE__);
			$items = array_column($items, 'private_title', 'id');
			$ids = array_flip($ids);
			$temp = array_replace($ids, $items);
			$items = [];
			foreach ($temp as $id => $v) {
				$items[] = [(int) $id, $v];
			}
		}

		json(['items' => $items]);
	}
}
?>