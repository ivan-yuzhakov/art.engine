<?php
if ($section === 'members')
{
	if ($query === 'get')
	{
		$users = $db->select('members', '*', [], __FILE__, __LINE__);
		$users = array_column($users, null, 'id');

		json([
			'members' => $users,
			'logged' => $visitor->id
		]);
	}

	if ($query === 'add')
	{
		if ($visitor->id == 1) {
			$data = [
				'login'    => $_POST['login'],
				'password' => sha1($_POST['password'] . SALT),
				'name'     => $_POST['name'],
				'phone'    => $_POST['phone'],
				'mail'     => $_POST['mail'],
				'image'    => $_POST['image'],
				'desc'     => $_POST['desc'],
				'access'   => 3
			];

			$json['id'] = $db->insert('members', $data, __FILE__, __LINE__);
			$json['status'] = $json['id'] > 1 ? 'OK' : 'FAIL';
		} else {
			$json['status'] = 'FAIL';
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'edit')
	{
		if ($visitor->id == 1 || $visitor->id == $_POST['id']) {
			$data = [
				'login'  => $_POST['login'],
				'desc'   => $_POST['desc'],
				'image'  => $_POST['image'],
				'mail'   => $_POST['mail'],
				'phone'  => $_POST['phone'],
				'name'   => $_POST['name'],
				'access' => $visitor->id == 1 ? 4 : 3
			];
			if (!empty($_POST['password'])) {
				$data['password'] = sha1($_POST['password'] . SALT);
			}

			$result = $db->update('members', $data, 'id', $_POST['id'], __FILE__, __LINE__);

			$json['status'] = $result ? 'OK' : 'FAIL';
		} else {
			$json['status'] = 'FAIL';
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}

	if ($query === 'delete')
	{
		if ($_POST['id'] == 1) {
			$json['status'] = 'FAIL';
			$json['error'] = 'You can not delete the administrator';
		} else if ($visitor->id == 1 || $visitor->id == $_POST['id']) {
			$result = $db->delete('members', 'id', $_POST['id'], __FILE__, __LINE__);

			$json['status'] = $result ? 'OK' : 'FAIL';
		} else {
			$json['status'] = 'FAIL';
			$json['error'] = 'You do not have permission';
		}

		json($json);
	}
}
?>