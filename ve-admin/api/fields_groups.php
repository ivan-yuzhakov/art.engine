<?php
if ($section == 'fields_groups')
{
	switch ($query) {
		case 'add':
			$data = [
				'title'  => $_POST['title'],
				'settings' => $_POST['settings']
			];

			$json['id'] = $db->insert('fields_groups', $data, __FILE__, __LINE__);
			$json['status'] = $json['id'] > 0 ? 'OK' : 'FAIL';

			json($json);
		break;

		case 'edit':
			$data = [
				'title'  => $_POST['title'],
				'settings' => $_POST['settings']
			];

			$result = $db->update('fields_groups', $data, 'id', $_POST['id'], __FILE__, __LINE__);

			$json['status'] = $result ? 'OK' : 'FAIL';

			json($json);
		break;
	}
}
?>